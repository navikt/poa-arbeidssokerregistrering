import { beregnNavigering } from './standard-registrering-tilstandsmaskin';
import { SkjemaSide } from '../model/skjema';
import { DinSituasjon, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';

const sisteStilling = {
    label: 'Klovn kommunal sektor',
    styrk08: '5411',
    konseptId: 45779,
};

describe('Standard registrering tilstandsmaskin', () => {
    describe('din situasjon', () => {
        it('returnerer SisteJobb som neste når mistet jobb', () => {
            const state = beregnNavigering(SkjemaSide.DinSituasjon, {
                dinSituasjon: DinSituasjon.MISTET_JOBBEN,
            });
            expect(state.neste).toBe(SkjemaSide.SisteJobb);
        });
        it('returnerer Utdanning som neste når aldri jobbet', () => {
            const state = beregnNavigering(SkjemaSide.DinSituasjon, {
                dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB,
            });
            expect(state.neste).toBe(SkjemaSide.Utdanning);
        });
        it('returnerer 0 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.DinSituasjon, {
                dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB,
            });
            expect(state.neste).toBe(SkjemaSide.Utdanning);
        });
    });
    describe('siste jobb', () => {
        it('returnerer Utdanning som neste side', () => {
            const state = beregnNavigering(SkjemaSide.SisteJobb, {
                dinSituasjon: DinSituasjon.MISTET_JOBBEN,
                sisteJobb: sisteStilling,
            });
            expect(state.neste).toBe(SkjemaSide.Utdanning);
        });
        it('returnerer Hindringer som neste side hvis man velger VIL_FORTSETTE_I_JOBB', () => {
            const state = beregnNavigering(SkjemaSide.SisteJobb, {
                dinSituasjon: DinSituasjon.VIL_FORTSETTE_I_JOBB,
                sisteJobb: sisteStilling,
            });
            expect(state.neste).toBe(SkjemaSide.Hindringer);
        });
        it('returnerer Din situasjon som forrige side', () => {
            const state = beregnNavigering(SkjemaSide.SisteJobb, {
                dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB,
            });
            expect(state.neste).toBe(SkjemaSide.Utdanning);
        });
        it('returnerer 2/6 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.SisteJobb, {
                dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB,
            });
            expect(state.fremdrift).toBe(2 / 6);
        });
    });
    describe('utdanning', () => {
        it('returnerer Hindringer som neste', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                dinSituasjon: DinSituasjon.MISTET_JOBBEN,
                sisteJobb: sisteStilling,
                utdanning: Utdanningsnivaa.INGEN_UTDANNING,
            });
            expect(state.neste).toBe(SkjemaSide.Hindringer);
        });
        it('returnerer DinSituasjon som forrige side når aldri jobbet', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB,
                sisteJobb: sisteStilling,
                utdanning: Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
            });
            expect(state.forrige).toBe(SkjemaSide.DinSituasjon);
        });
        it('returnerer SisteJobb som forrige side når mistet jobb', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                dinSituasjon: DinSituasjon.MISTET_JOBBEN,
                sisteJobb: sisteStilling,
                utdanning: Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
            });
            expect(state.forrige).toBe(SkjemaSide.SisteJobb);
        });
        it('returnerer 3/6 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                dinSituasjon: DinSituasjon.MISTET_JOBBEN,
                sisteJobb: sisteStilling,
                utdanning: Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
            });
            expect(state.fremdrift).toBe(3 / 6);
        });
    });

    describe('Hindringer', () => {
        it('returnerer Oppsummering som neste', () => {
            const { neste } = beregnNavigering(SkjemaSide.Hindringer, {});
            expect(neste).toBe(SkjemaSide.Oppsummering);
        });

        it('returnerer Utdanning som forrige når [ingen utdanning, grunnskole]', () => {
            [
                Utdanningsnivaa.INGEN_UTDANNING,
                Utdanningsnivaa.GRUNNSKOLE,
                Utdanningsnivaa.VIDEREGAENDE_FAGBREV_SVENNEBREV,
            ].forEach((utdanning) => {
                const { forrige } = beregnNavigering(SkjemaSide.Hindringer, {
                    utdanning,
                });
                expect(forrige).toBe(SkjemaSide.Utdanning);
            });
        });

        it('returnerer SisteJobb som forrige når DinSituasjon er VIL_FORTSETTE_I_JOBB', () => {
            const { forrige } = beregnNavigering(SkjemaSide.Hindringer, {
                dinSituasjon: DinSituasjon.VIL_FORTSETTE_I_JOBB,
                utdanning: Utdanningsnivaa.INGEN_UTDANNING,
            });
            expect(forrige).toBe(SkjemaSide.SisteJobb);
        });
        it('returnerer 6/9 i fremdrift', () => {
            const { fremdrift } = beregnNavigering(SkjemaSide.Hindringer, {});
            expect(fremdrift).toBe(4 / 6);
        });
    });

    describe('Ugyldig side', () => {
        it('returnerer negativ fremdrift', () => {
            const state = beregnNavigering(99 as any, {});
            expect(state).toEqual({
                forrige: undefined,
                neste: undefined,
                fremdrift: -1,
            });
        });
    });
});
