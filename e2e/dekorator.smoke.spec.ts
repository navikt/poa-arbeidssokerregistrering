import { expect, test } from '@playwright/test';

test('feilsiden bruker den ekte dekoratøren', async ({ page }) => {
    // Smoke-testen verifiserer integrasjon med ekte dekoratør, ikke cookie- eller språkflyt.
    await page.goto('./feil');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('meta[name="uu-dekorator"][content="stub"]')).toHaveCount(0);

    await expect(page.getByTestId('uu-dekorator-header')).toHaveCount(0);
    await expect(page.getByTestId('uu-dekorator-footer')).toHaveCount(0);

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
});
