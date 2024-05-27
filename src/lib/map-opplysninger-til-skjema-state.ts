import { SkjemaState } from '../model/skjema';
import {
    mapNusKodeTilUtdannignsnivaa,
    OpplysningerOmArbeidssoker,
    SporsmalId,
} from '@navikt/arbeidssokerregisteret-utils';

const mapOpplysningerTilSkjemaState = (opplysninger: OpplysningerOmArbeidssoker) => {
    return {
        [SporsmalId.andreForhold]: opplysninger.annet?.andreForholdHindrerArbeid,
        [SporsmalId.helseHinder]: opplysninger.helse?.helsetilstandHindrerArbeid,
        [SporsmalId.utdanningGodkjent]: opplysninger.utdanning?.godkjent,
        [SporsmalId.utdanningBestatt]: opplysninger.utdanning?.bestaatt,
        [SporsmalId.utdanning]: mapNusKodeTilUtdannignsnivaa(opplysninger.utdanning?.nus),
    };
};

export default mapOpplysningerTilSkjemaState;
