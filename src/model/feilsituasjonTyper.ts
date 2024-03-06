export enum Feiltype {
    UTVANDRET = 'utvandret',
    MANGLER_ARBEIDSTILLATELSE = 'mangler-arbeidstillatelse',
}

export enum OppgaveRegistreringstype {
    REGISTRERING = 'registrering',
    REAKTIVERING = 'reaktivering',
}

type FeilKode =
    | 'UKJENT_FEIL'
    | 'UVENTET_FEIL_MOT_EKSTERN_TJENESTE'
    | 'FEIL_VED_LESING_AV_FORESPORSEL'
    | 'AVVIST'
    | 'IKKE_TILGANG';

type Regler =
    | 'UKJENT_REGEL'
    | 'IKKE_FUNNET'
    | 'SAVNET'
    | 'DOED'
    | 'ENDRE_FOR_ANNEN_BRUKER'
    | 'ANSATT_IKKE_TILGANG_TIL_BRUKER'
    | 'IKKE_TILGANG'
    | 'UNDER_18_AAR'
    | 'IKKE_BOSATT_I_NORGE_I_HENHOLD_TIL_FOLKEREGISTERLOVEN'
    | 'UKJENT_ALDER';

type Detaljer =
    | 'FORHAANDSGODKJENT_AV_ANSATT'
    | 'SAMME_SOM_INNLOGGET_BRUKER'
    | 'IKKE_SAMME_SOM_INNLOGGER_BRUKER'
    | 'ANSATT_IKKE_TILGANG'
    | 'ANSATT_TILGANG'
    | 'IKKE_ANSATT'
    | 'ER_OVER_18_AAR'
    | 'ER_UNDER_18_AAR'
    | 'UKJENT_FOEDSELSDATO'
    | 'UKJENT_FOEDSELSAAR'
    | 'TOKENX_PID_IKKE_FUNNET'
    | 'OPPHOERT_IDENTITET'
    | 'IKKE_BOSATT'
    | 'DOED'
    | 'SAVNET'
    | 'HAR_NORSK_ADRESSE'
    | 'HAR_UTENLANDSK_ADRESSE'
    | 'INGEN_ADRESSE_FUNNET'
    | 'BOSATT_ETTER_FREG_LOVEN'
    | 'DNUMMER'
    | 'UKJENT_FORENKLET_FREG_STATUS'
    | 'HAR_GYLDIG_OPPHOLDSTILLATELSE'
    | 'OPPHOLDSTILATELSE_UTGAATT'
    | 'BARN_FOEDT_I_NORGE_UTEN_OPPHOLDSTILLATELSE'
    | 'INGEN_INFORMASJON_OM_OPPHOLDSTILLATELSE'
    | 'UKJENT_STATUS_FOR_OPPHOLDSTILLATELSE'
    | 'PERSON_IKKE_FUNNET'
    | 'SISTE_FLYTTING_VAR_UT_AV_NORGE'
    | 'SISTE_FLYTTING_VAR_INN_TIL_NORGE'
    | 'IKKE_MULIG_AA_IDENTIFISERE_SISTE_FLYTTING'
    | 'INGEN_FLYTTE_INFORMASJON';

export type AarsakTilAvvisning = {
    beskrivelse: string;
    regel: Regler;
    detaljer: Detaljer[];
};

export type FeilmeldingVedStartAvArbeidssoekerperiode = {
    melding: string;
    feilKode: FeilKode;
    aarsakTilAvvisning?: AarsakTilAvvisning;
};
