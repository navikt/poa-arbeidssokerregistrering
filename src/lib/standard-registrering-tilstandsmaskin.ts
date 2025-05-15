import { Navigering, NavigeringsTilstandsMaskin, SkjemaSide, SkjemaSideType, SkjemaState } from '../model/skjema';
import { DinSituasjon } from '@navikt/arbeidssokerregisteret-utils';

const TILSTANDER: NavigeringsTilstandsMaskin<SkjemaSideType> = {
    [SkjemaSide.DinSituasjon]: (skjemaState: SkjemaState) => {
        if (skjemaState.dinSituasjon === DinSituasjon.ALDRI_HATT_JOBB) {
            return {
                neste: SkjemaSide.Utdanning,
                forrige: undefined,
                fremdrift: 1 / 6,
            };
        }

        return {
            neste: SkjemaSide.SisteJobb,
            forrige: undefined,
            fremdrift: 1 / 6,
        };
    },
    [SkjemaSide.SisteJobb]: (skjemaState: SkjemaState) => {
        if (skjemaState.dinSituasjon === DinSituasjon.VIL_FORTSETTE_I_JOBB) {
            return {
                neste: SkjemaSide.Hindringer,
                forrige: SkjemaSide.DinSituasjon,
                fremdrift: 2 / 6,
            };
        }
        return {
            neste: SkjemaSide.Utdanning,
            forrige: SkjemaSide.DinSituasjon,
            fremdrift: 2 / 6,
        };
    },
    [SkjemaSide.Utdanning]: (skjemaState: SkjemaState) => {
        return {
            neste: SkjemaSide.Hindringer,
            forrige:
                skjemaState.dinSituasjon === DinSituasjon.ALDRI_HATT_JOBB
                    ? SkjemaSide.DinSituasjon
                    : SkjemaSide.SisteJobb,
            fremdrift: 3 / 6,
        };
    },
    [SkjemaSide.Hindringer]: (skjemaState: SkjemaState) => {
        const forrige = () => {
            if (skjemaState.dinSituasjon === DinSituasjon.VIL_FORTSETTE_I_JOBB) {
                return SkjemaSide.SisteJobb;
            }
            return SkjemaSide.Utdanning;
        };
        return {
            neste: SkjemaSide.Oppsummering,
            forrige: forrige(),
            fremdrift: 4 / 6,
        };
    },
    [SkjemaSide.Oppsummering]: () => {
        return {
            neste: undefined,
            forrige: SkjemaSide.Hindringer,
            fremdrift: 5 / 6,
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
