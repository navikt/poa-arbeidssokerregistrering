import { Navigering, NavigeringsTilstandsMaskin, SkjemaSide, SkjemaState, SykmeldtSkjemaSide } from '../model/skjema';
import { FremtidigSituasjon, TilbakeIArbeid, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';

const TILSTANDER: NavigeringsTilstandsMaskin<SykmeldtSkjemaSide> = {
    [SkjemaSide.SykmeldtFremtidigSituasjon]: (state: SkjemaState) => {
        if (
            state.fremtidigSituasjon &&
            [FremtidigSituasjon.NY_ARBEIDSGIVER, FremtidigSituasjon.USIKKER].includes(state.fremtidigSituasjon)
        ) {
            return {
                neste: SkjemaSide.Utdanning,
                forrige: undefined,
                fremdrift: 1 / 7,
            };
        }

        if (state.fremtidigSituasjon === FremtidigSituasjon.INGEN_PASSER) {
            return {
                neste: SkjemaSide.Oppsummering,
                forrige: undefined,
                fremdrift: 1 / 7,
            };
        }

        return {
            neste: SkjemaSide.TilbakeTilJobb,
            forrige: undefined,
            fremdrift: 1 / 7,
        };
    },
    [SkjemaSide.Utdanning]: (skjemaState: SkjemaState) => {
        return {
            neste:
                skjemaState.utdanning === Utdanningsnivaa.INGEN_UTDANNING
                    ? SkjemaSide.AndreProblemer
                    : SkjemaSide.GodkjentUtdanning,
            forrige: SkjemaSide.SykmeldtFremtidigSituasjon,
            fremdrift: 2 / 7,
        };
    },
    [SkjemaSide.GodkjentUtdanning]: () => {
        return {
            neste: SkjemaSide.BestaattUtdanning,
            forrige: SkjemaSide.Utdanning,
            fremdrift: 3 / 7,
        };
    },
    [SkjemaSide.BestaattUtdanning]: () => {
        return {
            neste: SkjemaSide.AndreProblemer,
            forrige: SkjemaSide.GodkjentUtdanning,
            fremdrift: 4 / 7,
        };
    },
    [SkjemaSide.AndreProblemer]: (skjemaState: SkjemaState) => {
        return {
            neste: SkjemaSide.Oppsummering,
            forrige:
                skjemaState.utdanning === Utdanningsnivaa.INGEN_UTDANNING
                    ? SkjemaSide.Utdanning
                    : SkjemaSide.BestaattUtdanning,
            fremdrift: 5 / 7,
        };
    },
    [SkjemaSide.TilbakeTilJobb]: (state: SkjemaState) => {
        if (state.tilbakeIArbeid === TilbakeIArbeid.JA_FULL_STILLING) {
            return {
                neste: SkjemaSide.SkalTilbakeTilJobb,
                forrige: SkjemaSide.SykmeldtFremtidigSituasjon,
                fremdrift: 2 / 4,
            };
        }
        return {
            neste: SkjemaSide.Oppsummering,
            forrige: SkjemaSide.SykmeldtFremtidigSituasjon,
            fremdrift: 2 / 4,
        };
    },
    [SkjemaSide.Oppsummering]: (state: SkjemaState) => {
        if (state.fremtidigSituasjon === FremtidigSituasjon.INGEN_PASSER) {
            return {
                forrige: SkjemaSide.SykmeldtFremtidigSituasjon,
                neste: undefined,
                fremdrift: 6 / 7,
            };
        }
        if (state.tilbakeIArbeid) {
            return {
                forrige: SkjemaSide.TilbakeTilJobb,
                neste: undefined,
                fremdrift: 6 / 7,
            };
        }
        return {
            forrige: SkjemaSide.AndreProblemer,
            neste: undefined,
            fremdrift: 6 / 7,
        };
    },
    [SkjemaSide.SkalTilbakeTilJobb]: () => {
        return {
            fremdrift: 1,
            forrige: SkjemaSide.TilbakeTilJobb,
        };
    },
};
export type SykmeldtRegistreringTilstandsmaskin = (
    aktivSide: SykmeldtSkjemaSide,
    state: SkjemaState,
) => Navigering<SykmeldtSkjemaSide>;
export const beregnNavigering: SykmeldtRegistreringTilstandsmaskin = (aktivSide, state) => {
    if (TILSTANDER[aktivSide]) {
        return TILSTANDER[aktivSide](state);
    }

    return {
        neste: undefined,
        forrige: undefined,
        fremdrift: -1,
    };
};
