import { SporsmalId, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';
import { SkjemaState } from '../model/skjema';

export default function visUtdanningsvalg(skjemaState: SkjemaState): boolean {
    const utdanningsSvar = skjemaState[SporsmalId.utdanning];
    return !(utdanningsSvar && [Utdanningsnivaa.INGEN_UTDANNING, Utdanningsnivaa.GRUNNSKOLE].includes(utdanningsSvar));
}
