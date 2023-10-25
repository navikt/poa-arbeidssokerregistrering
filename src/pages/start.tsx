import { useEffect } from 'react';
import { Loader } from '@navikt/ds-react';
import useSWR from 'swr';
import { useRouter } from 'next/router';

import { useConfig } from '../contexts/config-context';
import { useFeatureToggles } from '../contexts/featuretoggle-context';
import useSWRImmutable from 'swr/immutable';

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

function hentNesteSideUrl(data: any, dittNavUrl: string, sykmeldtRegistreringUrl: string) {
    const { registreringType } = data;

    switch (registreringType) {
        case RegistreringType.ORDINAER_REGISTRERING: {
            return `/skjema/${SkjemaSide.DinSituasjon}/`;
        }
        case RegistreringType.SYKMELDT_REGISTRERING: {
            return sykmeldtRegistreringUrl;
        }
        case RegistreringType.REAKTIVERING: {
            return '/reaktivering/';
        }
        case RegistreringType.SPERRET: {
            return '/veiledning/sperret/';
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

const Start = () => {
    const { dittNavUrl, loginUrl, merOppfolgingUrl } = useConfig() as Config;
    const { data, error } = useSWR('api/startregistrering', fetcher);
    const { data: perioder, error: e } = useSWRImmutable('api/arbeidssoker', fetcher);
    const router = useRouter();
    const { toggles } = useFeatureToggles();
    const brukMeroppfolging = toggles['arbeidssokerregistrering.mer-oppfolging'];
    const sykmeldtRegistreringUrl = brukMeroppfolging ? merOppfolgingUrl : '/sykmeldt/';

    useEffect(() => {
        if (!data || !dittNavUrl || (!perioder && !e)) {
            return;
        }

        if (isBrowser()) {
            const { servicegruppe, alder, registreringType, formidlingsgruppe } = data;
            const brukergruppe = beregnBrukergruppe(servicegruppe, alder);
            window.sessionStorage.setItem('beregnetBrukergruppe', brukergruppe);
            window.sessionStorage.setItem('registreringType', registreringType);
            if ([RegistreringType.ORDINAER_REGISTRERING, RegistreringType.REAKTIVERING].includes(registreringType)) {
                loggFlyt({ hendelse: 'Starter registrering' });
            }
            if (RegistreringType.ALLEREDE_REGISTRERT === registreringType) {
                loggFlyt({
                    hendelse: 'Ikke mulig å starte registreringen',
                    aarsak: formidlingsgruppe,
                    harAktivArbeidssokerperiode: harAktivArbeidssokerperiode(perioder?.arbeidssokerperioder),
                });
            }
            if (RegistreringType.SYKMELDT_REGISTRERING === registreringType && brukMeroppfolging) {
                loggFlyt({ hendelse: 'Sendes til siden for mer sykmeldtoppfølging' });
            }
        }
        router.push(hentNesteSideUrl(data, dittNavUrl, sykmeldtRegistreringUrl));
    }, [data, router, dittNavUrl, perioder, e]);

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

export const getServerSideProps = withAuthenticatedPage();
export default Start;
