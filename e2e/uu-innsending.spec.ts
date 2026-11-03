import { assertAxeClean, assertFocusVisible, expect, pressByKeyboard, tabTo, test } from './uu-fixtures';
import { fyllUtTilOppsummering, startRegistrering } from './uu-skjemaflyt';

const submitName = 'Fullfør registrering som arbeidssøker';

test.describe('Innsending @uu', () => {
    test('innsending viser tastaturtilgjengelig ventetilstand og kvittering', async ({ page }, testInfo) => {
        let notifyRequestStarted!: () => void;
        const requestStarted = new Promise<void>((resolve) => {
            notifyRequestStarted = resolve;
        });
        let requestHasStarted = false;
        let releaseRequest!: () => void;
        const requestPending = new Promise<void>((resolve) => {
            releaseRequest = resolve;
        });
        let completeRequest!: () => void;
        let failRequest!: (error: unknown) => void;
        const requestCompleted = new Promise<void>((resolve, reject) => {
            completeRequest = resolve;
            failRequest = reject;
        });
        let opplysningerMetode: string | undefined;

        await page.route('**/api/start-arbeidssokerperiode-v2**', async (route) => {
            if (route.request().method() !== 'PUT') {
                await route.continue();
                return;
            }

            requestHasStarted = true;
            notifyRequestStarted();
            try {
                await requestPending;
                await route.fulfill({ status: 204 });
                completeRequest();
            } catch (error) {
                failRequest(error);
            }
        });
        await page.route('**/api/opplysninger**', async (route) => {
            opplysningerMetode = route.request().method();
            await route.fulfill({ status: 200, json: {} });
        });
        await startRegistrering(page);
        await fyllUtTilOppsummering(page);

        const submit = page.getByTestId('fullfor-registrering');

        try {
            const submitByName = page.getByRole('button', { name: submitName });
            await expect(submitByName).toHaveAccessibleName(submitName);
            await pressByKeyboard(page, submitByName);
            await requestStarted;

            await expect(submit).toBeDisabled();
            await expect(submit).toHaveClass(/aksel-button--loading/);
            await expect(submit).toHaveAccessibleName(/Venter|Waiting/i);
            await assertAxeClean(page, testInfo, 'innsending venter på startkall');
        } finally {
            releaseRequest();
            if (requestHasStarted) await requestCompleted;
        }

        await expect(page).toHaveURL(/\/kvittering\/?$/);
        await expect(page.getByRole('heading', { name: /Du er registrert som arbeidssøker/ })).toBeVisible();
        expect(opplysningerMetode).toBe('POST');
        await assertAxeClean(page, testInfo, 'innsending fullført');
    });

    for (const endpoint of ['**/api/start-arbeidssokerperiode-v2**', '**/api/opplysninger**']) {
        test(`innsending viser feilside ved serverfeil fra ${endpoint.includes('opplysninger') ? 'opplysninger' : 'start'}`, async ({
            page,
        }, testInfo) => {
            await page.route(endpoint, (route) =>
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Request failed' }),
                }),
            );
            await startRegistrering(page);
            await fyllUtTilOppsummering(page);

            const submit = page.getByRole('button', { name: submitName });
            await pressByKeyboard(page, submit);

            await expect(page).toHaveURL(/\/feil\/?$/);
            await expect(page.getByRole('heading', { name: 'Beklager, teknisk feil' })).toBeVisible();
            const kontakt = page.getByRole('link', {
                name: 'Kontakt teknisk brukerstøtte dersom problemene vedvarer.',
            });
            await tabTo(page, kontakt);
            await assertFocusVisible(page, kontakt);
            await assertAxeClean(page, testInfo, `feilside ved ${endpoint}`);
        });
    }
});
