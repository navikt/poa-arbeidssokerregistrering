import {
    Navigering,
    NavigeringsTilstandsMaskin,
    SkjemaSide,
    SkjemaState,
    StandardSkjemaSideUtenPlikter,
} from '../model/skjema';
import { DinSituasjon, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';

const TILSTANDER_UTEN_PLIKTER: NavigeringsTilstandsMaskin<StandardSkjemaSideUtenPlikter> = {
    [SkjemaSide.DinSituasjon]: (skjemaState: SkjemaState) => {
        if (skjemaState.dinSituasjon === DinSituasjon.ALDRI_HATT_JOBB) {
            return {
                neste: SkjemaSide.Utdanning,
                forrige: undefined,
                fremdrift: 1 / 9,
            };
        }

        return {
            neste: SkjemaSide.SisteJobb,
            forrige: undefined,
            fremdrift: 1 / 9,
        };
    },
    [SkjemaSide.SisteJobb]: (skjemaState: SkjemaState) => {
        if (skjemaState.dinSituasjon === DinSituasjon.VIL_FORTSETTE_I_JOBB) {
            return {
                neste: SkjemaSide.Helseproblemer,
                forrige: SkjemaSide.DinSituasjon,
                fremdrift: 2 / 9,
            };
        }
        return {
            neste: SkjemaSide.Utdanning,
            forrige: SkjemaSide.DinSituasjon,
            fremdrift: 2 / 9,
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
            fremdrift: 3 / 9,
        };
    },
    [SkjemaSide.GodkjentUtdanning]: () => {
        return {
            neste: SkjemaSide.BestaattUtdanning,
            forrige: SkjemaSide.Utdanning,
            fremdrift: 4 / 9,
        };
    },
    [SkjemaSide.BestaattUtdanning]: () => {
        return {
            neste: SkjemaSide.Helseproblemer,
            forrige: SkjemaSide.GodkjentUtdanning,
            fremdrift: 5 / 9,
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
            fremdrift: 6 / 9,
        };
    },
    [SkjemaSide.AndreProblemer]: () => {
        return {
            neste: SkjemaSide.Oppsummering,
            forrige: SkjemaSide.Helseproblemer,
            fremdrift: 7 / 9,
        };
    },
    [SkjemaSide.OppsummeringUtenPlikter]: () => {
        return {
            neste: undefined,
            forrige: SkjemaSide.AndreProblemer,
            fremdrift: 8 / 9,
        };
    },
};

export type StandardRegistreringUtenPlikterTilstandsmaskin = (
    aktivSide: StandardSkjemaSideUtenPlikter,
    state: SkjemaState,
) => Navigering<StandardSkjemaSideUtenPlikter>;

export const beregnNavigering: StandardRegistreringUtenPlikterTilstandsmaskin = (aktivSide, state) => {
    if (TILSTANDER_UTEN_PLIKTER[aktivSide]) {
        return TILSTANDER_UTEN_PLIKTER[aktivSide](state);
    }

    return {
        neste: undefined,
        forrige: undefined,
        fremdrift: -1,
    };
};
