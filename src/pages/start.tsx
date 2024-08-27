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
import KanIkkeStartePeriodeV2 from '../components/feilmeldinger/kan-ikke-starte-periode-v2';
import {
    FeilmeldingVedStartAvArbeidssoekerperiode,
    FeilmeldingVedStartAvArbeidssoekerperiodeV2,
} from '../model/feilsituasjonTyper';

const StartNyInngang = () => {
    const router = useRouter();
    const { enableMock } = useConfig() as Config;
    const { toggles } = useFeatureToggles();
    const [feilmelding, setFeilmelding] = useState<undefined | FeilmeldingVedStartAvArbeidssoekerperiode>(undefined);
    const brukerMock = enableMock === 'enabled';
    const brukV2InngangsAPI = toggles['arbeidssoekerregistrering.bruk-v2-inngang'];
    const kanStartePeriodeVersjon = brukV2InngangsAPI ? 'kan-starte-periode-v2' : 'kan-starte-periode';
    const kanStartePeriodeUrl = brukerMock ? `api/mocks/${kanStartePeriodeVersjon}` : `api/${kanStartePeriodeVersjon}`;
    const { data, error, isLoading } = useSWRImmutable(kanStartePeriodeUrl, fetcher, { errorRetryCount: 0 });

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (error) {
            console.error(`Feil fra kan starte periode (${error.status}): `, error.data);
            setFeilmelding(error.data as FeilmeldingVedStartAvArbeidssoekerperiode);
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
            {feilmelding &&
                (brukV2InngangsAPI ? (
                    <KanIkkeStartePeriodeV2 feilmelding={feilmelding as FeilmeldingVedStartAvArbeidssoekerperiodeV2} />
                ) : (
                    <KanIkkeStartePeriode feilmelding={feilmelding} />
                ))}
        </>
    );
};

export const getServerSideProps = withAuthenticatedPage();

export default StartNyInngang;
