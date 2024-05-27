import {
    mapNusKodeTilUtdannignsnivaa,
    OpplysningerOmArbeidssoker,
    SporsmalId,
} from '@navikt/arbeidssokerregisteret-utils';

const mapJobbsituasjon = (opplysninger: OpplysningerOmArbeidssoker) => {
    const jobbsituasjon = opplysninger.jobbsituasjon ? opplysninger.jobbsituasjon[0] : undefined;

    return {
        [SporsmalId.dinSituasjon]: jobbsituasjon?.beskrivelse,
        [SporsmalId.sisteJobb]: {
            label: jobbsituasjon?.detaljer.stilling,
            styrk08: jobbsituasjon?.detaljer.stilling_styrk08,
            konseptId: '-1',
        },
    };
};

const mapOpplysningerTilSkjemaState = (opplysninger: OpplysningerOmArbeidssoker) => {
    return {
        ...mapJobbsituasjon(opplysninger),
        [SporsmalId.utdanning]: mapNusKodeTilUtdannignsnivaa(opplysninger.utdanning?.nus),
        [SporsmalId.utdanningGodkjent]: opplysninger.utdanning?.godkjent,
        [SporsmalId.utdanningBestatt]: opplysninger.utdanning?.bestaatt,
        [SporsmalId.helseHinder]: opplysninger.helse?.helsetilstandHindrerArbeid,
        [SporsmalId.andreForhold]: opplysninger.annet?.andreForholdHindrerArbeid,
    };
};

export default mapOpplysningerTilSkjemaState;
