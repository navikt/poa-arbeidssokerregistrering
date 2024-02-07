import { useEffect } from 'react';
import NextApp, { AppContext, AppProps } from 'next/app';
import Head from 'next/head';
import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';

import useSprak from '../hooks/useSprak';

import { AmplitudeProvider } from '../contexts/amplitude-context';
import { FeatureToggleProvider } from '../contexts/featuretoggle-context';
import { ErrorProvider } from '../contexts/error-context';
import { GlobalFeilmelding } from '../components/feilmeldinger/feilmeldinger';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { ConfigProvider } from '../contexts/config-context';
import { initFaro } from '../faro/initFaro';

import styles from '../styles/app.module.css';
import '../styles/globals.css';
import { loggAktivitet } from '../lib/amplitude';

const TEKSTER: Tekster<string> = {
    nb: {
        metaTittel: 'Arbeidssøkerregistrering',
        metaDescription: 'Skjema for arbeidssøkerregistrering',
    },
    en: {
        metaTittel: 'Job seeker registration',
        metaDescription: 'Register as job seeker',
    },
};

function MyApp({ Component, pageProps, router }: AppProps) {
    onLanguageSelect(async ({ locale }) => {
        loggAktivitet({ aktivitet: 'Bytter språk', locale });
        return router.push(router.asPath, router.asPath, { locale });
    });
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    useEffect(() => {
        initFaro();
    }, []);

    return (
        <main className={styles.main} lang="nb" id="maincontent" role="main" tabIndex={-1}>
            <Head>
                <title>{tekst('metaTittel')}</title>
                <meta name="description" content={tekst('metaDescription')} />
            </Head>
            <ConfigProvider>
                <FeatureToggleProvider>
                    <AmplitudeProvider>
                        <ErrorProvider>
                            <GlobalFeilmelding />
                            <Component {...pageProps} />
                        </ErrorProvider>
                    </AmplitudeProvider>
                </FeatureToggleProvider>
            </ConfigProvider>
        </main>
    );
}

MyApp.getInitialProps = async function getInitialProps(context: AppContext) {
    return NextApp.getInitialProps(context);
};

export default MyApp;
