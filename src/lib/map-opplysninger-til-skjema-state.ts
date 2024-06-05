import {
    DinSituasjon,
    JobbsituasjonDetaljer,
    mapBeskrivelseTilSituasjon,
    mapNusKodeTilUtdannignsnivaa,
    OpplysningerOmArbeidssoker,
    SisteStillingValg,
    SporsmalId,
} from '@navikt/arbeidssokerregisteret-utils';

const mapSisteStilling = (dinSituasjon: DinSituasjon, detaljer?: JobbsituasjonDetaljer) => {
    const sisteStillingValg = [
        DinSituasjon.USIKKER_JOBBSITUASJON,
        DinSituasjon.JOBB_OVER_2_AAR,
        DinSituasjon.AKKURAT_FULLFORT_UTDANNING,
    ];

    if (!detaljer || !sisteStillingValg.includes(dinSituasjon)) {
        return SisteStillingValg.INGEN_SVAR;
    }

    const harStillingIDetaljer = Boolean(detaljer.stilling);

    return harStillingIDetaljer ? SisteStillingValg.HAR_HATT_JOBB : SisteStillingValg.HAR_IKKE_HATT_JOBB;
};

const mapJobbsituasjon = (opplysninger: OpplysningerOmArbeidssoker) => {
    const jobbsituasjon = opplysninger.jobbsituasjon ? opplysninger.jobbsituasjon[0] : undefined;
    const dinSituasjon = jobbsituasjon
        ? mapBeskrivelseTilSituasjon(jobbsituasjon.beskrivelse)
        : DinSituasjon.INGEN_VERDI;

    return {
        [SporsmalId.dinSituasjon]: dinSituasjon,
        [SporsmalId.sisteJobb]: {
            label: jobbsituasjon?.detaljer.stilling ?? 'Annen stilling',
            styrk08: jobbsituasjon?.detaljer.stilling_styrk08 ?? '-1',
            konseptId: '-1', // TODO? => Mister denne, men trenger vi den?
        },
        [SporsmalId.sisteStilling]: mapSisteStilling(dinSituasjon, jobbsituasjon?.detaljer),
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
