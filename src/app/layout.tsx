import {
    type DecoratorEnvProps,
    type DecoratorFetchProps,
    fetchDecoratorReact,
} from '@navikt/nav-dekoratoren-moduler/ssr';
import type { Metadata } from 'next';
import Script from 'next/script';
import '../styles/globals.css';
import InitFaroKomponent from '@/components/init-faro-komponent';
import InitTracker from '@/components/init-tracker';
import { ConfigProvider } from '@/contexts/config-context';
import { FeatureTogglesProvider } from '@/contexts/feature-toggle-context';
import { SkjemaStateProvider } from '@/contexts/skjema-state-context';
import styles from '../styles/app.module.css';

export const metadata: Metadata = {
    title: 'Arbeidssøkerregistrering',
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
                <InitTracker apiKey={process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!} />
                <InitFaroKomponent />
                <main className={styles.main} id="maincontent" tabIndex={-1}>
                    <ConfigProvider>
                        <SkjemaStateProvider>{children}</SkjemaStateProvider>
                    </ConfigProvider>
                </main>
                <Decorator.Footer />
                <Decorator.Scripts loader={Script} />
            </body>
        </html>
    );
}
