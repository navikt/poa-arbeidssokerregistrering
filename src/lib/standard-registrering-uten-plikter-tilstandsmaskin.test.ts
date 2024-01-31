import { beregnNavigering } from './standard-registrering-uten-plikter-tilstandsmaskin';
import { SkjemaSide } from '../model/skjema';
import { DinSituasjon, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';

const sisteStilling = {
    label: 'Klovn kommunal sektor',
    styrk08: '5411',
    konseptId: 45779,
};

describe('Standard registrering uten plikter tilstandsmaskin', () => {
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
        it('returnerer Helseproblemer som neste side hvis man velger VIL_FORTSETTE_I_JOBB', () => {
            const state = beregnNavigering(SkjemaSide.SisteJobb, {
                dinSituasjon: DinSituasjon.VIL_FORTSETTE_I_JOBB,
                sisteJobb: sisteStilling,
            });
            expect(state.neste).toBe(SkjemaSide.Helseproblemer);
        });
        it('returnerer Din situasjon som forrige side', () => {
            const state = beregnNavigering(SkjemaSide.SisteJobb, {
                dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB,
            });
            expect(state.neste).toBe(SkjemaSide.Utdanning);
        });
        it('returnerer 2/9 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.SisteJobb, {
                dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB,
            });
            expect(state.fremdrift).toBe(2 / 9);
        });
    });
    describe('utdanning', () => {
        it('returnerer GodkjentUtdanning som neste side når har høyere utdanning', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                dinSituasjon: DinSituasjon.MISTET_JOBBEN,
                sisteJobb: sisteStilling,
                utdanning: Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
            });
            expect(state.neste).toBe(SkjemaSide.GodkjentUtdanning);
        });
        it('returnerer Helseproblemer som neste side når ingen utdanning', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                dinSituasjon: DinSituasjon.MISTET_JOBBEN,
                sisteJobb: sisteStilling,
                utdanning: Utdanningsnivaa.INGEN_UTDANNING,
            });
            expect(state.neste).toBe(SkjemaSide.Helseproblemer);
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
        it('returnerer 3/9 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                dinSituasjon: DinSituasjon.MISTET_JOBBEN,
                sisteJobb: sisteStilling,
                utdanning: Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
            });
            expect(state.fremdrift).toBe(3 / 9);
        });
    });
    describe('GodkjentUtdanning', () => {
        it('returnerer BestattUtdanning som neste', () => {
            const { neste } = beregnNavigering(SkjemaSide.GodkjentUtdanning, {});
            expect(neste).toBe(SkjemaSide.BestaattUtdanning);
        });

        it('returnerer Utdanning som forrige', () => {
            const { forrige } = beregnNavigering(SkjemaSide.GodkjentUtdanning, {});
            expect(forrige).toBe(SkjemaSide.Utdanning);
        });

        it('returnerer 4/9 i fremdrift', () => {
            const { fremdrift } = beregnNavigering(SkjemaSide.GodkjentUtdanning, {});
            expect(fremdrift).toBe(4 / 9);
        });
    });

    describe('BestattUtdanning', () => {
        it('returnerer Helseproblemer som neste', () => {
            const { neste } = beregnNavigering(SkjemaSide.BestaattUtdanning, {});
            expect(neste).toBe(SkjemaSide.Helseproblemer);
        });

        it('returnerer GodkjentUtdanning som forrige', () => {
            const { forrige } = beregnNavigering(SkjemaSide.BestaattUtdanning, {});
            expect(forrige).toBe(SkjemaSide.GodkjentUtdanning);
        });

        it('returnerer 4/9 i fremdrift', () => {
            const { fremdrift } = beregnNavigering(SkjemaSide.BestaattUtdanning, {});
            expect(fremdrift).toBe(5 / 9);
        });
    });

    describe('Helseproblemer', () => {
        it('returnerer AndreProblemer som neste', () => {
            const { neste } = beregnNavigering(SkjemaSide.Helseproblemer, {});
            expect(neste).toBe(SkjemaSide.AndreProblemer);
        });

        it('returnerer Utdanning som forrige når ingen utdanning', () => {
            const { forrige } = beregnNavigering(SkjemaSide.Helseproblemer, {
                utdanning: Utdanningsnivaa.INGEN_UTDANNING,
            });
            expect(forrige).toBe(SkjemaSide.Utdanning);
        });

        it('returnerer BestattUtdanning som forrige når man har utdanning', () => {
            const { forrige } = beregnNavigering(SkjemaSide.Helseproblemer, {
                utdanning: Utdanningsnivaa.GRUNNSKOLE,
            });
            expect(forrige).toBe(SkjemaSide.BestaattUtdanning);
        });
        it('returnerer SisteJobb som forrige når DinSituasjon er VIL_FORTSETTE_I_JOBB', () => {
            const { forrige } = beregnNavigering(SkjemaSide.Helseproblemer, {
                dinSituasjon: DinSituasjon.VIL_FORTSETTE_I_JOBB,
                utdanning: Utdanningsnivaa.INGEN_UTDANNING,
            });
            expect(forrige).toBe(SkjemaSide.SisteJobb);
        });
        it('returnerer 6/9 i fremdrift', () => {
            const { fremdrift } = beregnNavigering(SkjemaSide.Helseproblemer, {});
            expect(fremdrift).toBe(6 / 9);
        });
    });

    describe('AndreProblemer', () => {
        it('returnerer Helseproblemer som forrige', () => {
            const { forrige } = beregnNavigering(SkjemaSide.AndreProblemer, {});
            expect(forrige).toBe(SkjemaSide.Helseproblemer);
        });

        it('returnerer Oppsummering som neste', () => {
            const { neste } = beregnNavigering(SkjemaSide.AndreProblemer, {});
            expect(neste).toBe(SkjemaSide.Oppsummering);
        });

        it('returnerer 7/9 i fremdrift', () => {
            const { fremdrift } = beregnNavigering(SkjemaSide.AndreProblemer, {});
            expect(fremdrift).toBe(7 / 9);
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
