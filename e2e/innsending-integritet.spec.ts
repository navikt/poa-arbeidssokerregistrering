import { DinSituasjon, JaEllerNei, UtdanningGodkjentValg, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';
import type { Page } from '@playwright/test';
import { chooseRadioByValue, expect, test } from './uu-fixtures';
import { fyllUtTilOppsummering, nesteSteg, startRegistrering } from './uu-skjemaflyt';

/**
 * Integritetstester for internkontroll: det brukeren svarer i skjemaet, er det som sendes til backend,
 * og registreringen starter alltid en arbeidssøkerperiode før opplysningene sendes.
 * Se docs/integritetstesting.md.
 */

type Kall = { endepunkt: 'start' | 'opplysninger'; metode: string; kropp: unknown };

async function fangKall(page: Page, svar: { start?: number; opplysninger?: number } = {}) {
    const kall: Kall[] = [];
    await page.route('**/api/start-arbeidssokerperiode-v2**', async (route) => {
        const req = route.request();
        kall.push({ endepunkt: 'start', metode: req.method(), kropp: req.postData() });
        await route.fulfill({ status: svar.start ?? 204 });
    });
    await page.route('**/api/opplysninger**', async (route) => {
        const req = route.request();
        kall.push({ endepunkt: 'opplysninger', metode: req.method(), kropp: req.postDataJSON() });
        await route.fulfill({ status: svar.opplysninger ?? 200, json: {} });
    });
    return kall;
}

async function sendInn(page: Page) {
    await page.getByTestId('fullfor-registrering').click();
}

test.describe('Integritet i innsendingen', () => {
    test('sender nøyaktig de svarene brukeren valgte, etter at perioden er startet', async ({ page }) => {
        const kall = await fangKall(page);
        await startRegistrering(page);

        await chooseRadioByValue(page, DinSituasjon.ALDRI_HATT_JOBB, page.getByRole('radiogroup').nth(0));
        await nesteSteg(page, 1);
        await chooseRadioByValue(
            page,
            Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
            page.getByRole('radiogroup').nth(0),
        );
        await chooseRadioByValue(page, UtdanningGodkjentValg.JA, page.getByRole('radiogroup').nth(1));
        await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(2));
        await nesteSteg(page, 3);
        await chooseRadioByValue(page, JaEllerNei.JA, page.getByRole('radiogroup').nth(0));
        await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(1));
        await nesteSteg(page, 4);

        await sendInn(page);
        await expect(page).toHaveURL(/\/kvittering\/?$/);

        expect(kall.map((k) => k.endepunkt)).toEqual(['start', 'opplysninger']);
        expect(kall[0].metode).toBe('PUT');
        expect(kall[0].kropp ?? null).toBeNull();
        expect(kall[1].metode).toBe('POST');
        expect(kall[1].kropp).toEqual({
            opplysningerOmArbeidssoeker: {
                utdanning: { nus: '7', godkjent: 'JA', bestaatt: 'NEI' },
                helse: { helsetilstandHindrerArbeid: 'JA' },
                jobbsituasjon: { beskrivelser: [{ beskrivelse: 'ALDRI_HATT_JOBB' }] },
                annet: { andreForholdHindrerArbeid: 'NEI' },
            },
        });
    });

    test('sender situasjon og siste jobb fra skjemaet', async ({ page }) => {
        const kall = await fangKall(page);
        await startRegistrering(page);
        await fyllUtTilOppsummering(page);

        await sendInn(page);
        await expect(page).toHaveURL(/\/kvittering\/?$/);

        expect(kall.map((k) => k.endepunkt)).toEqual(['start', 'opplysninger']);
        const opplysninger = (kall[1].kropp as any).opplysningerOmArbeidssoeker;
        expect(opplysninger.utdanning).toEqual({ nus: '0' });
        expect(opplysninger.helse).toEqual({ helsetilstandHindrerArbeid: 'NEI' });
        expect(opplysninger.annet).toEqual({ andreForholdHindrerArbeid: 'NEI' });
        expect(opplysninger.jobbsituasjon.beskrivelser).toHaveLength(1);
        expect(opplysninger.jobbsituasjon.beskrivelser[0].beskrivelse).toBe('HAR_BLITT_SAGT_OPP');
        expect(opplysninger.jobbsituasjon.beskrivelser[0].detaljer).toEqual(
            expect.objectContaining({ stilling: expect.any(String), stilling_styrk08: expect.any(String) }),
        );
    });

    test('sender ikke opplysninger og viser ikke kvittering når start av periode feiler', async ({ page }) => {
        const kall = await fangKall(page, { start: 500 });
        await startRegistrering(page);
        await fyllUtTilOppsummering(page);

        await sendInn(page);
        await expect(page).toHaveURL(/\/feil\/?$/);

        expect(kall.map((k) => k.endepunkt)).toEqual(['start']);
    });

    test('viser ikke kvittering når innsending av opplysninger feiler', async ({ page }) => {
        const kall = await fangKall(page, { opplysninger: 500 });
        await startRegistrering(page);
        await fyllUtTilOppsummering(page);

        await sendInn(page);
        await expect(page).toHaveURL(/\/feil\/?$/);

        expect(kall.map((k) => k.endepunkt)).toEqual(['start', 'opplysninger']);
    });
});
