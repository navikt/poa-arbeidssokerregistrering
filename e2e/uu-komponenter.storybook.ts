import { type APIRequestContext, expect, type Page, type TestInfo, test } from '@playwright/test';
import { assertAxeClean, assertReflow, assertTextSpacing } from './uu-fixtures';

const storyTitle = 'Veiledning/Under 18';
const languages = ['nb', 'nn', 'en'] as const;
const fontUrl = 'https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2';
const storybookUrl = 'http://127.0.0.1:6006';

const stories = [
    {
        name: 'Oppgave opprettet',
        heading: {
            nb: 'Du ønsker å registrere deg som arbeidssøker',
            nn: 'Du ønskjer å registrera deg som arbeidssøkjar',
            en: 'You want to register as a job seeker',
        },
    },
    {
        name: 'Allerede bedt om kontakt',
        marker: {
            nb: 'Du har allerede bedt oss kontakte deg.',
            nn: 'Du har allereie spurt oss om å kontakte deg.',
            en: 'You have already asked us to contact you.',
        },
    },
    {
        name: 'Klarte ikke opprette oppgave',
        marker: {
            nb: 'Klarte ikke å opprette henvendelsen',
            nn: 'Det var ikkje mogleg å opprette førespurnaden',
            en: 'Failed to create the enquiry',
        },
    },
] as const;

type StoryEntry = { id: string; title: string; name: string };

async function findStoryId(request: APIRequestContext, storyName: string) {
    const response = await request.get(`${storybookUrl}/index.json`);
    expect(response.ok(), 'Could not load the Storybook story index').toBe(true);
    const index = (await response.json()) as { entries?: Record<string, StoryEntry> };
    const entry = Object.values(index.entries ?? {}).find(
        (candidate) => candidate.title === storyTitle && candidate.name === storyName,
    );

    const missingStoryMessage = `Storybook index is missing story "${storyTitle}/${storyName}". Check the title and story name in the story file.`;
    expect(entry, missingStoryMessage).toBeDefined();
    if (!entry) throw new Error(missingStoryMessage);
    return entry.id;
}

async function prepareStorybookPage(page: Page) {
    await page.addInitScript(() => {
        Object.assign(window, {
            __DECORATOR_DATA__: { params: {} },
            webStorageController: {
                isStorageKeyAllowed: () => false,
                getAllowedStorage: () => [],
                getCurrentConsent: () => ({
                    consent: { analytics: false, surveys: false },
                    userActionTaken: false,
                    meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
                }),
            },
        });

        window.addEventListener('message', (message) => {
            const data = message.data as { source?: string; event?: string } | null;
            if (
                message.source === window &&
                message.origin === window.location.origin &&
                data?.source === 'decoratorClient' &&
                data.event === 'ready'
            ) {
                window.postMessage({ source: 'decorator', event: 'ready' }, window.location.origin);
            }
        });
    });

    const unexpectedRequests: string[] = [];
    await page.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.href === fontUrl && route.request().method() === 'GET') {
            await route.continue();
            return;
        }
        if (['127.0.0.1', 'localhost'].includes(url.hostname) && url.port === '6006') {
            await route.continue();
            return;
        }
        unexpectedRequests.push(`${route.request().method()} ${url.href}`);
        await route.abort();
    });

    return unexpectedRequests;
}

test.describe('Under 18 Storybook-komponenter @uu', () => {
    for (const story of stories) {
        for (const language of languages) {
            test(`${story.name} renders in ${language}`, async ({ page, request }, testInfo: TestInfo) => {
                const unexpectedRequests = await prepareStorybookPage(page);
                const storyId = await findStoryId(request, story.name);
                const query = new URLSearchParams({ id: storyId, viewMode: 'story', globals: `sprak:${language}` });
                await page.goto(`/iframe.html?${query.toString()}`);
                const root = page.locator('#storybook-root');
                await expect(root).not.toBeEmpty();

                await page.evaluate((sprak) => {
                    const rootElement = document.querySelector('#storybook-root');
                    if (!rootElement?.parentElement) throw new Error('Storybook did not render #storybook-root');
                    const main = document.createElement('main');
                    rootElement.parentElement.insertBefore(main, rootElement);
                    main.appendChild(rootElement);
                    document.documentElement.lang = sprak;
                }, language);

                const main = page.getByRole('main');
                const heading = main.getByRole('heading', { level: 1 });
                await expect(main).toHaveCount(1);
                await expect(heading, `Expected an h1 in story "${story.name}" (${language})`).toBeVisible();
                await expect(page.locator('html')).toHaveAttribute('lang', language);

                if ('heading' in story) {
                    await expect(heading).toHaveText(story.heading[language]);
                } else {
                    await expect(main.getByText(story.marker[language], { exact: false })).toBeVisible();
                }

                await page.evaluate(async () => document.fonts.ready);
                await assertAxeClean(page, testInfo, `${story.name}-${language}`);
                await assertReflow(page, `${story.name}-${language}`);
                await assertTextSpacing(page, `${story.name}-${language}`);
                expect(unexpectedRequests, 'Unexpected external browser requests').toEqual([]);
            });
        }
    }
});
