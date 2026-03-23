import { expect, Page, test } from '@playwright/test';

const lukkCookieBanner = async (page: Page, timeout = 750) => {
    const banner = page.getByRole('region', { name: /informasjonskapsler/i });
    try {
        await banner.waitFor({ state: 'visible', timeout });
        await page
            .getByRole('button', { name: /^Nei$|^No$/ })
            .first()
            .click();
        await banner.waitFor({ state: 'hidden', timeout: 5_000 });
    } catch {
        // banneret viste seg ikke – fortsett
    }
};

const klikkNesteSteg = async (page: Page) => {
    // Banner/decorator can reappear and overlap the bottom part of the form.
    await lukkCookieBanner(page, 750);

    const nesteSteg = page.getByRole('button', { name: /Neste steg|Next step/i }).first();
    await expect(nesteSteg).toBeVisible({ timeout: 10_000 });
    await expect(nesteSteg).toBeEnabled({ timeout: 10_000 });
    await nesteSteg.scrollIntoViewIfNeeded();
    await nesteSteg.click();
};

test('problemfri registrering fra /start til /kvittering', async ({ page }) => {
    await page.goto('./opplysninger/start');
    await lukkCookieBanner(page, 10_000);

    // Steg 1: Din situasjon
    await page.getByRole('radio').first().click();
    await klikkNesteSteg(page);

    // Steg 2: Siste jobb
    await expect(page).toHaveURL(/\/opplysninger\/2$/, { timeout: 10_000 });
    await expect(page.getByText('Annen stilling')).toBeVisible({ timeout: 15_000 });
    await klikkNesteSteg(page);

    // Steg 3: Utdanning – velger første alternativ (Ingen utdanning)
    await expect(page).toHaveURL(/\/opplysninger\/3$/, { timeout: 10_000 });
    await page.getByRole('radio').first().click();
    await klikkNesteSteg(page);

    // Steg 4: Hindringer
    await expect(page).toHaveURL(/\/opplysninger\/4$/, { timeout: 10_000 });
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
    await page.getByTestId('fullfor-registrering').click({ force: true });

    // // Kvittering
    await expect(page).toHaveURL(/\/kvittering$/, { timeout: 20_000 });
    await expect(
        page.getByRole('heading', { name: /Du er registrert som arbeidssøker|You are registered as a jobseeker/ }),
    ).toBeVisible();
});
