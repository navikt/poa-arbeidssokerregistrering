import lagHentTekstForSprak, { Sprak, Tekster } from '../lib/lag-hent-tekst-for-sprak';
import { SisteJobb } from './skjema';

export type Svar =
    | DinSituasjon
    | SisteJobb
    | Utdanningsnivaa
    | JaEllerNei
    | UtdanningGodkjentValg
    | TilbakeIArbeid
    | FremtidigSituasjon
    | SisteStillingValg;

export enum SporsmalId {
    dinSituasjon = 'dinSituasjon',
    utdanning = 'utdanning',
    utdanningGodkjent = 'utdanningGodkjent',
    utdanningBestatt = 'utdanningBestatt',
    andreForhold = 'andreForhold',
    sisteStilling = 'sisteStilling',
    sisteJobb = 'sisteJobb',
    helseHinder = 'helseHinder',
    fremtidigSituasjon = 'fremtidigSituasjon',
    tilbakeIArbeid = 'tilbakeIArbeid',
}
export enum DinSituasjon {
    MISTET_JOBBEN = 'MISTET_JOBBEN',
    HAR_SAGT_OPP = 'HAR_SAGT_OPP',
    DELTIDSJOBB_VIL_MER = 'DELTIDSJOBB_VIL_MER',
    ALDRI_HATT_JOBB = 'ALDRI_HATT_JOBB',
    VIL_BYTTE_JOBB = 'VIL_BYTTE_JOBB',
    JOBB_OVER_2_AAR = 'JOBB_OVER_2_AAR',
    ER_PERMITTERT = 'ER_PERMITTERT',
    USIKKER_JOBBSITUASJON = 'USIKKER_JOBBSITUASJON',
    AKKURAT_FULLFORT_UTDANNING = 'AKKURAT_FULLFORT_UTDANNING',
    VIL_FORTSETTE_I_JOBB = 'VIL_FORTSETTE_I_JOBB',
}

export enum Utdanningsnivaa {
    INGEN_UTDANNING = 'INGEN_UTDANNING',
    GRUNNSKOLE = 'GRUNNSKOLE',
    VIDEREGAENDE_GRUNNUTDANNING = 'VIDEREGAENDE_GRUNNUTDANNING',
    VIDEREGAENDE_FAGBREV_SVENNEBREV = 'VIDEREGAENDE_FAGBREV_SVENNEBREV',
    HOYERE_UTDANNING_1_TIL_4 = 'HOYERE_UTDANNING_1_TIL_4',
    HOYERE_UTDANNING_5_ELLER_MER = 'HOYERE_UTDANNING_5_ELLER_MER',
    INGEN_SVAR = 'INGEN_SVAR',
}

export enum JaEllerNei {
    JA = 'JA',
    NEI = 'NEI',
    INGEN_SVAR = 'INGEN_SVAR',
}

export enum UtdanningGodkjentValg {
    JA = 'JA',
    NEI = 'NEI',
    VET_IKKE = 'VET_IKKE',
    INGEN_SVAR = 'INGEN_SVAR',
}

export enum TilbakeIArbeid {
    JA_FULL_STILLING = 'JA_FULL_STILLING',
    JA_REDUSERT_STILLING = 'JA_REDUSERT_STILLING',
    USIKKER = 'USIKKER',
    NEI = 'NEI',
}

export enum FremtidigSituasjon {
    SAMME_ARBEIDSGIVER = 'SAMME_ARBEIDSGIVER',
    SAMME_ARBEIDSGIVER_NY_STILLING = 'SAMME_ARBEIDSGIVER_NY_STILLING',
    NY_ARBEIDSGIVER = 'NY_ARBEIDSGIVER',
    USIKKER = 'USIKKER',
    INGEN_PASSER = 'INGEN_PASSER',
}

export enum SisteStillingValg {
    INGEN_SVAR = 'INGEN_SVAR',
    HAR_HATT_JOBB = 'HAR_HATT_JOBB',
    HAR_IKKE_HATT_JOBB = 'HAR_IKKE_HATT_JOBB',
}

const TEKSTER: Tekster<string> = {
    nb: {
        [SporsmalId.dinSituasjon]: 'Velg den situasjonen som passer deg best',
        [DinSituasjon.MISTET_JOBBEN]: 'Har mistet eller kommer til å miste jobben',
        [DinSituasjon.HAR_SAGT_OPP]: 'Har sagt opp eller kommer til å si opp',
        [DinSituasjon.DELTIDSJOBB_VIL_MER]: 'Har deltidsjobb, men vil jobbe mer',
        [DinSituasjon.ALDRI_HATT_JOBB]: 'Har aldri vært i jobb',
        [DinSituasjon.VIL_BYTTE_JOBB]: 'Har jobb, men vil bytte',
        [DinSituasjon.JOBB_OVER_2_AAR]: 'Har ikke vært i jobb de siste 2 årene',
        [DinSituasjon.ER_PERMITTERT]: 'Er permittert eller kommer til å bli permittert',
        [DinSituasjon.USIKKER_JOBBSITUASJON]: 'Er usikker på jobbsituasjonen min',
        [DinSituasjon.AKKURAT_FULLFORT_UTDANNING]: 'Har akkurat fullført utdanning, militærtjeneste eller annet',
        [DinSituasjon.VIL_FORTSETTE_I_JOBB]: 'Har jobb og ønsker å fortsette i den jobben jeg er i',
        [SporsmalId.sisteStilling]: 'Hva er din siste jobb?',
        [SisteStillingValg.HAR_HATT_JOBB]: 'Har vært i jobb',
        [SisteStillingValg.HAR_IKKE_HATT_JOBB]: 'Har ikke vært i jobb',
        [SisteStillingValg.INGEN_SVAR]: 'Ikke besvart',
        [SporsmalId.utdanning]: 'Hva er din høyeste fullførte utdanning?',
        [Utdanningsnivaa.INGEN_UTDANNING]: 'Ingen utdanning',
        [Utdanningsnivaa.GRUNNSKOLE]: 'Grunnskole',
        [Utdanningsnivaa.VIDEREGAENDE_GRUNNUTDANNING]: 'Videregående grunnutdanning (1 til 2 år)',
        [Utdanningsnivaa.VIDEREGAENDE_FAGBREV_SVENNEBREV]: 'Videregående, fagbrev eller svennebrev (3 år eller mer)',
        [Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4]: 'Høyere utdanning (1 til 4 år)',
        [Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER]: 'Høyere utdanning (5 år eller mer)',
        [SporsmalId.utdanningBestatt]: 'Er utdanningen din bestått?',
        [JaEllerNei.JA]: 'Ja',
        [JaEllerNei.NEI]: 'Nei',
        [SporsmalId.utdanningGodkjent]: 'Er utdanningen din godkjent i Norge?',
        // [UtdanningGodkjentValg.JA]: 'Ja',
        // [UtdanningGodkjentValg.NEI]: 'Nei',
        [UtdanningGodkjentValg.VET_IKKE]: 'Vet ikke',
        [SporsmalId.andreForhold]: 'Har du andre problemer med å søke eller være i jobb?',
        [SporsmalId.helseHinder]: 'Har du helseproblemer som hindrer deg i å søke eller være i jobb?',
        [SporsmalId.tilbakeIArbeid]: 'Tror du at du kommer tilbake i jobb før du har vært sykmeldt i 52 uker?',
        [TilbakeIArbeid.JA_FULL_STILLING]: 'Ja, i full stilling',
        [TilbakeIArbeid.JA_REDUSERT_STILLING]: 'Ja, i redusert stilling',
        [TilbakeIArbeid.USIKKER]: 'Usikker',
        // [TilbakeIArbeid.NEI]: 'Nei',
        [SporsmalId.fremtidigSituasjon]: 'Hva tenker du om din fremtidige situasjon?',
        [FremtidigSituasjon.SAMME_ARBEIDSGIVER]: 'Jeg skal tilbake til jobben jeg har',
        [FremtidigSituasjon.SAMME_ARBEIDSGIVER_NY_STILLING]:
            'Jeg skal tilbake til arbeidsgiveren min, men i ny stilling',
        [FremtidigSituasjon.NY_ARBEIDSGIVER]: 'Jeg trenger ny jobb',
        [FremtidigSituasjon.INGEN_PASSER]: 'Ingen av disse alternativene passer',
    },
};

export function hentTekst(sprak: Sprak, key: string) {
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    return tekst(key);
}
