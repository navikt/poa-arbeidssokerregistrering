import { useEffect } from 'react';
import { Alert, Button, Link } from '@navikt/ds-react';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../hooks/useSprak';
import { useConfig } from '../contexts/config-context';

import RedirectTilVedlikehold from '../components/redirect-til-vedlikehold';
import DemoPanel from '../components/forsiden/demo-panel';
import { Config } from '../model/config';
import { loggAktivitet } from '../lib/amplitude';
import { hentFeatures } from './api/features';
import { tilAktiveFeatures } from '../contexts/featuretoggle-context';
import { logger } from '@navikt/next-logger';
import { useRouter } from 'next/router';

const TEKSTER: Tekster<string> = {
    nb: {
        startRegistrering: 'Start registrering',
        informasjon: 'Dette er testsiden for arbeidssøkerregistrering.',
        dolly1: 'Du må ha en testbruker fra',
        dolly2: 'for å kunne gjennomføre en registrering.',
        lenkeIngress: 'Dersom du ønsker å se siden arbeidssøkere møter når de skal registrere seg kan du gå til',
        lenke: 'startsiden for arbeidssøkerregistrering på nav.no',
    },
    nn: {
        startRegistrering: 'Start registrering',
        informasjon: 'Dette er testsida for registrering av arbeidssøkarar.',
        dolly1: 'Du må ha ein testbrukar frå',
        dolly2: 'for å kunne gjennomføre ei registrering.',
        lenkeIngress: 'Dersom du ønskjer å sjå sida arbeidssøkarar møter når dei skal registrere seg, kan du gå til',
        lenke: 'startsida for arbeidssøkarregistrering på nav.no',
    },
    en: {
        startRegistrering: 'Start registration',
        informasjon: 'This is the test page for job seeker registration.',
        dolly1: 'You must have a test user from',
        dolly2: 'to complete a registration.',
        lenkeIngress: 'If you want to see the page job seekers meet when they register, you can go to',
        lenke: 'the front page for job seeker registration at nav.no',
    },
};

const Home = () => {
    const router = useRouter();
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { enableMock } = useConfig() as Config;
    const brukerMock = enableMock === 'enabled';

    useEffect(() => {
        loggAktivitet({ aktivitet: 'Viser forsiden for arbeidssøkerregistreringen' });
    }, []);

    const logStartHandler = () => {
        loggAktivitet({ aktivitet: 'Går til start registrering' });
        router.push('/start');
    };

    return (
        <div className="flex flex-col gap-4 mb-4">
            <RedirectTilVedlikehold />
            <Alert variant="info">
                <div className="flex flex-col gap-4">
                    <div>{tekst('informasjon')}</div>
                    <div>
                        {tekst('dolly1')}{' '}
                        <Link href="https://dolly.ekstern.dev.nav.no/gruppe" target="_blank" rel="noreferrer">
                            Dolly
                        </Link>{' '}
                        {tekst('dolly2')}
                    </div>
                    <div>
                        {tekst('lenkeIngress')}
                        <Link
                            className="ml-1"
                            href="https://www.nav.no/registrer-arbeidssoker"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {tekst('lenke')}
                        </Link>
                    </div>
                </div>
            </Alert>
            <div className="flex justify-center py-8">
                <Button onClick={() => logStartHandler()}>{tekst('startRegistrering')}</Button>
            </div>
            <DemoPanel brukerMock={brukerMock} />
        </div>
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
