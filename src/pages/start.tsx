import { useEffect, useState } from 'react';
import { Loader } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

import { useConfig } from '../contexts/config-context';

import { SkjemaSide } from '../model/skjema';
import { fetcher } from '../lib/api-utils';
import { Config } from '../model/config';
import { withAuthenticatedPage } from '../auth/withAuthentication';
import KanIkkeStartePeriodeV2 from '../components/feilmeldinger/kan-ikke-starte-periode-v2';
import { FeilmeldingVedStartAvArbeidssoekerperiodeV2 } from '../model/feilsituasjonTyper';

const StartNyInngang = () => {
    const router = useRouter();
    const { enableMock } = useConfig() as Config;
    const [feilmelding, setFeilmelding] = useState<undefined | FeilmeldingVedStartAvArbeidssoekerperiodeV2>(undefined);
    const brukerMock = enableMock === 'enabled';
    const kanStartePeriodeVersjon = 'kan-starte-periode-v2';
    const kanStartePeriodeUrl = brukerMock ? `api/mocks/${kanStartePeriodeVersjon}` : `api/${kanStartePeriodeVersjon}`;
    const { data, error, isLoading } = useSWRImmutable(kanStartePeriodeUrl, fetcher, { errorRetryCount: 0 });

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (error) {
            console.error(`Feil fra kan starte periode (${error.status}): `, error.data);
            setFeilmelding(error.data as FeilmeldingVedStartAvArbeidssoekerperiodeV2);
            return;
        }

        router.push(`/opplysninger/${SkjemaSide.DinSituasjon}`);
    }, [data, isLoading, router, error]);

    return (
        <>
            {isLoading && (
                <div style={{ textAlign: 'center' }}>
                    <Loader variant="neutral" size="2xlarge" title="Forsøker å starte registrering..." />
                </div>
            )}
            {feilmelding && <KanIkkeStartePeriodeV2 feilmelding={feilmelding} />}
        </>
    );
};

export const getServerSideProps = withAuthenticatedPage();

export default StartNyInngang;
