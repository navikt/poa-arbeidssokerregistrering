import { DecoratorEnvProps, DecoratorFetchProps, fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import Script from 'next/script';
import type { Metadata } from 'next';
import '../styles/globals.css';
import styles from '../styles/app.module.css';

export const metadata: Metadata = {
    title: 'ArbeidssøArbeidssøkerregistreringkerregisteret',
    description: 'Skjema for arbeidssøkerregistrering',
};

const dekoratorEnv = process.env.DEKORATOR_ENV as Exclude<DecoratorEnvProps['env'], 'localhost'>;

const availableLanguages = [
    {
        locale: 'nb',
        handleInApp: true,
    },
    {
        locale: 'nn',
        handleInApp: true,
    },
    {
        locale: 'en',
        handleInApp: true,
    },
] as any;

const dekoratorProps: DecoratorEnvProps & DecoratorFetchProps = {
    env: dekoratorEnv ?? 'prod',
    params: {
        simple: true,
        context: 'privatperson',
        chatbot: false,
        logoutWarning: true,
        redirectToApp: true,
        availableLanguages,
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const Decorator = await fetchDecoratorReact(dekoratorProps);

    return (
        <html lang="nb">
            <head>
                <Decorator.HeadAssets />
            </head>
            <body>
                <Decorator.Header />
                {/*<InitAmplitude apiKey={process.env.AMPLITUDE_API_KEY!} />*/}
                <main className={styles.main} id="maincontent" role="main" tabIndex={-1}>
                    {children}
                </main>
                <Decorator.Footer />
                <Decorator.Scripts loader={Script} />
            </body>
        </html>
    );
}
