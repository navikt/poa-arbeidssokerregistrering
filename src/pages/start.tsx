import { useEffect, useState } from 'react';
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
import KanIkkeStartePeriode from '../components/feilmeldinger/kan-ikke-starte-periode';

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
    const router = useRouter();
    const { enableMock } = useConfig() as Config;
    const { toggles } = useFeatureToggles();
    const [feilmelding, setFeilmelding] = useState<boolean | any>(false);
    const brukerMock = enableMock === 'enabled';
    const startArbeidssokerPeriodeUrl = brukerMock
        ? 'api/mocks/start-arbeidssokerperiode'
        : 'api/start-arbeidssokerperiode';
    const fjernPlikter = toggles['arbeidssokerregistrering.fjern-plikter'];
    const { data, error, isLoading } = useSWRImmutable(startArbeidssokerPeriodeUrl, fetcher, { errorRetryCount: 0 });
    const registreringsSkjema = fjernPlikter ? 'opplysninger' : 'skjema';

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (data) {
            router.push(`/${registreringsSkjema}/${SkjemaSide.DinSituasjon}`);
            return;
        }

        if (error) {
            console.error(`Feil fra start periode (${error.status}): `, error.data);
            setFeilmelding(error);
        }
    }, [data, isLoading, router, error]);

    return (
        <>
            {isLoading && (
                <div style={{ textAlign: 'center' }}>
                    <Loader variant="neutral" size="2xlarge" title="Forsøker å starte registrering..." />
                </div>
            )}
            {feilmelding && <KanIkkeStartePeriode feilmelding={feilmelding.data} />}
        </>
    );
};

const Start = () => {
    const { dittNavUrl, loginUrl, aarsTall } = useConfig() as Config;
    const { data, error } = useSWR('api/startregistrering', fetcher);
    const { data: perioder, error: e } = useSWRImmutable('api/arbeidssoker', fetcher);
    const router = useRouter();
    const { toggles } = useFeatureToggles();
    const sperrUnder18 = toggles['arbeidssokerregistrering.bruk-under-18-sperre'] && aarsTall > 2023;
    const fjernPlikter = toggles['arbeidssokerregistrering.fjern-plikter'];

    useEffect(() => {
        if (!data || !dittNavUrl || (!perioder && !e)) {
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
    }, [data, router, dittNavUrl, perioder, e, sperrUnder18, fjernPlikter]);

    useEffect(() => {
        if (error) {
            error.message === '401' ? router.push(loginUrl) : router.push('/feil/');
        }
    }, [error, router]);

    return (
        <div style={{ textAlign: 'center' }}>
            <Loader variant="neutral" size="2xlarge" title="venter..." />
        </div>
    );
};

const VelgInngang = () => {
    const { toggles } = useFeatureToggles();
    const brukNyInngang = toggles['arbeidssokerregistrering.bruk-ny-inngang'];

    return brukNyInngang ? <StartNyInngang /> : <Start />;
};

export const getServerSideProps = withAuthenticatedPage();

export default VelgInngang;
