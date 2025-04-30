import React, { useEffect } from 'react';
import { withAuthenticatedPage } from '../auth/withAuthentication';
import GammelKvittering from '../components/kvittering/gammel-kvittering';
import { loggAktivitet, loggFlyt } from '../lib/amplitude';
import { useFeatureToggles } from '../contexts/featuretoggle-context';
import NyKvittering from '../components/kvittering/ny-kvittering';

const Kvittering = () => {
    useEffect(() => {
        loggAktivitet({
            aktivitet: 'Viser kvittering',
        });
        loggFlyt({ hendelse: 'Registrering fullført' });
    }, []);

    const { toggles } = useFeatureToggles();
    console.log(toggles);
    if (toggles['arbeidssokerregistrering.bruk-ny-kvittering']) {
        return <NyKvittering />;
    }

    return <GammelKvittering />;
};

export const getServerSideProps = withAuthenticatedPage();
export default Kvittering;
