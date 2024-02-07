import { useEffect } from 'react';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { BodyLong, Button, Cell, Grid, Heading } from '@navikt/ds-react';

import useSprak from '../hooks/useSprak';
import { useConfig } from '../contexts/config-context';
import { tilAktiveFeatures } from '../contexts/featuretoggle-context';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import DineOpplysninger from '../components/forsiden/dine-opplysninger';
import DineOpplysningerGammel from '../components/forsiden/dine-opplysninger-gammel';
import RettigheterPanel from '../components/forsiden/rettigheter';
import PlikterPanel from '../components/forsiden/plikter';
import RedirectTilVedlikehold from '../components/redirect-til-vedlikehold';
import DemoPanel from '../components/forsiden/demo-panel';
import { Config } from '../model/config';
import { loggAktivitet } from '../lib/amplitude';
import ElektroniskID from '../components/forsiden/elektroniskID';
import NyeRettigheterPanel from '../components/forsiden/nye-rettigheter';
import { hentFeatures } from './api/features';
import { logger } from '@navikt/next-logger';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Registrer deg som arbeidssøker',
        startRegistrering: 'Start registrering',
        elektroniskId: 'Du må ha elektronisk ID for å registrere deg',
        elektroniskIdInfo:
            'For å registrere deg hos NAV, må du logge inn med BankID, BankID på mobil, Buypass eller Commfides.',
    },
    en: {
        tittel: 'Register as job seeker',
        startRegistrering: 'Start registration',
        elektroniskId: 'You will need an electronic ID to register',
        elektroniskIdInfo:
            'To register at NAV, you must login with either BankID, BankID on mobile, Buypass or Commfides.',
    },
};

const Home: NextPage<{ toggles: any }> = ({ toggles }) => {
    const router = useRouter();
    const { visGammelDineOpplysninger } = router.query;
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { enableMock } = useConfig() as Config;
    const brukerMock = enableMock === 'enabled';

    const fjernPlikterToggletPaa = toggles['arbeidssokerregistrering.fjern-plikter'];
    const visRettigheter = fjernPlikterToggletPaa;
    const visKrav = !fjernPlikterToggletPaa;

    const logStartHandler = () => {
        loggAktivitet({ aktivitet: 'Går til start registrering' });
    };

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
                {visRettigheter && <NyeRettigheterPanel />}
                {visKrav && (
                    <>
                        <Grid>
                            <Cell xs={12} md={6}>
                                <RettigheterPanel />
                            </Cell>
                            <Cell xs={12} md={6} className="mb-4">
                                <PlikterPanel />
                            </Cell>
                            <Cell xs={12}>
                                {visGammelDineOpplysninger ? <DineOpplysningerGammel /> : <DineOpplysninger />}
                            </Cell>
                            <Cell xs={12} className="text-center p-6">
                                <Heading size={'medium'} level="3" spacing={true}>
                                    {tekst('elektroniskId')}
                                </Heading>
                                <BodyLong style={{ maxWidth: '22em', display: 'inline-block' }}>
                                    {tekst('elektroniskIdInfo')}
                                </BodyLong>
                            </Cell>
                            <Cell xs={12} className={'text-center py-4'}>
                                <NextLink href="/start" passHref locale={false}>
                                    <Button onClick={() => logStartHandler()}>{tekst('startRegistrering')}</Button>
                                </NextLink>
                            </Cell>
                        </Grid>
                        <ElektroniskID />
                    </>
                )}
                <DemoPanel brukerMock={brukerMock} />
            </div>
        </>
    );
};

export async function getServerSideProps() {
    try {
        const { features } = await hentFeatures();

        return {
            props: {
                toggles: tilAktiveFeatures(features),
            },
        };
    } catch (err) {
        logger.error(`Feil ved server-side henting av feature toggles: ${err}`);
        return {
            props: {
                toggles: {},
            },
        };
    }
}

export default Home;
