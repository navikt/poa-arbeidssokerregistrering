import { SkjemaState } from '../model/skjema';
import { Reducer } from 'react';
import {
    DinSituasjon,
    JaEllerNei,
    SisteStillingValg,
    SporsmalId,
    UtdanningGodkjentValg,
    Utdanningsnivaa,
    SisteJobb,
} from '@navikt/arbeidssokerregisteret-utils';

export type SkjemaReducer = Reducer<SkjemaState, SkjemaAction>;
export type SkjemaAction =
    | { type: SporsmalId.dinSituasjon; value: DinSituasjon }
    | { type: SporsmalId.utdanning; value: Utdanningsnivaa }
    | { type: SporsmalId.utdanningGodkjent; value: UtdanningGodkjentValg }
    | { type: SporsmalId.utdanningBestatt; value: JaEllerNei }
    | { type: SporsmalId.helseHinder; value: JaEllerNei }
    | { type: SporsmalId.andreForhold; value: JaEllerNei }
    | { type: SporsmalId.sisteJobb; value: SisteJobb }
    | { type: SporsmalId.sisteStilling; value: SisteStillingValg }
    | { type: 'SenderSkjema' };

export function skjemaReducer(state: SkjemaState, action: SkjemaAction): SkjemaState {
    switch (action.type) {
        case SporsmalId.dinSituasjon: {
            return oppdaterDinSituasjon(state, action.value);
        }
        case SporsmalId.utdanning: {
            return oppdaterUtdanning(state, action.value);
        }
        case SporsmalId.sisteJobb: {
            return {
                ...state,
                sisteJobb: {
                    ...action.value,
                    styrk08: Array.isArray(action.value.styrk08) ? action.value.styrk08[0] : action.value.styrk08,
                },
            };
        }
        case SporsmalId.sisteStilling: {
            return oppdaterSisteStilling(state, action.value);
        }
        case SporsmalId.utdanningGodkjent: {
            return {
                ...state,
                utdanningGodkjent: action.value,
            };
        }
        case SporsmalId.utdanningBestatt: {
            return {
                ...state,
                utdanningBestatt: action.value,
            };
        }
        case SporsmalId.helseHinder: {
            return {
                ...state,
                helseHinder: action.value,
            };
        }
        case SporsmalId.andreForhold: {
            return {
                ...state,
                andreForhold: action.value,
            };
        }
    }

    return state;
}

export const oppdaterDinSituasjon = (skjemaState: SkjemaState, dinSituasjon: DinSituasjon) => {
    const sisteStillingValg = [
        DinSituasjon.USIKKER_JOBBSITUASJON,
        DinSituasjon.JOBB_OVER_2_AAR,
        DinSituasjon.AKKURAT_FULLFORT_UTDANNING,
    ];
    const sisteStilling = sisteStillingValg.includes(dinSituasjon) ? skjemaState[SporsmalId.sisteStilling] : undefined;

    if (dinSituasjon === DinSituasjon.ALDRI_HATT_JOBB) {
        return {
            ...skjemaState,
            dinSituasjon: dinSituasjon,
            sisteJobb: undefined,
            sisteStilling,
        };
    } else if (dinSituasjon === DinSituasjon.VIL_FORTSETTE_I_JOBB) {
        return {
            ...skjemaState,
            dinSituasjon: dinSituasjon,
            utdanning: undefined,
            utdanningBestatt: undefined,
            utdanningGodkjent: undefined,
            sisteStilling,
        };
    }
    return {
        ...skjemaState,
        sisteStilling,
        dinSituasjon: dinSituasjon,
    };
};

const oppdaterSisteStilling = (skjemaState: SkjemaState, sisteStilling: SisteStillingValg) => {
    if (sisteStilling === SisteStillingValg.HAR_IKKE_HATT_JOBB) {
        return {
            ...skjemaState,
            sisteStilling: sisteStilling,
            sisteJobb: undefined,
        };
    }
    return {
        ...skjemaState,
        sisteStilling: sisteStilling,
    };
};

export const oppdaterUtdanning = (skjemaState: SkjemaState, utdanning: Utdanningsnivaa) => {
    if ([Utdanningsnivaa.INGEN_UTDANNING, Utdanningsnivaa.GRUNNSKOLE].includes(utdanning)) {
        return {
            ...skjemaState,
            utdanning,
            utdanningGodkjent: undefined,
            utdanningBestatt: undefined,
        };
    }
    return {
        ...skjemaState,
        utdanning,
    };
};
