type Sprak = 'nb' | 'nn' | 'en';
type SkjemaPrefix = '/opplysninger/' | '/oppdater-opplysninger/';
const STOTTEDE_SPRAK: readonly string[] = ['nb', 'nn', 'en'];

const SKJEMA_SIDETITLER: Record<Sprak, Record<string, string>> = {
    nb: {
        '1': 'Arbeidssøkerregistrering: Din arbeidssøkersituasjon',
        '2': 'Arbeidssøkerregistrering: Hva er din siste jobb?',
        '3': 'Arbeidssøkerregistrering: Utdanningsnivå',
        '4': 'Arbeidssøkerregistrering: Hindringer',
        '5': 'Arbeidssøkerregistrering: Er alle opplysningene dine riktige?',
        oppdatering: 'Arbeidssøkerregistrering: Oppdater opplysninger',
    },
    nn: {
        '1': 'Arbeidssøkjarregistrering: Din situasjon som arbeidssøkjar',
        '2': 'Arbeidssøkjarregistrering: Kva var den siste jobben din?',
        '3': 'Arbeidssøkjarregistrering: Høgaste fullførte utdanning',
        '4': 'Arbeidssøkjarregistrering: Hindringar',
        '5': 'Arbeidssøkjarregistrering: Er alle opplysningane dine rette?',
        oppdatering: 'Arbeidssøkjarregistrering: Oppdater opplysningar',
    },
    en: {
        '1': 'Register as a Job Seeker: Your jobseeker situation',
        '2': 'Register as a Job Seeker : What was your last job?',
        '3': 'Register as a Job Seeker : Education',
        '4': 'Register as a Job Seeker : Impediments',
        '5': 'Register as a Job Seeker: Is the information correct?',
        oppdatering: 'Register as a Job Seeker: Is the information correct?',
    },
};

const KVITTERING_SIDETITLER: Record<Sprak, string> = {
    nb: 'Du er nå registrert som arbeidssøker',
    nn: 'Du er no registrert som arbeidssøkjar',
    en: 'You are now registered as a jobseeker',
};

const sprakMedFallback = (sprak: string): Sprak => (STOTTEDE_SPRAK.includes(sprak) ? (sprak as Sprak) : 'nb');

export const hentSkjemaSidetittel = (side: string, sprak: string, prefix: SkjemaPrefix): string => {
    const tekster = SKJEMA_SIDETITLER[sprakMedFallback(sprak)];

    if (side === '5' && prefix === '/oppdater-opplysninger/') {
        return tekster.oppdatering;
    }

    return tekster[side] ?? 'Arbeidssøkerregistrering';
};

export const hentKvitteringSidetittel = (sprak: string): string => KVITTERING_SIDETITLER[sprakMedFallback(sprak)];
