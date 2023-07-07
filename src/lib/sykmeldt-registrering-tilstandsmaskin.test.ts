import { SkjemaSide } from '../model/skjema';
import { beregnNavigering } from './sykmeldt-registrering-tilstandsmaskin';
import { FremtidigSituasjon, TilbakeIArbeid, Utdanningsnivaa } from '../model/sporsmal';

describe('Sykmeldt registrering tilstandsmaskin', () => {
    describe('Fremtidig situasjon', () => {
        it('returnerer Utdanning som neste for TRENGER_NY_JOBBb', () => {
            const state = beregnNavigering(SkjemaSide.SykmeldtFremtidigSituasjon, {
                fremtidigSituasjon: FremtidigSituasjon.NY_ARBEIDSGIVER,
            });
            expect(state.neste).toBe(SkjemaSide.Utdanning);
            expect(state.forrige).toBeUndefined();
        });
        it('returnerer Utdanning som neste for USIKKER', () => {
            const state = beregnNavigering(SkjemaSide.SykmeldtFremtidigSituasjon, {
                fremtidigSituasjon: FremtidigSituasjon.USIKKER_SITUASJON,
            });
            expect(state.neste).toBe(SkjemaSide.Utdanning);
        });
        it('returnerer Oppsummering som neste for INGEN_ALTERNATIVER_PASSER', () => {
            const state = beregnNavigering(SkjemaSide.SykmeldtFremtidigSituasjon, {
                fremtidigSituasjon: FremtidigSituasjon.INGEN_PASSER,
            });
            expect(state.neste).toBe(SkjemaSide.Oppsummering);
        });
        it('returnerer TilbakeTilJobb som neste for TILBAKE_TIL_JOBB', () => {
            const state = beregnNavigering(SkjemaSide.SykmeldtFremtidigSituasjon, {
                fremtidigSituasjon: FremtidigSituasjon.SAMME_ARBEIDSGIVER,
            });
            expect(state.neste).toBe(SkjemaSide.TilbakeTilJobb);
        });
        it('returnerer TilbakeTilJobb som neste for TILBAKE_TIL_NY_STILLING', () => {
            const state = beregnNavigering(SkjemaSide.SykmeldtFremtidigSituasjon, {
                fremtidigSituasjon: FremtidigSituasjon.SAMME_ARBEIDSGIVER_NY_STILLING,
            });
            expect(state.neste).toBe(SkjemaSide.TilbakeTilJobb);
        });
        it('returnerer 1/8 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.SykmeldtFremtidigSituasjon, {
                fremtidigSituasjon: FremtidigSituasjon.SAMME_ARBEIDSGIVER_NY_STILLING,
            });
            expect(state.fremdrift).toBe(1 / 7);
        });
    });

    describe('Utdanning', () => {
        it('returnerer Fremtidig situasjon som forrige', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {});
            expect(state.forrige).toBe(SkjemaSide.SykmeldtFremtidigSituasjon);
        });
        it('returnerer GodkjentUtdanning som neste for Utdanningsnivaa.HOYERE', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                utdanning: Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
            });
            expect(state.neste).toBe(SkjemaSide.GodkjentUtdanning);
        });
        it('returnerer AndreProblemer som neste for Utdanningsnivaa.INGEN', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                utdanning: Utdanningsnivaa.INGEN_UTDANNING,
            });
            expect(state.neste).toBe(SkjemaSide.AndreProblemer);
        });
        it('returnerer 2/7 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.Utdanning, {
                fremtidigSituasjon: FremtidigSituasjon.SAMME_ARBEIDSGIVER_NY_STILLING,
            });
            expect(state.fremdrift).toBe(2 / 7);
        });
    });

    describe('GodkjentUtdanning', () => {
        it('returnerer Utdanning som forrige', () => {
            const state = beregnNavigering(SkjemaSide.GodkjentUtdanning, {});
            expect(state.forrige).toBe(SkjemaSide.Utdanning);
        });
        it('returnerer BestaattUtdanning som neste', () => {
            const state = beregnNavigering(SkjemaSide.GodkjentUtdanning, {});
            expect(state.neste).toBe(SkjemaSide.BestaattUtdanning);
        });
        it('returnerer 3/7 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.GodkjentUtdanning, {});
            expect(state.fremdrift).toBe(3 / 7);
        });
    });

    describe('BestaattUtdanning', () => {
        it('returnerer GodkjentUtdanning som forrige', () => {
            const state = beregnNavigering(SkjemaSide.BestaattUtdanning, {});
            expect(state.forrige).toBe(SkjemaSide.GodkjentUtdanning);
        });
        it('returnerer AndreProblemer som neste', () => {
            const state = beregnNavigering(SkjemaSide.BestaattUtdanning, {});
            expect(state.neste).toBe(SkjemaSide.AndreProblemer);
        });
        it('returnerer 4/7 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.BestaattUtdanning, {});
            expect(state.fremdrift).toBe(4 / 7);
        });
    });

    describe('AndreProblemer', () => {
        it('returnerer BestaattUtdanning som forrige hvis utdanning==Utdanningsnivaa.HOYERE', () => {
            const state = beregnNavigering(SkjemaSide.AndreProblemer, {
                utdanning: Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
            });
            expect(state.forrige).toBe(SkjemaSide.BestaattUtdanning);
        });
        it('returnerer Utdanning som forrige hvis valgt utdanning er Utdanningsnivaa.INGEN', () => {
            const state = beregnNavigering(SkjemaSide.AndreProblemer, {
                utdanning: Utdanningsnivaa.INGEN_UTDANNING,
            });
            expect(state.forrige).toBe(SkjemaSide.Utdanning);
        });
        it('returnerer Oppsummering som neste', () => {
            const state = beregnNavigering(SkjemaSide.AndreProblemer, {});
            expect(state.neste).toBe(SkjemaSide.Oppsummering);
        });
        it('returnerer 5/7 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.AndreProblemer, {});
            expect(state.fremdrift).toBe(5 / 7);
        });
    });

    describe('TilbakeTilJobb', () => {
        it('returnerer Oppsummering som neste for REDUSERT_STILLING', () => {
            const state = beregnNavigering(SkjemaSide.TilbakeTilJobb, {
                tilbakeIArbeid: TilbakeIArbeid.JA_REDUSERT_STILLING,
            });
            expect(state.neste).toBe(SkjemaSide.Oppsummering);
        });
        it('returnerer Oppsummering som neste for USIKKER', () => {
            const state = beregnNavigering(SkjemaSide.TilbakeTilJobb, {
                tilbakeIArbeid: TilbakeIArbeid.USIKKER,
            });
            expect(state.neste).toBe(SkjemaSide.Oppsummering);
        });
        it('returnerer Oppsummering som neste for NEI', () => {
            const state = beregnNavigering(SkjemaSide.TilbakeTilJobb, {
                tilbakeIArbeid: TilbakeIArbeid.NEI,
            });
            expect(state.neste).toBe(SkjemaSide.Oppsummering);
        });
        it('returnerer SkalTilbakeTilJobb som neste for FULL_STILLING', () => {
            const state = beregnNavigering(SkjemaSide.TilbakeTilJobb, {
                tilbakeIArbeid: TilbakeIArbeid.JA_FULL_STILLING,
            });
            expect(state.neste).toBe(SkjemaSide.SkalTilbakeTilJobb);
        });
        it('returnerer FremtidigSituasjon som forrige', () => {
            const state = beregnNavigering(SkjemaSide.TilbakeTilJobb, {});
            expect(state.forrige).toBe(SkjemaSide.SykmeldtFremtidigSituasjon);
        });
        it('returnerer 2/4 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.TilbakeTilJobb, {});
            expect(state.fremdrift).toBe(2 / 4);
        });
    });
    describe('Oppsummering', () => {
        it('returnerer SykmeldtFremtidigSituasjon når sykmeldtFremtidigSituasjon=SykmeldtValg.INGEN_ALTERNATIVER_PASSER', () => {
            const state = beregnNavigering(SkjemaSide.Oppsummering, {
                fremtidigSituasjon: FremtidigSituasjon.INGEN_PASSER,
            });
            expect(state.forrige).toBe(SkjemaSide.SykmeldtFremtidigSituasjon);
        });

        it('returnerer TilbakeTilJobb når tilbakeTilJobb er satt i state', () => {
            const state = beregnNavigering(SkjemaSide.Oppsummering, {
                tilbakeIArbeid: TilbakeIArbeid.JA_REDUSERT_STILLING,
            });
            expect(state.forrige).toBe(SkjemaSide.TilbakeTilJobb);
        });

        it('returnerer AndreProblemer som default', () => {
            const state = beregnNavigering(SkjemaSide.Oppsummering, {});
            expect(state.forrige).toBe(SkjemaSide.AndreProblemer);
        });
        it('returnerer 6/7 i fremdrift', () => {
            const state = beregnNavigering(SkjemaSide.Oppsummering, {});
            expect(state.fremdrift).toBe(6 / 7);
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
