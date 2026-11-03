import type { Page } from '@playwright/test';
import { expect, test } from './uu-fixtures';

test.use({ trace: 'retain-on-failure' });

const klikkNesteSteg = async (page: Page) => {
    const nesteSteg = page.getByRole('button', { name: /Neste steg|Next step/i }).first();
    await expect(nesteSteg).toBeVisible({ timeout: 10_000 });
    await expect(nesteSteg).toBeEnabled({ timeout: 10_000 });
    await nesteSteg.scrollIntoViewIfNeeded();
    await nesteSteg.click();
};

test('problemfri registrering fra /start til /kvittering', async ({ page }) => {
    const javascriptFeil: string[] = [];
    page.on('pageerror', (error) => javascriptFeil.push(error.message));

    await page.goto('./start');
    await expect(page).toHaveURL(/\/opplysninger\/1$/, { timeout: 10_000 });
    await expect(page.locator('#skjema-steg-1')).toBeFocused({ timeout: 10_000 });
    expect(javascriptFeil, 'Appen skal ikke ha JavaScript-feil før utfylling').toEqual([]);

    // Steg 1: Din situasjon
    const situasjon = page.getByRole('radio', { name: 'Har mistet eller kommer til å miste jobben', exact: true });
    await situasjon.check();
    await expect(situasjon).toBeChecked();
    await klikkNesteSteg(page);
    expect(javascriptFeil, 'Appen skal ikke ha JavaScript-feil etter Neste steg').toEqual([]);

    // Steg 2: Siste jobb
    await expect(page).toHaveURL(/\/opplysninger\/2$/, { timeout: 10_000 });
    await expect(page.locator('#skjema-steg-2')).toBeFocused({ timeout: 10_000 });
    await expect(page.getByText('Annen stilling')).toBeVisible({ timeout: 15_000 });
    await klikkNesteSteg(page);

    // Steg 3: Utdanning – velger første alternativ (Ingen utdanning)
    await expect(page).toHaveURL(/\/opplysninger\/3$/, { timeout: 10_000 });
    await expect(page.locator('#skjema-steg-3')).toBeFocused({ timeout: 10_000 });
    await page.getByRole('radio').first().click();
    await klikkNesteSteg(page);

    // Steg 4: Hindringer
    await expect(page).toHaveURL(/\/opplysninger\/4$/, { timeout: 10_000 });
    await expect(page.locator('#skjema-steg-4')).toBeFocused({ timeout: 10_000 });
    await page
        .locator('fieldset')
        .filter({ hasText: 'Har du helseproblemer' })
        .getByRole('radio', { name: /Nei|No/ })
        .click();
    await page
        .locator('fieldset')
        .filter({ hasText: 'Har du andre problemer' })
        .getByRole('radio', { name: /Nei|No/ })
        .click();
    await klikkNesteSteg(page);

    // Steg 5: Oppsummering
    await expect(page).toHaveURL(/\/opplysninger\/5$/, { timeout: 10_000 });
    await expect(page.locator('#skjema-steg-5')).toBeFocused({ timeout: 10_000 });
    await page.getByTestId('fullfor-registrering').click();

    // // Kvittering
    await expect(page).toHaveURL(/\/kvittering$/, { timeout: 20_000 });
    await expect(
        page.getByRole('heading', { name: /Du er registrert som arbeidssøker|You are registered as a jobseeker/ }),
    ).toBeVisible();
    expect(javascriptFeil, 'Appen skal ikke ha JavaScript-feil gjennom registreringen').toEqual([]);
});
