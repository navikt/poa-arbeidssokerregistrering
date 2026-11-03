import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ReactDomServerApi = {
    renderToString: (node: ReactNode) => string;
};

type ReactDomClientApi = {
    hydrateRoot: (
        container: Element,
        initialChildren: ReactNode,
        options?: { onRecoverableError?: (error: unknown) => void },
    ) => { unmount: () => void };
};

vi.mock('../../contexts/config-context', () => ({
    useConfig: () => ({
        brukerdialogDagpengerUrl: 'https://example.test/dagpenger',
        dagpengesoknadUrl: 'https://example.test/soknad',
        dittNavUrl: 'https://example.test/min-side',
    }),
}));

vi.mock('../../hooks/useSprak', () => ({ default: () => 'nb' }));
vi.mock('../../lib/tracker', () => ({ loggAktivitet: vi.fn() }));
vi.mock('next/image', () => ({ default: () => null }));

import NyKvittering from './ny-kvittering';

describe('NyKvittering', () => {
    let root: ReturnType<ReactDomClientApi['hydrateRoot']> | undefined;
    let container: HTMLDivElement;

    beforeEach(() => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
        sessionStorage.clear();
        container = document.createElement('div');
        document.body.append(container);
    });

    afterEach(async () => {
        if (root) {
            await act(async () => root?.unmount());
            root = undefined;
        }
        container.remove();
        sessionStorage.clear();
        vi.unstubAllGlobals();
    });

    async function hydrate(): Promise<string[]> {
        const recoverableErrors: string[] = [];
        const { renderToString } = await vi.importActual<ReactDomServerApi>('react-dom/server');
        const { hydrateRoot } = await vi.importActual<ReactDomClientApi>('react-dom/client');
        container.innerHTML = renderToString(<NyKvittering />);

        await act(async () => {
            root = hydrateRoot(container, <NyKvittering />, {
                onRecoverableError: (error) => recoverableErrors.push(String(error)),
            });
        });

        return recoverableErrors;
    }

    it('renders no HTML initially, then shows the standard receipt after hydration', async () => {
        expect(window).toBeDefined();
        const { renderToString } = await vi.importActual<ReactDomServerApi>('react-dom/server');
        expect(renderToString(<NyKvittering />)).toBe('');

        const recoverableErrors = await hydrate();

        expect(recoverableErrors).toEqual([]);
        expect(container.querySelector('h1')?.textContent).toBe('Du er registrert som arbeidssøker');
        expect(container.querySelector('a[href="https://www.nav.no/bekreft-arbeidssoker"]')).toBeTruthy();
        expect(container.querySelector('a[href="https://example.test/min-side"]')).toBeTruthy();
        expect(container.querySelector('a[href="https://example.test/soknad"]')).toBeTruthy();
    });

    it('treats any non-empty session flag, including the string false, as coming from dagpenger', async () => {
        sessionStorage.setItem('kommerFraDagpenger', 'false');

        const recoverableErrors = await hydrate();

        expect(recoverableErrors).toEqual([]);
        expect(container.querySelector('h1')?.textContent).toBe('Du er registrert som arbeidssøker');
        expect(container.querySelector('a[href="https://example.test/dagpenger"]')?.textContent).toContain(
            'Fortsett på søknad om dagpenger',
        );
        expect(container.querySelector('a[href="https://example.test/soknad"]')).toBeNull();
    });
});
