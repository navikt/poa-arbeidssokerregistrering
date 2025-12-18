import { Faro, initializeFaro } from '@grafana/faro-web-sdk';

const isBrowser = () => typeof window !== 'undefined';
const isProduction = isBrowser() && window.location.href.includes('www.nav.no');
const isDevelopment = isBrowser() && window.location.href.includes('ansatt.dev.nav.no');
const isDemo = isBrowser() && window.location.href.includes('ekstern.dev.nav.no');
const isLocal = isBrowser() && window.location.href.includes('localhost');

const getEnvironment = () => {
    if (isProduction) {
        return 'production';
    }

    if (isDevelopment) {
        return 'development';
    }

    if (isDemo) {
        return 'demo';
    }

    return 'local';
};

const TELEMETRY_URL = {
    local: 'http://localhost:12347/collect',
    development: 'https://telemetry.ekstern.dev.nav.no/collect',
    production: 'https://telemetry.nav.no/collect',
    demo: '',
};

export const initFaro = (): Faro | null => {
    if (!isBrowser() || isDemo || isLocal) return null;

    return initializeFaro({
        isolate: true,
        url: TELEMETRY_URL[getEnvironment()],
        app: {
            name: 'poa-arbeidssokerregistrering',
            version: getEnvironment(),
        },
    });
};
