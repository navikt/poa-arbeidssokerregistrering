import { useEffect } from 'react';
import { Heading } from '@navikt/ds-react';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../hooks/useSprak';
import { useConfig } from '../contexts/config-context';

import RedirectTilVedlikehold from '../components/redirect-til-vedlikehold';
import DemoPanel from '../components/forsiden/demo-panel';
import { Config } from '../model/config';
import { loggAktivitet } from '../lib/amplitude';
import NyeRettigheterPanel from '../components/forsiden/nye-rettigheter';
import { hentFeatures } from './api/features';
import { tilAktiveFeatures } from '../contexts/featuretoggle-context';
import { logger } from '@navikt/next-logger';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Registrer deg som arbeidssøker',
        startRegistrering: 'Start registrering',
        elektroniskId: 'Du må ha elektronisk ID for å registrere deg',
        elektroniskIdInfo: 'For å registrere deg hos NAV, må du logge inn med BankID, Buypass eller Commfides.',
    },
    nn: {
        tittel: 'Registrer deg som arbeidssøkjar',
        startRegistrering: 'Start registrering',
        elektroniskId: 'Du må ha elektronisk ID for å registrere deg',
        elektroniskIdInfo: 'For å registrere deg hos NAV må du logge inn med BankID, Buypass eller Commfides.',
    },
    en: {
        tittel: 'Register as a Job Seeker',
        startRegistrering: 'Start registration',
        elektroniskId: 'You must have an electronic ID to register',
        elektroniskIdInfo: 'To register with NAV, you must log in using BankID, Buypass or Commfides.',
    },
};

const Home = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { enableMock } = useConfig() as Config;
    const brukerMock = enableMock === 'enabled';

    useEffect(() => {
        loggAktivitet({ aktivitet: 'Viser forsiden for arbeidssøkerregistreringen' });
    }, []);

    return (
        <>
            <RedirectTilVedlikehold />
            <div className="maxWidth flex items-center justify-center flex-wrap">
                <Heading className="mb-8" size="xlarge" level="1">
                    {tekst('tittel')}
                </Heading>
                <NyeRettigheterPanel />
                <DemoPanel brukerMock={brukerMock} />
            </div>
        </>
    );
};

export default Home;

export async function getServerSideProps() {
    try {
        const { features } = await hentFeatures();
        const aktiveFeatures = tilAktiveFeatures(features);

        if (aktiveFeatures['arbeidssoekerregistrering.redirect-forside']) {
            return {
                redirect: {
                    permanent: false,
                    destination: process.env.FORSIDE_URL,
                },
            };
        }
    } catch (err) {
        logger.error(`Feil ved server-side henting av feature toggles: ${err}`);
    }

    return { props: {} };
}
