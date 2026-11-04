import { isValidElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    FeilKoderVedStartAvArbeidssoekerperiode as FeilKode,
    type FeilmeldingVedStartAvArbeidssoekerperiodeV2,
    ReglerForStartAvArbeidssoekerperiode as Regel,
} from '@/model/feilsituasjonTyper';
import { FeilmeldingGenerell } from './feilmeldinger';
import KanIkkeStartePeriodeV2 from './kan-ikke-starte-periode-v2';

const mocks = vi.hoisted(() => ({
    redirect: vi.fn((destination: string): never => {
        throw { destination };
    }),
    generellFeilmelding: vi.fn(() => null),
}));

vi.mock('next/navigation', async (importOriginal) => ({
    ...(await importOriginal<typeof import('next/navigation')>()),
    redirect: mocks.redirect,
}));
vi.mock('./feilmeldinger', () => ({ FeilmeldingGenerell: mocks.generellFeilmelding }));

const sprak = ['nb', 'nn', 'en'] as const;
const tekniskeFeilkoder = [
    FeilKode.FEIL_VED_LESING_AV_FORESPORSEL,
    FeilKode.UKJENT_FEIL,
    FeilKode.UVENTET_FEIL_MOT_EKSTERN_TJENESTE,
    FeilKode.IKKE_TILGANG,
];

function lagFeilmelding(feilKode: FeilKode, regel?: Regel): FeilmeldingVedStartAvArbeidssoekerperiodeV2 {
    return {
        melding: 'Syntetisk feilmelding',
        feilKode,
        aarsakTilAvvisning: regel
            ? { beskrivelse: 'Syntetisk årsak', regler: [{ id: regel, beskrivelse: 'Syntetisk regel' }], detaljer: [] }
            : undefined,
    };
}

async function forventRedirect(navigering: () => Promise<unknown> | unknown, destination: string) {
    let resultat: unknown;
    try {
        await navigering();
    } catch (error) {
        resultat = error;
    }
    expect(resultat).toMatchObject({ destination });
    expect(mocks.redirect).toHaveBeenCalledWith(destination);
}

describe('KanIkkeStartePeriodeV2 navigeringsvalg', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it.each(sprak)('sender under-18-situasjon på %s til veiledning', async (language) => {
        await forventRedirect(
            () =>
                KanIkkeStartePeriodeV2({
                    feilmelding: lagFeilmelding(FeilKode.AVVIST, Regel.UNDER_18_AAR),
                    sprak: language,
                }),
            language === 'nb' ? '/veiledning/under-18/' : `/${language}/veiledning/under-18/`,
        );
    });

    it.each(tekniskeFeilkoder)('sender teknisk feilkode %s til feilsiden på alle språk', async (feilKode) => {
        for (const language of sprak) {
            const prefix = language === 'nb' ? '' : `/${language}`;
            await forventRedirect(
                () => KanIkkeStartePeriodeV2({ feilmelding: lagFeilmelding(feilKode), sprak: language }),
                `${prefix}/feil/`,
            );
        }
    });

    it.each(sprak)('sender ukjent regel på %s til feilsiden', async (language) => {
        const prefix = language === 'nb' ? '' : `/${language}`;
        await forventRedirect(
            () =>
                KanIkkeStartePeriodeV2({
                    feilmelding: lagFeilmelding(FeilKode.AVVIST, Regel.UKJENT_REGEL),
                    sprak: language,
                }),
            `${prefix}/feil/`,
        );
    });

    it.each(sprak)('sender manglende oppholdstillatelse på %s til veiledning', async (language) => {
        const prefix = language === 'nb' ? '' : `/${language}`;
        await forventRedirect(
            () =>
                KanIkkeStartePeriodeV2({
                    feilmelding: lagFeilmelding(
                        FeilKode.AVVIST,
                        Regel.IKKE_BOSATT_I_NORGE_I_HENHOLD_TIL_FOLKEREGISTERLOVEN,
                    ),
                    sprak: language,
                }),
            `${prefix}/veiledning/oppholdstillatelse/`,
        );
    });

    it.each(sprak)('sender annen avvisning på %s til generell veiledning', async (language) => {
        const prefix = language === 'nb' ? '' : `/${language}`;
        await forventRedirect(
            () => KanIkkeStartePeriodeV2({ feilmelding: lagFeilmelding(FeilKode.AVVIST), sprak: language }),
            `${prefix}/veiledning/generell`,
        );
    });

    it.each(sprak)('viser generell feilmelding på %s når feilmelding mangler', (language) => {
        const result = KanIkkeStartePeriodeV2({ sprak: language });

        expect(isValidElement(result)).toBe(true);
        if (isValidElement(result)) expect(result.type).toBe(FeilmeldingGenerell);
        expect(mocks.redirect).not.toHaveBeenCalled();
    });
});
