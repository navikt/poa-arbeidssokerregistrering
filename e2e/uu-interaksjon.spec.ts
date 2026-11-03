import { DinSituasjon, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';
import type { Locator } from '@playwright/test';
import {
    assertAxeClean,
    assertFocusVisible,
    assertRadioError,
    assertReflow,
    assertTextSpacing,
    chooseRadioByValue,
    expect,
    pressByKeyboard,
    test,
} from './uu-fixtures';
import { fyllUtTilOppsummering, nesteSteg, startRegistrering } from './uu-skjemaflyt';

async function assertRadioHasNoError(group: Locator) {
    const errorState = await group.evaluate((element) => {
        const describedBy = [element, ...Array.from(element.querySelectorAll('input[type="radio"]'))].flatMap((node) =>
            (node.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
        );
        const hasDescribedError = describedBy.some((id) =>
            document.getElementById(id)?.classList.contains('aksel-fieldset__error'),
        );
        const invalid =
            element.getAttribute('aria-invalid') === 'true' ||
            Array.from(element.querySelectorAll('input[type="radio"]')).some(
                (radio) => radio.getAttribute('aria-invalid') === 'true',
            );
        return { hasDescribedError, invalid };
    });

    expect(errorState.invalid).toBe(false);
    expect(errorState.hasDescribedError).toBe(false);
    await expect(group).not.toHaveAttribute('data-error-message');
}

test.describe('Skjemainteraksjoner @uu', () => {
    for (const sprak of ['nb', 'nn', 'en'] as const) {
        test(`tomt første steg viser tilgjengelig feilmelding med tastatur (${sprak})`, async ({ page }, testInfo) => {
            await startRegistrering(page, sprak);
            const url = page.url();
            const neste = page.getByRole('button', { name: /Neste steg|Next step/ });

            await pressByKeyboard(page, neste);

            await expect(page).toHaveURL(url);
            const gruppe = page.getByRole('radiogroup').first();
            await assertRadioError(gruppe);
            await expect
                .poll(() =>
                    gruppe.evaluate(
                        (element) => element === document.activeElement || element.contains(document.activeElement),
                    ),
                )
                .toBe(true);
            await assertAxeClean(page, testInfo, `tomt første steg ${sprak}`);
            await assertTextSpacing(page, `tomt første steg ${sprak}`);
        });
    }

    test('feiloppsummeringen leder til utdanningsspørsmål og oppdateres når svar rettes', async ({ page }) => {
        await startRegistrering(page);
        await chooseRadioByValue(page, DinSituasjon.MISTET_JOBBEN, page.getByRole('radiogroup').first());
        await nesteSteg(page, 1);
        await nesteSteg(page, 2);

        const utdanning = page.getByRole('radiogroup').first();
        const hoyesteNiva = utdanning.locator('input[type="radio"]').last();
        const hoyesteVerdi = await hoyesteNiva.getAttribute('value');
        if (!hoyesteVerdi) throw new Error('Highest education radio has no value');
        await chooseRadioByValue(page, hoyesteVerdi, utdanning);

        await pressByKeyboard(page, page.getByRole('button', { name: /Neste steg/ }));

        const feiloppsummering = page.locator('.aksel-error-summary');
        const feillenker = feiloppsummering.getByRole('link');
        await expect(feiloppsummering).toBeVisible();
        await expect(feillenker).toHaveCount(2);
        await expect(
            page.getByRole('heading', { name: /Du må rette disse feilene før du kan fortsette/ }),
        ).toBeFocused();

        const gruppeHrefs: string[] = [];
        for (let index = 0; index < 2; index += 1) {
            const feillenke = feillenker.nth(index);
            const href = await feillenke.getAttribute('href');
            expect(href).toMatch(/^#radio-gruppe-/);
            if (!href) throw new Error('Education error link has no target');
            gruppeHrefs.push(href);
            const gruppe = page.locator(href);
            await pressByKeyboard(page, feillenke);
            await expect(gruppe).toBeFocused();
            await assertRadioError(gruppe);
        }

        const [forsteGruppeHref, sisteGruppeHref] = gruppeHrefs;
        if (!forsteGruppeHref || !sisteGruppeHref) throw new Error('Education error links must target both groups');
        const forsteGruppe = page.locator(forsteGruppeHref);
        const sisteGruppe = page.locator(sisteGruppeHref);

        const forsteSvar = forsteGruppe.locator('input[type="radio"]').nth(1);
        const forsteSvarverdi = await forsteSvar.getAttribute('value');
        if (!forsteSvarverdi) throw new Error('First education response radio has no value');
        await chooseRadioByValue(page, forsteSvarverdi, forsteGruppe);

        await expect(feiloppsummering).toHaveCount(0);
        await assertRadioError(sisteGruppe);

        const sisteSvar = sisteGruppe.locator('input[type="radio"]').nth(1);
        const sisteSvarverdi = await sisteSvar.getAttribute('value');
        if (!sisteSvarverdi) throw new Error('Last education response radio has no value');
        await chooseRadioByValue(page, sisteSvarverdi, sisteGruppe);

        await expect(feiloppsummering).toHaveCount(0);
        await assertRadioHasNoError(forsteGruppe);
        await assertRadioHasNoError(sisteGruppe);

        await pressByKeyboard(page, page.getByRole('button', { name: /Neste steg/ }));
        await expect(page).toHaveURL(/\/opplysninger\/4$/);
        await expect(page.locator('#skjema-steg-4')).toBeFocused();
    });

    test('feiloppsummeringen på hindringer viser begge ubesvarte spørsmål', async ({ page }, testInfo) => {
        await startRegistrering(page);
        await chooseRadioByValue(page, DinSituasjon.MISTET_JOBBEN, page.getByRole('radiogroup').first());
        await nesteSteg(page, 1);
        await nesteSteg(page, 2);
        await chooseRadioByValue(page, Utdanningsnivaa.INGEN_UTDANNING, page.getByRole('radiogroup').first());
        await nesteSteg(page, 3);
        const grupper = page.getByRole('radiogroup');
        await expect(grupper).toHaveCount(2);

        const neste = page.getByRole('button', { name: /Neste steg/ });
        await pressByKeyboard(page, neste);

        const feiloppsummering = page.locator('.aksel-error-summary');
        const feillenker = feiloppsummering.getByRole('link');
        await expect(feillenker).toHaveCount(2);
        await expect(
            page.getByRole('heading', { name: /Du må rette disse feilene før du kan fortsette/ }),
        ).toBeFocused();

        for (let index = 0; index < 2; index += 1) {
            const feillenke = feillenker.nth(index);
            const href = await feillenke.getAttribute('href');
            expect(href).toMatch(/^#radio-gruppe-/);
            if (!href) throw new Error('Impediment error link has no target');
            const gruppe = page.locator(href);
            await pressByKeyboard(page, feillenke);
            await expect(gruppe).toBeFocused();
            await assertRadioError(gruppe);
        }

        await assertAxeClean(page, testInfo, 'hindringer med to valideringsfeil');
        await assertTextSpacing(page, 'hindringer med to valideringsfeil');
    });

    test('avbrytdialogen holder og returnerer tastaturfokus', async ({ page }, testInfo) => {
        await startRegistrering(page);
        await fyllUtTilOppsummering(page);
        const avbryt = page.getByRole('button', { name: 'Avbryt registreringen' });
        await pressByKeyboard(page, avbryt);

        const dialog = page.getByRole('dialog', { name: 'Bekreft at du ønsker å avbryte registreringen' });
        await expect(dialog).toBeVisible();
        await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
        const antallKnapper = await dialog.getByRole('button').count();
        expect(antallKnapper).toBeGreaterThanOrEqual(2);

        for (let index = 0; index < antallKnapper + 2; index += 1) {
            await page.keyboard.press('Tab');
            await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
        }
        for (let index = 0; index < antallKnapper + 2; index += 1) {
            await page.keyboard.press('Shift+Tab');
            await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
        }

        await assertAxeClean(page, testInfo, 'avbrytdialog åpen');
        await assertReflow(page, 'avbrytdialog åpen', dialog);
        await assertTextSpacing(page, 'avbrytdialog åpen', dialog);

        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(avbryt).toBeFocused();

        await pressByKeyboard(page, avbryt);
        await pressByKeyboard(page, dialog.getByRole('button', { name: 'Nei', exact: true }));
        await expect(dialog).not.toBeVisible();
        await expect(avbryt).toBeFocused();
        await assertFocusVisible(page, avbryt);
    });

    test('stillingssøk velger forslag og lukker med Escape via tastatur', async ({ page }, testInfo) => {
        await startRegistrering(page);
        await chooseRadioByValue(page, DinSituasjon.MISTET_JOBBEN, page.getByRole('radiogroup').first());
        await nesteSteg(page, 1);

        const endre = page.getByRole('button', { name: 'Endre', exact: true });
        await pressByKeyboard(page, endre);
        const sok = page.getByRole('combobox', { name: 'Søk etter stilling' });
        await expect(sok).toBeFocused();
        await page.keyboard.type('Sykepleier');

        const forslag = page.getByRole('option', { name: 'Sykepleier' });
        await expect(forslag).toBeVisible();
        await expect(sok).toHaveAttribute('aria-expanded', 'true');
        await assertAxeClean(page, testInfo, 'stillingssøk med åpen forslagsliste');
        await page.keyboard.press('ArrowDown');
        const forslagId = await forslag.getAttribute('id');
        if (!forslagId) throw new Error('Position suggestion has no id');
        await expect(sok).toHaveAttribute('aria-activedescendant', forslagId);
        await page.keyboard.press('Enter');

        await expect(endre.locator('..')).toHaveText(/^\s*Sykepleier\s*Endre\s*$/);
        await assertFocusVisible(page, endre);

        await pressByKeyboard(page, endre);
        const sokEtterpa = page.getByRole('combobox', { name: 'Søk etter stilling' });
        await expect(sokEtterpa).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(sokEtterpa).not.toBeVisible();
        await expect(endre).toBeFocused();
    });

    test('stillingssøk tilbyr Annen stilling når søket ikke gir treff', async ({ page }) => {
        await page.route('**/api/yrke-med-styrk-v2**', (route) => route.fulfill({ json: [] }));
        await startRegistrering(page);
        await chooseRadioByValue(page, DinSituasjon.MISTET_JOBBEN, page.getByRole('radiogroup').first());
        await nesteSteg(page, 1);

        const endre = page.getByRole('button', { name: 'Endre', exact: true });
        await pressByKeyboard(page, endre);
        const sok = page.getByRole('combobox', { name: 'Søk etter stilling' });
        await expect(sok).toBeFocused();
        await page.keyboard.type('Ukjent yrke');

        const fallback = page.getByRole('option', { name: 'Annen stilling' });
        await expect(fallback).toBeVisible();
        await expect(sok).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('ArrowDown');
        const fallbackId = await fallback.getAttribute('id');
        if (!fallbackId) throw new Error('Fallback suggestion has no id');
        await expect(sok).toHaveAttribute('aria-activedescendant', fallbackId);
        await page.keyboard.press('Enter');

        await expect(endre.locator('..')).toHaveText(/^\s*Annen stilling\s*Endre\s*$/);
        await expect(endre).toBeFocused();
    });
});
