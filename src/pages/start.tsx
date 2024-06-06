import { useEffect, useState } from 'react';
import { Loader } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

import { useConfig } from '../contexts/config-context';
import { useFeatureToggles } from '../contexts/featuretoggle-context';

import { SkjemaSide } from '../model/skjema';
import { fetcher } from '../lib/api-utils';
import { Config } from '../model/config';
import { withAuthenticatedPage } from '../auth/withAuthentication';
import KanIkkeStartePeriode from '../components/feilmeldinger/kan-ikke-starte-periode';
import { FeilmeldingVedStartAvArbeidssoekerperiode } from '../model/feilsituasjonTyper';

const StartNyInngang = () => {
    const router = useRouter();
    const { enableMock } = useConfig() as Config;
    const { toggles } = useFeatureToggles();
    const [feilmelding, setFeilmelding] = useState<undefined | FeilmeldingVedStartAvArbeidssoekerperiode>(undefined);
    const brukerMock = enableMock === 'enabled';
    const kanStartePeriodeUrl = brukerMock ? 'api/mocks/kan-starte-periode' : 'api/kan-starte-periode';
    const fjernPlikter = toggles['arbeidssokerregistrering.fjern-plikter'];
    const { data, error, isLoading } = useSWRImmutable(kanStartePeriodeUrl, fetcher, { errorRetryCount: 0 });
    const registreringsSkjema = fjernPlikter ? 'opplysninger' : 'skjema';

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (error) {
            console.error(`Feil fra kan starte periode (${error.status}): `, error.data);
            setFeilmelding(error.data as FeilmeldingVedStartAvArbeidssoekerperiode);
            return;
        }

        router.push(`/${registreringsSkjema}/${SkjemaSide.DinSituasjon}`);
    }, [data, isLoading, router, error]);

    return (
        <>
            {isLoading && (
                <div style={{ textAlign: 'center' }}>
                    <Loader variant="neutral" size="2xlarge" title="Forsøker å starte registrering..." />
                </div>
            )}
            {feilmelding && <KanIkkeStartePeriode feilmelding={feilmelding} />}
        </>
    );
};

export const getServerSideProps = withAuthenticatedPage();

export default StartNyInngang;
