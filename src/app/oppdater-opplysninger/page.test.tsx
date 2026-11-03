import { isValidElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchArbeidssoekerregisteretSnapshot } from '@/app/oppdater-opplysninger/api';
import { snapshotMock } from '@/app/oppdater-opplysninger/mock-data';
import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';
import Page from './page';

const mocks = vi.hoisted(() => ({
    redirect: vi.fn((destination: string): never => {
        throw { destination };
    }),
}));

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('@/app/oppdater-opplysninger/api', () => ({ fetchArbeidssoekerregisteretSnapshot: vi.fn() }));
vi.mock('@/components/feilmeldinger/feilmeldinger', () => ({
    FeilmeldingGenerell: vi.fn(() => null),
}));

const sprak = ['nb', 'nn', 'en'] as const;

async function hentNavigeringsvalg(language: (typeof sprak)[number]) {
    const pageElement = await Page({
        params: Promise.resolve({ lang: language }),
        searchParams: Promise.resolve({}),
    });
    const child = pageElement.props.children;

    if (!isValidElement(child)) throw new Error('Forventet navigeringskomponent som Suspense-child');

    const navigate = child.type as (props: { sprak: (typeof sprak)[number] }) => Promise<ReactNode>;
    return navigate(child.props as { sprak: (typeof sprak)[number] });
}

function forventRedirect(destination: string) {
    return { destination };
}

describe('oppdater-opplysninger navigeringsvalg', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it.each(sprak)('sender %s til start når snapshot mangler', async (language) => {
        vi.mocked(fetchArbeidssoekerregisteretSnapshot).mockResolvedValueOnce({ data: undefined });

        await expect(hentNavigeringsvalg(language)).rejects.toMatchObject(
            forventRedirect(language === 'nb' ? '/start' : `/${language}/start`),
        );
    });

    it.each(sprak)('sender %s til start når perioden er avsluttet', async (language) => {
        const snapshot = structuredClone(snapshotMock);
        snapshot.avsluttet = {} as typeof snapshot.avsluttet;
        vi.mocked(fetchArbeidssoekerregisteretSnapshot).mockResolvedValueOnce({ data: snapshot });

        await expect(hentNavigeringsvalg(language)).rejects.toMatchObject(
            forventRedirect(language === 'nb' ? '/start' : `/${language}/start`),
        );
    });

    it.each(sprak)('sender %s til oppsummeringen når snapshot har opplysning-id', async (language) => {
        vi.mocked(fetchArbeidssoekerregisteretSnapshot).mockResolvedValueOnce({ data: structuredClone(snapshotMock) });

        const prefix = language === 'nb' ? '' : `/${language}`;
        await expect(hentNavigeringsvalg(language)).rejects.toMatchObject(
            forventRedirect(`${prefix}/oppdater-opplysninger/5`),
        );
    });

    it.each(sprak)('sender %s til første side når snapshot ikke har opplysning', async (language) => {
        const snapshot = structuredClone(snapshotMock);
        snapshot.opplysning = undefined;
        vi.mocked(fetchArbeidssoekerregisteretSnapshot).mockResolvedValueOnce({ data: snapshot });

        const prefix = language === 'nb' ? '' : `/${language}`;
        await expect(hentNavigeringsvalg(language)).rejects.toMatchObject(
            forventRedirect(`${prefix}/oppdater-opplysninger/1`),
        );
    });

    it.each(sprak)('viser generell feilmelding på %s når snapshot-kallet feiler', async (language) => {
        vi.mocked(fetchArbeidssoekerregisteretSnapshot).mockResolvedValueOnce({ error: new Error('syntetisk feil') });

        const result = await hentNavigeringsvalg(language);

        expect(isValidElement(result)).toBe(true);
        if (isValidElement(result)) expect(result.type).toBe(FeilmeldingGenerell);
        expect(mocks.redirect).not.toHaveBeenCalled();
    });
});
