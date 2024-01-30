import { Navigering, NavigeringsTilstandsMaskin, SkjemaSide, SkjemaState, StandardSkjemaSide } from '../model/skjema';
import { DinSituasjon, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';

const TILSTANDER: NavigeringsTilstandsMaskin<StandardSkjemaSide> = {
    [SkjemaSide.DinSituasjon]: (skjemaState: SkjemaState) => {
        if (skjemaState.dinSituasjon === DinSituasjon.ALDRI_HATT_JOBB) {
            return {
                neste: SkjemaSide.Utdanning,
                forrige: undefined,
                fremdrift: 1 / 10,
            };
        }

        return {
            neste: SkjemaSide.SisteJobb,
            forrige: undefined,
            fremdrift: 1 / 10,
        };
    },
    [SkjemaSide.SisteJobb]: (skjemaState: SkjemaState) => {
        if (skjemaState.dinSituasjon === DinSituasjon.VIL_FORTSETTE_I_JOBB) {
            return {
                neste: SkjemaSide.Helseproblemer,
                forrige: SkjemaSide.DinSituasjon,
                fremdrift: 2 / 10,
            };
        }
        return {
            neste: SkjemaSide.Utdanning,
            forrige: SkjemaSide.DinSituasjon,
            fremdrift: 2 / 10,
        };
    },
    [SkjemaSide.Utdanning]: (skjemaState: SkjemaState) => {
        return {
            neste:
                skjemaState.utdanning === Utdanningsnivaa.INGEN_UTDANNING
                    ? SkjemaSide.Helseproblemer
                    : SkjemaSide.GodkjentUtdanning,
            forrige:
                skjemaState.dinSituasjon === DinSituasjon.ALDRI_HATT_JOBB
                    ? SkjemaSide.DinSituasjon
                    : SkjemaSide.SisteJobb,
            fremdrift: 3 / 10,
        };
    },
    [SkjemaSide.GodkjentUtdanning]: () => {
        return {
            neste: SkjemaSide.BestaattUtdanning,
            forrige: SkjemaSide.Utdanning,
            fremdrift: 4 / 10,
        };
    },
    [SkjemaSide.BestaattUtdanning]: () => {
        return {
            neste: SkjemaSide.Helseproblemer,
            forrige: SkjemaSide.GodkjentUtdanning,
            fremdrift: 5 / 10,
        };
    },
    [SkjemaSide.Helseproblemer]: (skjemaState: SkjemaState) => {
        const forrige = () => {
            if (skjemaState.dinSituasjon === DinSituasjon.VIL_FORTSETTE_I_JOBB) {
                return SkjemaSide.SisteJobb;
            }
            return skjemaState.utdanning === Utdanningsnivaa.INGEN_UTDANNING
                ? SkjemaSide.Utdanning
                : SkjemaSide.BestaattUtdanning;
        };
        return {
            neste: SkjemaSide.AndreProblemer,
            forrige: forrige(),
            fremdrift: 6 / 10,
        };
    },
    [SkjemaSide.AndreProblemer]: () => {
        return {
            neste: SkjemaSide.Oppsummering,
            forrige: SkjemaSide.Helseproblemer,
            fremdrift: 7 / 10,
        };
    },
    [SkjemaSide.Oppsummering]: () => {
        return {
            neste: SkjemaSide.FullforRegistrering,
            forrige: SkjemaSide.AndreProblemer,
            fremdrift: 8 / 10,
        };
    },
    [SkjemaSide.FullforRegistrering]: () => {
        return {
            neste: undefined,
            forrige: SkjemaSide.Oppsummering,
            fremdrift: 9 / 10,
        };
    },
};

export type StandardRegistreringTilstandsmaskin = (
    aktivSide: StandardSkjemaSide,
    state: SkjemaState,
) => Navigering<StandardSkjemaSide>;
export const beregnNavigering: StandardRegistreringTilstandsmaskin = (aktivSide, state) => {
    if (TILSTANDER[aktivSide]) {
        return TILSTANDER[aktivSide](state);
    }

    return {
        neste: undefined,
        forrige: undefined,
        fremdrift: -1,
    };
};
