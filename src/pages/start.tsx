import { useEffect } from 'react';
import { Loader } from '@navikt/ds-react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

import { useConfig } from '../contexts/config-context';
import { useFeatureToggles } from '../contexts/featuretoggle-context';

import { SkjemaSide } from '../model/skjema';
import { Formidlingsgruppe, RegistreringType } from '../model/registrering';
import { fetcher } from '../lib/api-utils';
import { Config } from '../model/config';
import { withAuthenticatedPage } from '../auth/withAuthentication';
import beregnBrukergruppe from '../lib/beregn-brukergruppe';
import { loggFlyt } from '../lib/amplitude';
import harAktivArbeidssokerperiode from '../lib/har-aktiv-arbeidssoker-periode';

const isBrowser = () => typeof window !== 'undefined';

function skalVideresendesTilDittNAV(data: any) {
    const { formidlingsgruppe, underOppfolging } = data;
    return formidlingsgruppe === Formidlingsgruppe.ARBS && underOppfolging === true;
}

function hentNesteSideUrl(data: any, dittNavUrl: string) {
    const { registreringType } = data;

    switch (registreringType) {
        case RegistreringType.REGISTRERING: {
            return `/opplysninger/${SkjemaSide.DinSituasjon}/`;
        }
        case RegistreringType.ORDINAER_REGISTRERING: {
            return `/skjema/${SkjemaSide.DinSituasjon}/`;
        }
        case RegistreringType.SYKMELDT_REGISTRERING: {
            return '/mer-oppfolging/';
        }
        case RegistreringType.REAKTIVERING: {
            return '/reaktivering/';
        }
        case RegistreringType.SPERRET: {
            return '/veiledning/sperret/';
        }
        case RegistreringType.UNDER_18: {
            return '/veiledning/under-18/';
        }
        case RegistreringType.ALLEREDE_REGISTRERT: {
            if (skalVideresendesTilDittNAV(data)) {
                return `${dittNavUrl}?goTo=registrering`;
            }
            return '/veiledning/allerede-registrert/';
        }
        default:
            return '/';
    }
}

const StartNyInngang = () => {
    const { data, error, isLoading } = useSWR('api/start-arbeidssokerperiode', fetcher);
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (data) {
            router.push(`/skjema/${SkjemaSide.DinSituasjon}`);
            return;
        }

        if (error) {
            console.error('Feil fra nytt inggangs-api:', error);
            router.push('/feil/');
        }
    }, [data, isLoading, router, error]);

    return null;
};

const Start = () => {
    const { dittNavUrl, loginUrl, aarsTall } = useConfig() as Config;
    const { data, error } = useSWR('api/startregistrering', fetcher);
    const { data: perioder, error: e } = useSWRImmutable('api/arbeidssoker', fetcher);
    const router = useRouter();
    const { toggles } = useFeatureToggles();
    const sperrUnder18 = toggles['arbeidssokerregistrering.bruk-under-18-sperre'] && aarsTall > 2023;
    const fjernPlikter = toggles['arbeidssokerregistrering.fjern-plikter'];
    const brukNyInngang = toggles['arbeidssokerregistrering.bruk-ny-inngang'];

    useEffect(() => {
        if (!data || !dittNavUrl || (!perioder && !e)) {
            return;
        }

        if (brukNyInngang) {
            return;
        }

        if (isBrowser()) {
            const { servicegruppe, alder, registreringType, formidlingsgruppe } = data;
            const brukergruppe = beregnBrukergruppe(servicegruppe, alder);
            window.sessionStorage.setItem('beregnetBrukergruppe', brukergruppe);
            window.sessionStorage.setItem('registreringType', registreringType);
            if (
                [
                    RegistreringType.ORDINAER_REGISTRERING,
                    RegistreringType.REAKTIVERING,
                    RegistreringType.REGISTRERING,
                ].includes(registreringType)
            ) {
                loggFlyt({ hendelse: 'Starter registrering' });
            }
            if (RegistreringType.ALLEREDE_REGISTRERT === registreringType) {
                loggFlyt({
                    hendelse: 'Ikke mulig å starte registreringen',
                    aarsak: formidlingsgruppe,
                    harAktivArbeidssokerperiode: harAktivArbeidssokerperiode(perioder?.arbeidssokerperioder),
                });
            }
            if (RegistreringType.SYKMELDT_REGISTRERING === registreringType) {
                loggFlyt({ hendelse: 'Får tilbud om registrering for mer sykmeldtoppfølging' });
            }
            if (RegistreringType.UNDER_18 === registreringType) {
                loggFlyt({
                    hendelse: 'Ikke mulig å starte registreringen',
                    aarsak: registreringType,
                });
            }
        }
        // Setter egen registreringstype for de under 18
        const { alder } = data;
        if (sperrUnder18 && alder < 18) {
            data.registreringType = RegistreringType.UNDER_18;
        }
        // Setter egen registreringstype når plikter er fjernet
        if (fjernPlikter && data.registreringType === RegistreringType.ORDINAER_REGISTRERING) {
            data.registreringType = RegistreringType.REGISTRERING;
        }
        router.push(hentNesteSideUrl(data, dittNavUrl));
    }, [data, router, dittNavUrl, perioder, e, sperrUnder18, fjernPlikter, brukNyInngang]);

    useEffect(() => {
        if (error) {
            error.message === '401' ? router.push(loginUrl) : router.push('/feil/');
        }
    }, [error, router]);

    return (
        <div style={{ textAlign: 'center' }}>
            <Loader variant="neutral" size="2xlarge" title="venter..." />
            {brukNyInngang && <StartNyInngang />}
        </div>
    );
};

export const getServerSideProps = withAuthenticatedPage();
export default Start;
