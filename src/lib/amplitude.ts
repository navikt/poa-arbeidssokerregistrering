import * as amplitude from '@amplitude/analytics-browser';

import { ErrorTypes } from '../model/error';
import { RegistreringType } from '../model/registrering';
import { DinSituasjon, SporsmalId } from '@navikt/arbeidssokerregisteret-utils';

const isBrowser = () => typeof window !== 'undefined';
const isDevelopment = () => isBrowser() && /^http:\/\/localhost/.test(window.location.href);

const config = {
    saveEvents: false,
    includeUtm: true,
    includeReferrer: true,
    defaultTracking: false,
    trackingOptions: {
        ipAddress: false,
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

type BesvarelseData = { skjematype: 'standard'; sporsmalId: SporsmalId; svar: any };

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
    | { aktivitet: 'Oppretter kontakt meg oppgave' }
    | { aktivitet: 'Oppretter kontakt meg oppgave - under 18' }
    | { aktivitet: 'Avbryter kontakt meg' }
    | { aktivitet: 'Avbryter kontakt meg - under 18' }
    | { aktivitet: 'Endrer foreslått stilling' }
    | { aktivitet: 'Viser forsiden for arbeidssøkerregistreringen' }
    | { aktivitet: 'Åpner bistandsbehov' }
    | { aktivitet: 'Går til lovdata' }
    | { aktivitet: 'Går til personvernsiden' }
    | { aktivitet: 'Går til Samtykke fra foresatte' }
    | { aktivitet: 'Åpner personopplysninger' }
    | { aktivitet: 'Går til endre personopplysninger'; komponent?: string }
    | { aktivitet: 'Går til kontakt oss'; komponent?: string }
    | { aktivitet: 'Bytter språk'; locale: string };

type FlytData =
    | {
          hendelse: 'Ikke mulig å starte registreringen';
          aarsak?: RegistreringType;
          harAktivArbeidssokerperiode?: boolean;
      }
    | { hendelse: 'Starter registrering' }
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

export const initAmplitude: AmplitudeInitFunction = async ({ apiKey, apiEndpoint }) => {
    if (isBrowser() && !isDevelopment()) {
        await amplitude.init(apiKey, undefined, { ...config, serverUrl: apiEndpoint });
        logAmplitudeEvent('sidevisning', {
            sidetittel: document.title,
        });
    }
};

export function logAmplitudeEvent(eventName: string, data: EventData) {
    const eventData = data || {};
    if (isBrowser() && !isDevelopment()) {
        amplitude.logEvent(eventName, { ...eventData });
    }
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

export function loggSidevisning(data: SidevisningData) {
    const eventData = data || {};
    logAmplitudeEvent('arbeidssokerregistrering.sidevisning', eventData);
}
