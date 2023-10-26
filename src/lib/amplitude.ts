import amplitude from 'amplitude-js';

import { DinSituasjon, SporsmalId } from '../model/sporsmal';
import { ErrorTypes } from '../model/error';
import { RegistreringType } from '../model/registrering';

const isBrowser = () => typeof window !== 'undefined';

const config = {
    saveEvents: false,
    includeUtm: true,
    includeReferrer: true,
    trackingOptions: {
        city: false,
        ip_address: false,
    },
};

type EventData =
    | SidevisningData
    | AktivitetData
    | StoppsituasjonData
    | BesvarelseData
    | EksperimentData
    | FeedbackData
    | FlytData;

type BesvarelseData = { skjematype: 'standard' | 'sykmeldt'; sporsmalId: SporsmalId; svar: any };

type StoppsituasjonData = { situasjon: string; aarsak?: ErrorTypes };

type FeedbackData = { id: string; feedback: string };

type SidevisningData = { sidetittel: string };

type AktivitetData =
    | { aktivitet: KvitteringAktivitet }
    | {
          aktivitet: 'Utfylling av skjema fullført';
          tidBruktForAaFullforeSkjema?: number;
          innsatsgruppe?: string;
      }
    | { aktivitet: 'Start registrering' }
    | { aktivitet: 'Går til start registrering' }
    | { aktivitet: 'Avbryter registreringen' }
    | { aktivitet: 'Arbeidssøkeren reaktiverer seg' }
    | { aktivitet: 'Arbeidssøkeren avslår reaktivering' }
    | { aktivitet: 'Fortsetter til sykmeldtregistrering' }
    | { aktivitet: 'Oppretter kontakt meg oppgave' }
    | { aktivitet: 'Avbryter kontakt meg' }
    | { aktivitet: 'Endrer foreslått stilling' }
    | { aktivitet: 'Viser forsiden for arbeidssøkerregistreringen' }
    | { aktivitet: 'Åpner bistandsbehov' }
    | { aktivitet: 'Går til lovdata' }
    | { aktivitet: 'Går til personvernsiden' }
    | { aktivitet: 'Åpner personopplysninger' }
    | { aktivitet: 'Går til kontakt oss' };

type FlytData =
    | {
          hendelse: 'Ikke mulig å starte registreringen';
          aarsak?: RegistreringType;
          harAktivArbeidssokerperiode: boolean;
      }
    | { hendelse: 'Starter registrering' }
    | { hendelse: 'Får tilbud om registrering for mer sykmeldtoppfølging' }
    | { hendelse: 'Vil registrere seg for mer sykmeldtoppfølging' }
    | { hendelse: 'Vil registrere seg som arbeidssøker' }
    | { hendelse: 'Sender inn skjema for registrering' }
    | { hendelse: 'Avbryter registreringen' }
    | { hendelse: 'Får ikke fullført registreringen'; aarsak?: ErrorTypes }
    | { hendelse: 'Registrering fullført' };

type KvitteringAktivitet =
    | 'Viser kvittering'
    | 'Går til dagpenger fra kvittering'
    | 'Velger å ikke gå til dagpenger fra kvittering'
    | 'Velger å lese mer om økonomisk støtte'
    | 'Velger å ikke søke om økonomisk støtte';

type EksperimentData = {
    eksperiment: 'Videresender til AiA';
    innsatsgruppe: string;
    situasjon?: DinSituasjon;
};

type AmplitudeParams = { apiKey: string; apiEndpoint: string };
type AmplitudeInitFunction = (params: AmplitudeParams) => void;

export const initAmplitude: AmplitudeInitFunction = ({ apiKey, apiEndpoint }) => {
    if (isBrowser()) {
        amplitude.getInstance().init(apiKey, undefined, { ...config, apiEndpoint });
        logAmplitudeEvent('sidevisning', {
            sidetittel: document.title,
        });
    }
};

export function logAmplitudeEvent(eventName: string, data: EventData) {
    return new Promise(function (resolve) {
        const eventData = data || {};
        if (isBrowser()) {
            const brukergruppe = window.sessionStorage.getItem('beregnetBrukergruppe') || 'Ikke tilgjengelig';
            const registreringstype = window.sessionStorage.getItem('registreringType') || 'Ikke tilgjengelig';
            amplitude.getInstance().logEvent(eventName, { ...eventData, brukergruppe, registreringstype }, resolve);
        }
    });
}

export function loggStoppsituasjon(data: StoppsituasjonData) {
    const eventData = data || {};
    logAmplitudeEvent('arbeidssokerregistrering.stoppsituasjoner', eventData);
}

export function loggAktivitet(data: AktivitetData) {
    const eventData = data || {};
    logAmplitudeEvent('arbeidssokerregistrering.aktiviteter', eventData);
}

export function loggFeedback(data: FeedbackData) {
    const eventData = data || {};
    logAmplitudeEvent('arbeidssokerregistrering.feedback', eventData);
}

export function loggFlyt(data: FlytData) {
    const eventData = data || {};
    logAmplitudeEvent('arbeidssokerregistrering.flyt', eventData);
}

export function loggBesvarelse(data: BesvarelseData) {
    const eventData = data || {};
    logAmplitudeEvent('arbeidssokerregistrering.besvarelser', eventData);
}

export function loggEksperiment(data: EksperimentData) {
    const eventData = data || {};
    logAmplitudeEvent('arbeidssokerregistrering.eksperimenter', eventData);
}
