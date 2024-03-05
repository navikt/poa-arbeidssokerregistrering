import { Loader } from '@navikt/ds-react';
import useSWR from 'swr';

import { useConfig } from '../contexts/config-context';

import { fetcher } from '../lib/api-utils';
import { Config } from '../model/config';
import { withAuthenticatedPage } from '../auth/withAuthentication';

interface VenteProps {
    isLoading: boolean;
}

function Venter(props: VenteProps) {
    if (!props.isLoading) return null;
    return (
        <div style={{ textAlign: 'center' }}>
            <Loader variant="neutral" size="2xlarge" title="henter årsak til stopp..." />
        </div>
    );
}

interface StopProps {
    data: {};
}

function StoppAarsak(props: StopProps) {
    if (!props.data) return null;
    return <div style={{ textAlign: 'center' }}>{JSON.stringify(props.data, null, 2)}</div>;
}

interface ErrorProps {
    error: {};
}

function Feilmelding(props: ErrorProps) {
    if (!props.error) return null;
    return <div style={{ textAlign: 'center' }}>{JSON.stringify(props.error, null, 2)}</div>;
}

function Stoppet() {
    const { enableMock } = useConfig() as Config;
    const brukerMock = enableMock === 'enabled';
    const kanStartePeriodeUrl = brukerMock ? 'api/mocks/kan-starte-periode' : 'api/kan-starte-periode';
    const { data, error, isLoading } = useSWR(kanStartePeriodeUrl, fetcher);

    return (
        <>
            <Venter isLoading={isLoading} />
            <StoppAarsak data={data} />
            <Feilmelding error={error} />
        </>
    );
}

export const getServerSideProps = withAuthenticatedPage();

export default Stoppet;
