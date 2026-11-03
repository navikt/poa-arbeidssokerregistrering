import { JaEllerNei } from '@navikt/arbeidssokerregisteret-utils';
import {
    assertAxeClean,
    assertReflow,
    assertTextSpacing,
    chooseRadioByValue,
    expect,
    pressByKeyboard,
    test,
} from './uu-fixtures';
import { nesteSteg, type Skjemaside, type TestSprak, ventPaSkjemaside } from './uu-skjemaflyt';

const sprak = ['nb', 'nn', 'en'] as const;
const editNames: Record<TestSprak, Record<'situasjon' | 'stilling' | 'utdanning' | 'hindringer', RegExp>> = {
    nb: {
        situasjon: /endre svaret: situasjon/i,
        stilling: /endre svaret: siste stilling/i,
        utdanning: /endre svaret: utdanning/i,
        hindringer: /endre svaret: hindringer/i,
    },
    nn: {
        situasjon: /endre svaret: situasjon/i,
        stilling: /endre svaret: siste stilling/i,
        utdanning: /endre svaret: utdanning/i,
        hindringer: /endre svaret: hindringar/i,
    },
    en: {
        situasjon: /change your reply: situation/i,
        stilling: /change your reply: last position/i,
        utdanning: /change your reply: education/i,
        hindringer: /change your reply: challenges/i,
    },
};

async function gotoOppdatering(page: import('@playwright/test').Page, language: TestSprak) {
    await page.goto(language === 'nb' ? './oppdater-opplysninger' : `./${language}/oppdater-opplysninger`);
    await expect(page).toHaveURL(/\/oppdater-opplysninger\/5\/?$/);
    await ventPaSkjemaside(page, 5, language, 'oppdater-opplysninger');
    await expect(page.locator('#skjema-steg-5')).toBeFocused({ timeout: 10_000 });
}

async function lesConfig(page: import('@playwright/test').Page) {
    const current = new URL(page.url());
    const response = await page.request.get(`${current.origin}/arbeid/registrering/api/config`);
    expect(response.ok()).toBe(true);
    return (await response.json()) as { arbeidssoekerregisteretUrl: string };
}

function normaliserDestinasjon(target: string) {
    const urlValue = typeof target === 'string' ? target.trim() : '';
    expect(urlValue, 'api/config skal inneholde arbeidssoekerregisteretUrl').not.toBe('');
    let url: URL;
    try {
        url = new URL(urlValue);
    } catch {
        throw new Error('api/config arbeidssoekerregisteretUrl må være en absolutt HTTPS-URL.');
    }
    expect(url.protocol, 'arbeidssoekerregisteretUrl må bruke HTTPS').toBe('https:');
    return url.href;
}

async function stubEksternDestinasjon(page: import('@playwright/test').Page, target: string) {
    await page.route(
        (url) => url.href === target,
        async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: '<!doctype html><html lang="nb"><head><title>Test destination</title></head><body>External navigation captured</body></html>',
            });
        },
    );
}

for (const language of sprak) {
    test(`@uu oppdatering på ${language}: oppsummering, keyboardredigering av alle fire felt og axe`, async ({
        page,
    }, testInfo) => {
        await gotoOppdatering(page, language);
        const summary = await ventPaSkjemaside(page, 5, language, 'oppdater-opplysninger');
        await expect(summary.getByRole('link', { name: /endre svaret|change your reply/i })).toHaveCount(4);
        await assertAxeClean(page, testInfo, `oppdatering-${language}-oppsummering`);

        const edits: Array<{ key: keyof (typeof editNames)[typeof language]; side: Skjemaside }> = [
            { key: 'situasjon', side: 1 },
            { key: 'stilling', side: 2 },
            { key: 'utdanning', side: 3 },
            { key: 'hindringer', side: 4 },
        ];
        for (const edit of edits) {
            await pressByKeyboard(page, page.getByRole('link', { name: editNames[language][edit.key] }));
            await ventPaSkjemaside(page, edit.side, language, 'oppdater-opplysninger');
            await expect(page.locator(`#skjema-steg-${edit.side}`)).toBeFocused({ timeout: 10_000 });
            await assertAxeClean(page, testInfo, `oppdatering-${language}-rediger-side-${edit.side}`);
            let currentSide = edit.side;
            while (currentSide < 5) {
                currentSide = await nesteSteg(page, currentSide, language, 'oppdater-opplysninger');
                if (currentSide < 5) {
                    await assertAxeClean(page, testInfo, `oppdatering-${language}-navigert-side-${currentSide}`);
                }
            }
            await ventPaSkjemaside(page, 5, language, 'oppdater-opplysninger');
            await assertAxeClean(page, testInfo, `oppdatering-${language}-oppsummering-etter-${edit.key}`);
        }
    });
}

test('@uu oppdatering: endret svar vises i oppsummering og er valgt ved ny redigering', async ({ page }, testInfo) => {
    await gotoOppdatering(page, 'nb');
    await assertAxeClean(page, testInfo, 'oppdatering-svar-for-endring');
    await pressByKeyboard(page, page.getByRole('link', { name: editNames.nb.hindringer }));
    await ventPaSkjemaside(page, 4, 'nb', 'oppdater-opplysninger');
    await expect(page.locator('#skjema-steg-4')).toBeFocused({ timeout: 10_000 });
    await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(1));
    await nesteSteg(page, 4, 'nb', 'oppdater-opplysninger');

    const summary = await ventPaSkjemaside(page, 5, 'nb', 'oppdater-opplysninger');
    const answer = summary.locator('dt').filter({ hasText: 'Andre hensyn' }).locator('xpath=following-sibling::dd[1]');
    await expect(answer).toHaveText('Nei');
    await assertAxeClean(page, testInfo, 'oppdatering-svar-etter-endring');
    await pressByKeyboard(page, page.getByRole('link', { name: editNames.nb.hindringer }));
    await ventPaSkjemaside(page, 4, 'nb', 'oppdater-opplysninger');
    await expect(page.locator('#skjema-steg-4')).toBeFocused({ timeout: 10_000 });
    await expect(
        page.getByRole('radiogroup').nth(1).locator(`input[type="radio"][value="${JaEllerNei.NEI}"]`),
    ).toBeChecked();
});

test('@uu oppdatering: oppsummering og redigert flerfeltside tåler reflow og tekstavstand', async ({ page }) => {
    await gotoOppdatering(page, 'nb');
    await assertReflow(page, 'oppdatering-oppsummering');
    await assertTextSpacing(page, 'oppdatering-oppsummering');
    await pressByKeyboard(page, page.getByRole('link', { name: editNames.nb.utdanning }));
    await ventPaSkjemaside(page, 3, 'nb', 'oppdater-opplysninger');
    await expect(page.locator('#skjema-steg-3')).toBeFocused({ timeout: 10_000 });
    await assertReflow(page, 'oppdatering-utdanning');
    await assertTextSpacing(page, 'oppdatering-utdanning');
});

test('@uu oppdatering: avbryt går til konfigurert ekstern destinasjon', async ({ page }) => {
    await gotoOppdatering(page, 'nb');
    const config = await lesConfig(page);
    const target = normaliserDestinasjon(config.arbeidssoekerregisteretUrl);
    await stubEksternDestinasjon(page, target);
    await pressByKeyboard(page, page.getByRole('link', { name: /avbryt oppdatering/i }));
    await expect(page).toHaveURL(target);
    await expect(page.getByText('External navigation captured')).toBeVisible();
});

test('@uu oppdatering: innsending poster lokalt og går til konfigurert ekstern destinasjon', async ({ page }) => {
    await gotoOppdatering(page, 'nb');
    const config = await lesConfig(page);
    const target = normaliserDestinasjon(config.arbeidssoekerregisteretUrl);
    const appOrigin = new URL(page.url()).origin;
    await stubEksternDestinasjon(page, target);
    const apiResponse = page.waitForResponse(
        (response) =>
            new URL(response.url()).pathname.endsWith('/api/opplysninger') && response.request().method() === 'POST',
    );
    await pressByKeyboard(page, page.getByRole('button', { name: 'Oppdater opplysninger', exact: true }));
    const response = await apiResponse;
    expect(response.status()).toBe(200);
    expect(new URL(response.url()).origin).toBe(appOrigin);
    await expect(page).toHaveURL(target);
    await expect(page.getByText('External navigation captured')).toBeVisible();
});
