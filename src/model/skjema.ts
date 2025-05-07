import {
    DinSituasjon,
    JaEllerNei,
    SisteStillingValg,
    SporsmalId,
    UtdanningGodkjentValg,
    Utdanningsnivaa,
    SisteJobb,
} from '@navikt/arbeidssokerregisteret-utils';

export enum SkjemaSide {
    DinSituasjon = '0',
    SisteJobb = '1',
    Utdanning = '2',
    GodkjentUtdanning = '3',
    BestaattUtdanning = '4',
    Helseproblemer = '5',
    AndreProblemer = '6',
    Oppsummering = '8',
    OppsummeringUtenPlikter = '8',
    FullforRegistrering = '12',
}

export type SkjemaSideType =
    | SkjemaSide.DinSituasjon
    | SkjemaSide.SisteJobb
    | SkjemaSide.Utdanning
    | SkjemaSide.Helseproblemer
    | SkjemaSide.AndreProblemer
    | SkjemaSide.OppsummeringUtenPlikter;

export type Navigering<T extends SkjemaSide> = {
    neste?: T;
    forrige?: T;
    fremdrift: number;
};

export type NavigeringsTilstandsMaskin<T extends SkjemaSide> = Record<T, (state: SkjemaState) => Navigering<T>>;

export interface SkjemaState {
    [SporsmalId.dinSituasjon]?: DinSituasjon;
    [SporsmalId.utdanning]?: Utdanningsnivaa;
    [SporsmalId.utdanningGodkjent]?: UtdanningGodkjentValg;
    [SporsmalId.utdanningBestatt]?: JaEllerNei;
    [SporsmalId.andreForhold]?: JaEllerNei;
    [SporsmalId.sisteStilling]?: SisteStillingValg;
    [SporsmalId.sisteJobb]?: SisteJobb;
    [SporsmalId.helseHinder]?: JaEllerNei;
    startTid?: number;
}

const skjemasider = {
    [SporsmalId.dinSituasjon]: SkjemaSide.DinSituasjon,
    [SporsmalId.sisteStilling]: SkjemaSide.SisteJobb,
    [SporsmalId.sisteJobb]: SkjemaSide.SisteJobb,
    [SporsmalId.utdanning]: SkjemaSide.Utdanning,
    [SporsmalId.utdanningBestatt]: SkjemaSide.BestaattUtdanning,
    [SporsmalId.utdanningGodkjent]: SkjemaSide.GodkjentUtdanning,
    [SporsmalId.andreForhold]: SkjemaSide.AndreProblemer,
    [SporsmalId.helseHinder]: SkjemaSide.Helseproblemer,
};

export const hentSkjemaside = (sporsmalId: SporsmalId) => skjemasider[sporsmalId];

export function visSisteStilling(skjemaState: SkjemaState) {
    return skjemaState.dinSituasjon
        ? [
              DinSituasjon.AKKURAT_FULLFORT_UTDANNING,
              DinSituasjon.JOBB_OVER_2_AAR,
              DinSituasjon.USIKKER_JOBBSITUASJON,
          ].includes(skjemaState.dinSituasjon)
        : false;
}

export type Side = 'standard';
