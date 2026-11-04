import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, type Locator, type Page, type TestInfo } from '@playwright/test';

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

export function erUtviklingsHmr(url: URL) {
    return (
        LOCAL_HOSTS.has(url.hostname) &&
        url.port === '3000' &&
        ['/_next/hmr', '/_next/webpack-hmr'].some((path) => url.pathname.endsWith(path))
    );
}

export function erKodeOppdatering(message: string | Buffer): boolean {
    if (typeof message !== 'string') return false;
    let event: unknown;
    try {
        event = JSON.parse(message);
    } catch {
        return false;
    }
    if (!event || typeof event !== 'object') return false;
    const { type, errors } = event as { type?: unknown; errors?: unknown };
    if (Array.isArray(errors) && errors.length > 0) return false;
    return (
        typeof type === 'string' &&
        [
            'addedPage',
            'removedPage',
            'reloadPage',
            'serverComponentChanges',
            'staticParamsChanged',
            'middlewareChanges',
            'clientChanges',
            'serverOnlyChanges',
            'built',
            'building',
        ].includes(type)
    );
}

export function lagHmrMeldingsfilter() {
    let harSynkronisert = false;
    return (message: string | Buffer): boolean => {
        if (erKodeOppdatering(message)) return false;
        if (typeof message !== 'string') return true;
        let event: unknown;
        try {
            event = JSON.parse(message);
        } catch {
            return true;
        }
        if (!event || typeof event !== 'object') return true;
        const { type, errors } = event as { type?: unknown; errors?: unknown };
        if (type !== 'sync' || (Array.isArray(errors) && errors.length > 0)) return true;
        // Senere kompileringer endrer hashen og kan gi full reload i Next 16.4.
        if (harSynkronisert) return false;
        harSynkronisert = true;
        return true;
    };
}

export const test = base.extend({
    page: async ({ context }, use) => {
        const unexpectedExternalRequests: string[] = [];
        const pageErrors: string[] = [];

        await context.routeWebSocket(erUtviklingsHmr, (socket) => {
            const server = socket.connectToServer();
            const skalVideresende = lagHmrMeldingsfilter();
            server.onMessage((message) => {
                // Next 16 bruker også kanalen til React-strømmer. Disse og feil skal fortsatt videresendes.
                if (skalVideresende(message)) socket.send(message);
            });
        });

        await context.addInitScript(() => {
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

        await context.route('**/*', async (route) => {
            const url = new URL(route.request().url());

            // Bruk appens faktiske font. Bare dette kjente eksterne asset-kallet er tillatt.
            if (
                url.href === 'https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2' &&
                route.request().method() === 'GET'
            ) {
                await route.continue();
                return;
            }

            if (url.pathname.includes('/api/sistearbeidsforhold-fra-aareg-v2')) {
                await route.fulfill({ status: 204 });
                return;
            }

            if (url.pathname.includes('/api/yrke-med-styrk-v2')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([{ konseptId: 12345, label: 'Sykepleier', styrk08: '2221' }]),
                });
                return;
            }

            if (LOCAL_HOSTS.has(url.hostname) && url.port === '3000') {
                await route.continue();
                return;
            }

            unexpectedExternalRequests.push(`${route.request().method()} ${url.href}`);
            await route.abort();
        });

        const page = await context.newPage();
        page.on('pageerror', (error) => pageErrors.push(error.message));
        await use(page);
        expect(unexpectedExternalRequests, 'Unexpected external browser requests').toEqual([]);
        expect(pageErrors, 'Unexpected browser page errors').toEqual([]);
    },
});

export { expect };

export async function awaitPageReady(page: Page, title: RegExp, language: string) {
    const main = page.getByRole('main');
    await expect(main).toHaveCount(1);
    await expect(main).toBeVisible();
    await expect(main.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(main.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page).toHaveTitle(title, { timeout: 10_000 });

    await expect
        .poll(
            () =>
                main.locator('h1,h2,h3,h4,h5,h6').evaluateAll((headings) => {
                    const levels = headings
                        .filter((heading) => {
                            const style = window.getComputedStyle(heading);
                            return (
                                heading.getClientRects().length > 0 &&
                                style.display !== 'none' &&
                                style.visibility !== 'hidden' &&
                                style.visibility !== 'collapse'
                            );
                        })
                        .map((heading) => Number(heading.tagName.slice(1)));
                    return {
                        firstLevel: levels[0] ?? null,
                        h1Count: levels.filter((level) => level === 1).length,
                        hasSkippedLevel: levels.some((level, index) => index > 0 && level > levels[index - 1] + 1),
                    };
                }),
            { timeout: 10_000, message: 'Den ferdig rendrede siden skal ha én H1 og sammenhengende overskriftsnivåer' },
        )
        .toEqual({ firstLevel: 1, h1Count: 1, hasSkippedLevel: false });
    return main;
}

export async function awaitStepReady(page: Page, side: string | number, title: RegExp, language: string) {
    const main = await awaitPageReady(page, title, language);
    const step = page.locator(`#skjema-steg-${side}`);
    await expect(step).toBeVisible();
    await expect(step).toBeFocused({ timeout: 10_000 });
    return main;
}

export async function assertAxeClean(page: Page, testInfo: TestInfo, state: string) {
    await page.evaluate(async () => {
        await document.fonts.ready;
    });
    const results = await new AxeBuilder({ page })
        .options({ rules: { 'target-size': { enabled: true } } })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();

    await testInfo.attach(`axe-${state.replace(/[^a-z0-9-]/gi, '-')}.json`, {
        body: Buffer.from(
            JSON.stringify(
                {
                    ...results,
                    state,
                },
                null,
                2,
            ),
        ),
        contentType: 'application/json',
    });
    expect(results.violations, `axe violations in ${state}`).toEqual([]);
}

export async function tabTo(page: Page, locator: Locator, maxTabs = 60) {
    await expect(locator).toBeVisible();
    for (let index = 0; index <= maxTabs; index += 1) {
        const focused = await locator.evaluate((element) => element === document.activeElement);
        if (focused) return;
        if (index === maxTabs) break;
        await page.keyboard.press('Tab');
    }
    throw new Error(`Could not reach ${(await locator.getAttribute('aria-label')) ?? 'the requested control'} by Tab`);
}

export async function pressByKeyboard(page: Page, locator: Locator, key: 'Enter' | 'Space' = 'Enter') {
    await tabTo(page, locator);
    await page.keyboard.press(key);
}

export async function chooseRadioByValue(page: Page, value: string, group?: Locator) {
    const radioGroup = group ?? page.getByRole('radiogroup').first();
    const radios = radioGroup.locator('input[type="radio"]');
    const radioValues = await radios.evaluateAll((elements) =>
        elements.map((radio) => (radio as HTMLInputElement).value),
    );
    const targetIndex = radioValues.indexOf(value);
    expect(targetIndex, `Radio value ${value} is present in the selected group`).toBeGreaterThanOrEqual(0);

    const target = radios.nth(targetIndex);
    await expect(target).toBeVisible();
    const selectedIndex = await radios.evaluateAll((elements) =>
        elements.findIndex((radio) => (radio as HTMLInputElement).checked),
    );
    const startingRadio = radios.nth(Math.max(selectedIndex, 0));
    await tabTo(page, startingRadio);
    if (selectedIndex < 0) await page.keyboard.press('Space');

    for (let index = 0; index < radioValues.length; index += 1) {
        if (await target.isChecked()) break;
        await page.keyboard.press('ArrowDown');
    }
    await expect(target).toBeChecked();
    return target;
}

export async function clickButtonByKeyboard(page: Page, name: RegExp | string) {
    const button = page.getByRole('button', { name }).first();
    await pressByKeyboard(page, button);
}

export async function assertReflow(page: Page, state: string, scope?: Locator) {
    await page.setViewportSize({ width: 320, height: 900 });
    const measurements = await (scope ?? page.locator('body')).evaluate((scopeElement) => {
        const width = document.documentElement.clientWidth;
        const isVisible = (element: HTMLElement) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
                element.getClientRects().length > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                Number(style.opacity) > 0 &&
                rect.width > 0 &&
                rect.height > 0 &&
                !(rect.width <= 1 && rect.height <= 1 && ['absolute', 'fixed'].includes(style.position))
            );
        };
        const controls = Array.from(
            scopeElement.querySelectorAll<HTMLElement>(
                'a,button,input:not([type="radio"]):not([type="checkbox"]),select,textarea,summary,[role="button"],[role="link"],[role="combobox"],label',
            ),
        )
            .filter((element) => {
                if (!isVisible(element)) return false;
                if (element.tagName !== 'LABEL') return true;
                const control = (element as HTMLLabelElement).control;
                return control instanceof HTMLInputElement && ['radio', 'checkbox'].includes(control.type);
            })
            .map((element) => ({
                selector: element.tagName.toLowerCase(),
                rect: element.getBoundingClientRect().toJSON(),
            }))
            .filter(({ rect }) => rect.left < -1 || rect.right > width + 1);

        const describeElement = (element: HTMLElement) => {
            const rect = element.getBoundingClientRect();
            return {
                tagName: element.tagName.toLowerCase(),
                className: element.getAttribute('class') ?? '',
                id: element.id,
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
                scrollHeight: element.scrollHeight,
                clientHeight: element.clientHeight,
            };
        };

        const clippedControls: {
            element: ReturnType<typeof describeElement>;
            ancestor: ReturnType<typeof describeElement>;
            kind: 'ancestor' | 'own-content';
            clipping: { x: boolean; y: boolean };
        }[] = [];
        for (const element of Array.from(
            scopeElement.querySelectorAll<HTMLElement>(
                'a,button,input:not([type="radio"]):not([type="checkbox"]),select,textarea,summary,[role="button"],[role="link"],[role="combobox"],label',
            ),
        )) {
            if (!isVisible(element)) continue;
            if (element.tagName === 'LABEL') {
                const control = (element as HTMLLabelElement).control;
                if (!(control instanceof HTMLInputElement) || !['radio', 'checkbox'].includes(control.type)) continue;
            }
            const rect = element.getBoundingClientRect();
            for (let parent = element.parentElement; parent; parent = parent.parentElement) {
                const overflowX = window.getComputedStyle(parent).overflowX;
                const overflowY = window.getComputedStyle(parent).overflowY;
                if (['hidden', 'clip'].includes(overflowX) || ['hidden', 'clip'].includes(overflowY)) {
                    const parentRect = parent.getBoundingClientRect();
                    const clippedX =
                        ['hidden', 'clip'].includes(overflowX) &&
                        (rect.left < parentRect.left - 1 || rect.right > parentRect.right + 1);
                    const clippedY =
                        ['hidden', 'clip'].includes(overflowY) &&
                        (rect.top < parentRect.top - 1 || rect.bottom > parentRect.bottom + 1);
                    if (clippedX || clippedY) {
                        clippedControls.push({
                            element: describeElement(element),
                            ancestor: describeElement(parent),
                            kind: 'ancestor',
                            clipping: { x: clippedX, y: clippedY },
                        });
                        break;
                    }
                }
                if (scopeElement !== document.body && parent === scopeElement) break;
            }

            const style = window.getComputedStyle(element);
            const clippedX =
                ['hidden', 'clip'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 2;
            const clippedY =
                ['hidden', 'clip'].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 2;
            if (clippedX || clippedY) {
                clippedControls.push({
                    element: describeElement(element),
                    ancestor: describeElement(element),
                    kind: 'own-content',
                    clipping: { x: clippedX, y: clippedY },
                });
            }
        }

        return {
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: width,
            controls,
            clippedControls,
        };
    });

    expect(measurements.documentWidth, `horizontal overflow on ${state}`).toBeLessThanOrEqual(
        measurements.viewportWidth,
    );
    expect(measurements.controls, `controls outside the viewport on ${state}`).toEqual([]);
    expect(measurements.clippedControls, `controls clipped by overflow on ${state}`).toEqual([]);
}

export async function assertTextSpacing(page: Page, state: string, scope?: Locator) {
    await (scope ?? page.locator('body')).evaluate((scopeElement) => {
        const elements = [scopeElement as HTMLElement, ...Array.from(scopeElement.querySelectorAll<HTMLElement>('*'))];
        elements.forEach((element) => {
            element.style.setProperty('line-height', '1.5', 'important');
            element.style.setProperty('letter-spacing', '.12em', 'important');
            element.style.setProperty('word-spacing', '.16em', 'important');
        });
        elements
            .filter((element) => element.tagName === 'P')
            .forEach((element) => {
                element.style.setProperty('margin-block-end', '2em', 'important');
            });
    });

    const measurements = await (scope ?? page.locator('body')).evaluate((scopeElement) => {
        const elements = [scopeElement as HTMLElement, ...Array.from(scopeElement.querySelectorAll<HTMLElement>('*'))];
        const isVisible = (element: HTMLElement) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
                element.getClientRects().length > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                Number(style.opacity) > 0 &&
                rect.width > 0 &&
                rect.height > 0 &&
                !(rect.width <= 1 && rect.height <= 1 && ['absolute', 'fixed'].includes(style.position))
            );
        };
        const candidates = elements.filter((element) => element.tagName === 'P' && isVisible(element));
        if (candidates.length === 0 && isVisible(scopeElement as HTMLElement))
            candidates.push(scopeElement as HTMLElement);
        const spacing = candidates.map((element) => {
            const style = window.getComputedStyle(element);
            const fontSize = Number.parseFloat(style.fontSize);
            const lineHeight = style.lineHeight === 'normal' ? 0 : Number.parseFloat(style.lineHeight);
            return {
                tagName: element.tagName,
                letterSpacing: Number.parseFloat(style.letterSpacing),
                expectedLetterSpacing: fontSize * 0.12,
                wordSpacing: Number.parseFloat(style.wordSpacing),
                expectedWordSpacing: fontSize * 0.16,
                lineHeight,
                fontSize,
                expectedLineHeight: fontSize * 1.5,
                marginBottom: Number.parseFloat(style.marginBlockEnd),
                expectedMarginBottom: element.tagName === 'P' ? fontSize * 2 : undefined,
            };
        });

        const describeElement = (element: HTMLElement) => {
            const rect = element.getBoundingClientRect();
            return {
                tagName: element.tagName.toLowerCase(),
                className: element.getAttribute('class') ?? '',
                id: element.id,
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
                scrollHeight: element.scrollHeight,
                clientHeight: element.clientHeight,
            };
        };

        const clippedElements: {
            element: ReturnType<typeof describeElement>;
            ancestor: ReturnType<typeof describeElement>;
            kind: 'ancestor' | 'own-content';
            clipping: { x: boolean; y: boolean };
        }[] = [];
        const isDecorativeProgressForeground = (element: HTMLElement) => {
            if (!element.matches('.aksel-progress-bar__foreground')) return false;
            const progressBar = element.closest('.aksel-progress-bar');
            const hasInteractiveDescendant = element.querySelector(
                'a,button,input,select,textarea,summary,[role="button"],[role="link"],[role="combobox"],[role="radio"],[role="checkbox"],label',
            );
            return (
                progressBar?.getAttribute('aria-hidden') === 'true' &&
                !element.textContent?.trim() &&
                !hasInteractiveDescendant
            );
        };
        for (const element of elements) {
            if (!isVisible(element) || element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)
                continue;
            if (isDecorativeProgressForeground(element)) continue;
            const rect = element.getBoundingClientRect();
            for (
                let parent = element === scopeElement ? null : element.parentElement;
                parent;
                parent = parent.parentElement
            ) {
                const style = window.getComputedStyle(parent);
                const parentRect = parent.getBoundingClientRect();
                const clippedX =
                    ['hidden', 'clip'].includes(style.overflowX) &&
                    (rect.left < parentRect.left - 1 || rect.right > parentRect.right + 1);
                const clippedY =
                    ['hidden', 'clip'].includes(style.overflowY) &&
                    (rect.top < parentRect.top - 1 || rect.bottom > parentRect.bottom + 1);
                if (clippedX || clippedY) {
                    clippedElements.push({
                        element: describeElement(element),
                        ancestor: describeElement(parent),
                        kind: 'ancestor',
                        clipping: { x: clippedX, y: clippedY },
                    });
                    break;
                }
                if (scopeElement !== document.body && parent === scopeElement) break;
            }

            const hasText = !!element.textContent?.trim();
            const isInteractive = element.matches(
                'a,button,input,select,textarea,summary,[role="button"],[role="link"],[role="combobox"],[role="radio"],[role="checkbox"],label',
            );
            if (!hasText && !isInteractive) continue;

            const style = window.getComputedStyle(element);
            const clippedX =
                ['hidden', 'clip'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 2;
            const clippedY =
                ['hidden', 'clip'].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 2;
            if (clippedX || clippedY) {
                clippedElements.push({
                    element: describeElement(element),
                    ancestor: describeElement(element),
                    kind: 'own-content',
                    clipping: { x: clippedX, y: clippedY },
                });
            }
        }

        return {
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: document.documentElement.clientWidth,
            spacing,
            clippedElements,
        };
    });

    expect(measurements.spacing.length, `visible paragraph or body on ${state}`).toBeGreaterThan(0);
    for (const spacing of measurements.spacing) {
        expect(
            Math.abs(spacing.lineHeight - spacing.expectedLineHeight),
            `line-height applied on ${spacing.tagName} in ${state}`,
        ).toBeLessThanOrEqual(0.1);
        expect(spacing.letterSpacing, `letter-spacing applied on ${spacing.tagName} in ${state}`).toBeCloseTo(
            spacing.expectedLetterSpacing,
            1,
        );
        expect(spacing.wordSpacing, `word-spacing applied on ${spacing.tagName} in ${state}`).toBeCloseTo(
            spacing.expectedWordSpacing,
            1,
        );
        if (spacing.expectedMarginBottom !== undefined) {
            expect(spacing.marginBottom, `paragraph spacing applied in ${state}`).toBeCloseTo(
                spacing.expectedMarginBottom,
                1,
            );
        }
    }
    expect(measurements.documentWidth, `horizontal overflow on ${state}`).toBeLessThanOrEqual(
        measurements.viewportWidth,
    );
    expect(measurements.clippedElements, `visible elements clipped by overflow on ${state}`).toEqual([]);
}

export async function assertFocusVisible(page: Page, locator: Locator) {
    await expect(locator).toBeFocused();
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Viewport size is not available');
    const focusStyle = await locator.evaluate((element, viewportSize) => {
        const rect = element.getBoundingClientRect();
        const left = Math.max(0, rect.left);
        const right = Math.min(viewportSize.width, rect.right);
        const top = Math.max(0, rect.top);
        const bottom = Math.min(viewportSize.height, rect.bottom);
        const points = [
            [(left + right) / 2, (top + bottom) / 2],
            [left + 1, top + 1],
            [right - 1, top + 1],
            [left + 1, bottom - 1],
            [right - 1, bottom - 1],
        ];
        const hasUncoveredPoint =
            right > left &&
            bottom > top &&
            points.some(([x, y]) => {
                const hit = document.elementFromPoint(x, y);
                return hit === element || (hit !== null && element.contains(hit));
            });
        const focusedElements: Element[] = [element];
        let wrapper = element.parentElement;
        for (let depth = 0; wrapper && depth < 2; depth += 1, wrapper = wrapper.parentElement) {
            const relevantWrapper =
                wrapper.matches('label,button,a,[role="button"],[role="link"],[role="radio"],[role="checkbox"]') ||
                Array.from(wrapper.classList).some((className) =>
                    ['aksel-radio', 'aksel-radio-card', 'aksel-checkbox', 'aksel-switch', 'aksel-combobox'].includes(
                        className,
                    ),
                );
            if (relevantWrapper && wrapper.matches(':focus-within')) focusedElements.push(wrapper);
        }
        const hasVisibleFocusStyle = focusedElements.some((focused) => {
            const style = window.getComputedStyle(focused);
            const outlineVisible =
                style.outlineStyle !== 'none' &&
                Number.parseFloat(style.outlineWidth) > 0 &&
                style.outlineColor !== 'transparent' &&
                !/rgba\([^)]*,\s*0(?:\.0+)?\)/.test(style.outlineColor);
            const shadowVisible = style.boxShadow !== 'none' && !/rgba\([^)]*,\s*0(?:\.0+)?\)/.test(style.boxShadow);
            return outlineVisible || shadowVisible;
        });
        return { hasUncoveredPoint, hasVisibleFocusStyle };
    }, viewport);

    expect(focusStyle.hasUncoveredPoint, 'Focused control has an uncovered point in the viewport').toBe(true);
    expect(focusStyle.hasVisibleFocusStyle, 'Focused control or wrapper has a visible outline or shadow').toBe(true);
}

export async function assertRadioError(locator: Locator) {
    const errorState = await locator.evaluate((element) => {
        const group = element.matches('fieldset') ? element : (element.closest('fieldset') ?? element);
        const radios = Array.from(group.querySelectorAll('input[type="radio"]'));
        const errorNode = Array.from(group.querySelectorAll('.aksel-fieldset__error')).find((node) => {
            const style = window.getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return (
                !!node.textContent?.trim() &&
                node.getClientRects().length > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.visibility !== 'collapse' &&
                Number(style.opacity) > 0 &&
                rect.width > 0 &&
                rect.height > 0
            );
        });
        const errorId = errorNode?.getAttribute('id');
        const describesError =
            !!errorId &&
            ((group.getAttribute('aria-describedby') ?? '').split(/\s+/).includes(errorId) ||
                (radios.length > 0 &&
                    radios.every((radio) =>
                        (radio.getAttribute('aria-describedby') ?? '').split(/\s+/).includes(errorId),
                    )));
        const invalid =
            group.getAttribute('aria-invalid') === 'true' ||
            (radios.length > 0 && radios.every((radio) => radio.getAttribute('aria-invalid') === 'true'));
        return { invalid, describesError };
    });

    expect(errorState.invalid, 'Radio group or all radio inputs are marked invalid').toBe(true);
    expect(errorState.describesError, 'Radio group or all radio inputs describe its visible Aksel error text').toBe(
        true,
    );
}
