import { Navigering, NavigeringsTilstandsMaskin, SkjemaSide, SkjemaState, SkjemaSideType } from '../model/skjema';
import { DinSituasjon, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';

const TILSTANDER: NavigeringsTilstandsMaskin<SkjemaSideType> = {
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
            neste: [Utdanningsnivaa.INGEN_UTDANNING, Utdanningsnivaa.GRUNNSKOLE].includes(skjemaState.utdanning!)
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
            return [Utdanningsnivaa.INGEN_UTDANNING, Utdanningsnivaa.GRUNNSKOLE].includes(skjemaState.utdanning!)
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

export type StandardRegistreringTilstandsmaskin = (
    aktivSide: SkjemaSideType,
    state: SkjemaState,
) => Navigering<SkjemaSideType>;

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
