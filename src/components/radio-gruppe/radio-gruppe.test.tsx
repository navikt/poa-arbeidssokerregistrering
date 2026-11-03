import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ReactDomClientApi = {
    createRoot: (container: Element) => {
        render: (node: ReactNode) => void;
        unmount: () => void;
    };
};

vi.mock('../../hooks/useSprak', () => ({ default: () => 'nb' }));

import RadioGruppe from './radio-gruppe';

describe('RadioGruppe', () => {
    let root: ReturnType<ReactDomClientApi['createRoot']> | undefined;
    let container: HTMLDivElement;

    beforeEach(() => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
        container = document.createElement('div');
        document.body.append(container);
    });

    afterEach(async () => {
        if (root) {
            await act(async () => root?.unmount());
            root = undefined;
        }
        container.remove();
        vi.unstubAllGlobals();
    });

    async function render(valgt?: string) {
        const { createRoot } = await vi.importActual<ReactDomClientApi>('react-dom/client');
        if (!root) {
            root = createRoot(container);
        }

        await act(async () => {
            root?.render(
                <RadioGruppe
                    valg={[
                        { tekst: 'Ja', value: 'JA' },
                        { tekst: 'Nei', value: 'NEI' },
                    ]}
                    valgt={valgt}
                    visFeilmelding
                />,
            );
        });
    }

    function expectError() {
        expect(container.textContent).toContain('Du må svare på spørsmålet før du kan gå videre.');
        expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
    }

    it('shows an error only when the selected value is not one of the available options', async () => {
        await render();
        expectError();

        await render('JA');
        expect(container.textContent).not.toContain('Du må svare på spørsmålet før du kan gå videre.');
        expect(container.querySelector<HTMLInputElement>('input[value="JA"]')?.checked).toBe(true);
        expect(container.querySelector('[aria-invalid="true"]')).toBeNull();

        await render('NEI');
        expect(container.textContent).not.toContain('Du må svare på spørsmålet før du kan gå videre.');
        expect(container.querySelector<HTMLInputElement>('input[value="NEI"]')?.checked).toBe(true);
        expect(container.querySelector('[aria-invalid="true"]')).toBeNull();

        await render('UKJENT');
        expectError();

        await render('INGEN_SVAR');
        expectError();
    });
});
