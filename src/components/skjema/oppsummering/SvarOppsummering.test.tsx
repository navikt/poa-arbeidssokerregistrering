import { DinSituasjon, SporsmalId } from '@navikt/arbeidssokerregisteret-utils';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { SkjemaState } from '@/model/skjema';

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('../../../hooks/useSprak', () => ({ default: () => 'nb' }));

vi.mock('@/model/sporsmal', () => ({
    hentTekst: (_sprak: string, svar: unknown) => String(svar),
}));

import SvarOppsummering from './SvarOppsummering';

const renderToMarkup = async (element: ReactNode) => {
    const { renderToStaticMarkup } = await vi.importActual<{
        renderToStaticMarkup: (element: ReactNode) => string;
    }>('react-dom/server');

    return renderToStaticMarkup(element);
};

const lagSkjemaState = (state: Record<string, unknown>) => state as unknown as SkjemaState;

const renderOppsummering = (skjemaState: SkjemaState) => (
    <SvarOppsummering skjemaState={skjemaState} skjemaPrefix="/opplysninger/" />
);

describe('SvarOppsummering', () => {
    it('viser ikke tom utdanning for VIL_FORTSETTE_I_JOBB, men beholder stilling og hindringer', async () => {
        const markup = await renderToMarkup(
            renderOppsummering(
                lagSkjemaState({
                    [SporsmalId.dinSituasjon]: DinSituasjon.VIL_FORTSETTE_I_JOBB,
                    [SporsmalId.sisteJobb]: { label: 'Utvikler' },
                    [SporsmalId.sisteStilling]: 'metadata',
                    [SporsmalId.utdanning]: undefined,
                    [SporsmalId.utdanningGodkjent]: null,
                    [SporsmalId.utdanningBestatt]: undefined,
                    [SporsmalId.helseHinder]: 'NEI',
                }),
            ),
        );

        expect(markup).toContain('Siste stilling');
        expect(markup).toContain('Utvikler');
        expect(markup).toContain('Hindringer');
        expect(markup).toContain('NEI');
        expect(markup).not.toContain('Utdanning');
        expect(markup).not.toContain('/opplysninger/3');
    });

    it('viser ikke siste jobb når situasjonen er ALDRI_HATT_JOBB', async () => {
        const markup = await renderToMarkup(
            renderOppsummering(
                lagSkjemaState({
                    [SporsmalId.dinSituasjon]: DinSituasjon.ALDRI_HATT_JOBB,
                    [SporsmalId.sisteJobb]: { label: 'Utvikler' },
                    [SporsmalId.sisteStilling]: 'metadata',
                }),
            ),
        );

        expect(markup).toContain('Situasjon');
        expect(markup).not.toContain('Siste stilling');
        expect(markup).not.toContain('Utvikler');
    });

    it('beholder besvart utdanning, også verdier som er false eller 0', async () => {
        const markup = await renderToMarkup(
            renderOppsummering(
                lagSkjemaState({
                    [SporsmalId.utdanning]: 'BACHELOR',
                    [SporsmalId.utdanningGodkjent]: false,
                    [SporsmalId.utdanningBestatt]: 0,
                }),
            ),
        );

        expect(markup).toContain('Utdanning');
        expect(markup).toContain('BACHELOR');
        expect(markup).toContain('false');
        expect(markup).toContain('0');
        expect(markup).toContain('/opplysninger/3');
    });
});
