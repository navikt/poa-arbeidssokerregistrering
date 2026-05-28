import { lagHentTekstForSprak, type Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { onLanguageSelect } from '@navikt/nav-dekoratoren-moduler';
import NextApp, { type AppContext, type AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { GlobalFeilmelding } from '../components/feilmeldinger/feilmeldinger';
import { ConfigProvider } from '../contexts/config-context';
import { ErrorProvider } from '../contexts/error-context';
import { FeatureToggleProvider } from '../contexts/featuretoggle-context';
import { initFaro } from '../faro/initFaro';
import useSprak from '../hooks/useSprak';

import styles from '../styles/app.module.css';
import '../styles/globals.css';
import { loggAktivitet } from '../lib/tracker';

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
        <main className={styles.main} id="maincontent" tabIndex={-1}>
            <Head>
                <title>{tekst('metaTittel')}</title>
                <meta name="description" content={tekst('metaDescription')} />
            </Head>
            <ConfigProvider>
                <FeatureToggleProvider>
                    <ErrorProvider>
                        <GlobalFeilmelding />
                        <Component {...pageProps} />
                    </ErrorProvider>
                </FeatureToggleProvider>
            </ConfigProvider>
        </main>
    );
}

MyApp.getInitialProps = async function getInitialProps(context: AppContext) {
    return NextApp.getInitialProps(context);
};

export default MyApp;
