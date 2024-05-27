import { SkjemaState } from '../model/skjema';
import {
    DinSituasjon,
    JaEllerNei,
    JobbsituasjonBeskrivelse,
    mapSituasjonTilBeskrivelse,
    mapUtdanningsnivaaTilNusKode,
    NUS,
    SisteStillingValg,
    SporsmalId,
    UtdanningGodkjentValg,
} from '@navikt/arbeidssokerregisteret-utils';

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

// For å støtte kompatibilitet med veilarbregistrering bytter vi i en periode styrk08 -1 til 00 (uoppgitt)
function mapJobbsituasjon(skjema: SkjemaState): Payload['jobbsituasjon'] {
    const harAldriJobbet =
        skjema.dinSituasjon === DinSituasjon.ALDRI_HATT_JOBB ||
        skjema.sisteStilling === SisteStillingValg.HAR_IKKE_HATT_JOBB;

    return {
        beskrivelser: [
            {
                beskrivelse: mapSituasjonTilBeskrivelse(skjema[SporsmalId.dinSituasjon]!),
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
