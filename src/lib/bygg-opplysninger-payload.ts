import { SkjemaState } from '../model/skjema';
import {
    DinSituasjon,
    JaEllerNei,
    SisteStillingValg,
    SporsmalId,
    UtdanningGodkjentValg,
    Utdanningsnivaa,
} from '@navikt/arbeidssokerregisteret-utils';

// temp - eksporter i utils
export enum NUS {
    INGEN_UTDANNING = '0',
    GRUNNSKOLE = '2',
    VIDEREGAENDE_GRUNNUTDANNING = '3',
    VIDEREGAENDE_FAGBREV_SVENNEBREV = '4',
    VIDEREGAENDE_PAABYGGING = '5',
    HOYERE_UTDANNING_1_TIL_4 = '6',
    HOYERE_UTDANNING_5_ELLER_MER = '7',
    INGEN_SVAR = '9',
}

export type JobbsituasjonBeskrivelse =
    | 'UKJENT_VERDI'
    | 'UDEFINERT'
    | 'HAR_SAGT_OPP'
    | 'HAR_BLITT_SAGT_OPP'
    | 'ER_PERMITTERT'
    | 'ALDRI_HATT_JOBB'
    | 'IKKE_VAERT_I_JOBB_SISTE_2_AAR'
    | 'AKKURAT_FULLFORT_UTDANNING'
    | 'VIL_BYTTE_JOBB'
    | 'USIKKER_JOBBSITUASJON'
    | 'MIDLERTIDIG_JOBB'
    | 'DELTIDSJOBB_VIL_MER'
    | 'NY_JOBB'
    | 'KONKURS'
    | 'ANNET';

type Payload = {
    utdanning: {
        nus: NUS;
        bestaatt?: JaEllerNei;
        godkjent?: UtdanningGodkjentValg;
    };
    helse: {
        helsetilstandHindrerArbeid: JaEllerNei;
    };
    jobbsituasjon: {
        beskrivelser: [{ beskrivelse: JobbsituasjonBeskrivelse; detaljer?: any }];
    };
    annet: {
        andreForholdHindrerArbeid: JaEllerNei;
    };
};

function mapUtdanningsnivaaTilNusKode(utdanning?: Utdanningsnivaa): NUS {
    switch (utdanning) {
        case Utdanningsnivaa.INGEN_UTDANNING:
            return NUS.INGEN_UTDANNING;
        case Utdanningsnivaa.GRUNNSKOLE:
            return NUS.GRUNNSKOLE;
        case Utdanningsnivaa.VIDEREGAENDE_GRUNNUTDANNING:
            return NUS.VIDEREGAENDE_GRUNNUTDANNING;
        case Utdanningsnivaa.VIDEREGAENDE_FAGBREV_SVENNEBREV:
            return NUS.VIDEREGAENDE_FAGBREV_SVENNEBREV;
        case Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4:
            return NUS.HOYERE_UTDANNING_1_TIL_4;
        case Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER:
            return NUS.HOYERE_UTDANNING_5_ELLER_MER;
        case Utdanningsnivaa.INGEN_SVAR:
            return NUS.INGEN_SVAR;
        default:
            return NUS.INGEN_SVAR;
    }
}
function mapUtdanning(skjema: SkjemaState): Payload['utdanning'] {
    const nus = mapUtdanningsnivaaTilNusKode(skjema[SporsmalId.utdanning]);
    if ([NUS.INGEN_SVAR, NUS.INGEN_UTDANNING, NUS.GRUNNSKOLE].includes(nus)) {
        return {
            nus,
        };
    }

    return {
        nus,
        bestaatt: skjema[SporsmalId.utdanningBestatt],
        godkjent: skjema[SporsmalId.utdanningGodkjent],
    };
}

function mapDinSituasjonTilBeskrivelse(sitasjon: DinSituasjon): JobbsituasjonBeskrivelse {
    switch (sitasjon) {
        case DinSituasjon.MISTET_JOBBEN:
            return 'HAR_BLITT_SAGT_OPP';
        case DinSituasjon.JOBB_OVER_2_AAR:
            return 'IKKE_VAERT_I_JOBB_SISTE_2_AAR';
        case DinSituasjon.VIL_FORTSETTE_I_JOBB:
            return 'ANNET';
        case DinSituasjon.INGEN_SVAR:
        case DinSituasjon.INGEN_VERDI:
            return 'UDEFINERT';
        default:
            return sitasjon;
    }
}

// For å støtte kompatibilitet med veilarbregistrering bytter vi i en periode styrk08 -1 til 00 (uoppgitt)
function mapJobbsituasjon(skjema: SkjemaState): Payload['jobbsituasjon'] {
    const harAldriJobbet =
        skjema.dinSituasjon === DinSituasjon.ALDRI_HATT_JOBB ||
        skjema.sisteStilling === SisteStillingValg.HAR_IKKE_HATT_JOBB;

    return {
        beskrivelser: [
            {
                beskrivelse: mapDinSituasjonTilBeskrivelse(skjema[SporsmalId.dinSituasjon]!),
                detaljer: harAldriJobbet
                    ? undefined
                    : {
                          stilling: skjema[SporsmalId.sisteJobb]?.label,
                          stilling_styrk08: skjema[SporsmalId.sisteJobb]?.styrk08.replace('-1', '00'),
                      },
            },
        ],
    };
}
function byggOpplysningerPayload(skjemaState: SkjemaState) {
    return {
        opplysningerOmArbeidssoeker: {
            utdanning: mapUtdanning(skjemaState),
            helse: skjemaState['helseHinder']
                ? {
                      helsetilstandHindrerArbeid: skjemaState['helseHinder'],
                  }
                : undefined,
            jobbsituasjon: mapJobbsituasjon(skjemaState),
            annet: skjemaState['andreForhold']
                ? {
                      andreForholdHindrerArbeid: skjemaState['andreForhold'],
                  }
                : undefined,
        },
    };
}

export default byggOpplysningerPayload;
