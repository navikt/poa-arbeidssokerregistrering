import type { SisteJobb } from '@navikt/arbeidssokerregisteret-utils';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StillingsSok from './stillings-sok-v2';

vi.mock('@/lib/tracker', () => ({ loggAktivitet: vi.fn() }));

type Root = { render: (node: ReactNode) => void; unmount: () => void };
type ReactDomApi = { createRoot: (container: Element) => Root };

const stilling: SisteJobb = { konseptId: 12345, label: 'Sykepleier', styrk08: '2221' };

describe('StillingsSok med Aksel', () => {
    let container: HTMLDivElement;
    let root: Root;
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
        vi.stubGlobal('fetch', fetchMock);
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(Response.json([stilling]));
        container = document.createElement('div');
        document.body.append(container);
        const { createRoot } = await vi.importActual<ReactDomApi>('react-dom/client');
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    async function mount(onClose = vi.fn()) {
        await act(async () => root.render(<StillingsSok label="Søk etter stilling" onClose={onClose} />));
        const input = container.querySelector('input');
        expect(input).not.toBeNull();
        if (!input) throw new Error('Søkefeltet mangler');
        expect(input.getAttribute('role')).toBe('combobox');
        expect(container.querySelector('label')?.getAttribute('for')).toBe(input.id);
        return { input, onClose };
    }

    async function skriv(input: HTMLInputElement, value: string) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (!setter) throw new Error('Input-setteren mangler');
        await act(async () => {
            setter.call(input, value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await act(async () => vi.advanceTimersByTimeAsync(250));
    }

    async function tast(input: HTMLInputElement, key: string) {
        await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })));
        await act(async () => vi.advanceTimersByTimeAsync(0));
        await act(async () => input.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true })));
    }

    it('søker i samme API og returnerer det opprinnelige stillingsobjektet', async () => {
        const { input, onClose } = await mount();
        await skriv(input, 'Sykepleier');
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost');
        expect(url.pathname).toBe('/arbeid/registrering/api/yrke-med-styrk-v2/');
        expect(url.searchParams.get('yrke')).toBe('Sykepleier');
        expect(container.textContent).toContain('Sykepleier');
        const controlsId = input.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();
        const listbox = document.getElementById(controlsId ?? '')?.querySelector('ul');
        expect(listbox).toHaveAttribute('aria-label', 'Søk etter stilling');
        await tast(input, 'ArrowDown');
        await tast(input, 'Enter');
        expect(onClose).toHaveBeenCalledWith(stilling);
    });

    it('beholder Annen stilling som valg når søket ikke har treff', async () => {
        fetchMock.mockResolvedValue(Response.json([]));
        const { input, onClose } = await mount();
        await skriv(input, 'Ukjent yrke');
        expect(container.textContent).toContain('Annen stilling');
        await tast(input, 'ArrowDown');
        await tast(input, 'Enter');
        expect(onClose).toHaveBeenCalledWith({ konseptId: -1, label: 'Annen stilling', styrk08: '-1' });
    });

    it('lukker søket uten å velge en stilling ved Escape', async () => {
        const { input, onClose } = await mount();
        await tast(input, 'Escape');
        expect(onClose).toHaveBeenCalledWith();
    });

    it('avbryter forespørselen når søket avmonteres', async () => {
        fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
        const { input } = await mount();
        await skriv(input, 'Sykepleier');
        const signal = fetchMock.mock.calls[0][1]?.signal;
        expect(signal?.aborted).toBe(false);
        await act(async () => root.render(null));
        expect(signal?.aborted).toBe(true);
    });

    it('gir to søkefelt forskjellige ID-er og riktige etiketter', async () => {
        await act(async () =>
            root.render(
                <>
                    <StillingsSok label="Første stilling" onClose={vi.fn()} />
                    <StillingsSok label="Andre stilling" onClose={vi.fn()} />
                </>,
            ),
        );
        const inputs = Array.from(container.querySelectorAll('input')).filter(
            (input) => input.getAttribute('role') === 'combobox',
        );
        expect(inputs).toHaveLength(2);
        expect(new Set(inputs.map((input) => input.id)).size).toBe(2);
        const labels = Array.from(container.querySelectorAll('label'));
        expect(labels.map((label) => label.htmlFor)).toEqual(inputs.map((input) => input.id));
        expect(labels.map((label) => label.textContent)).toEqual(['Første stilling', 'Andre stilling']);
    });
});
