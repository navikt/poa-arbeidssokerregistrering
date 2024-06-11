import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import {
    DecoratorComponents,
    DecoratorEnvProps,
    DecoratorFetchProps,
    fetchDecoratorReact,
} from '@navikt/nav-dekoratoren-moduler/ssr';
import { logger } from '@navikt/next-logger';
import localeTilUrl from '../lib/locale-til-url';
import getConfig from 'next/config';

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
        availableLanguages,
    },
};
export default class MyDocument extends Document<DecoratorComponents> {
    static async getInitialProps(ctx: DocumentContext) {
        const { locale } = ctx;
        const initialProps = await Document.getInitialProps(ctx);
        const Dekorator: DecoratorComponents = await fetchDecoratorReact({
            ...dekoratorProps,
            params: {
                ...dekoratorProps.params,
                language: locale as any,
                redirectToApp: true,
            },
        }).catch((err) => {
            logger.error(err);
            const empty = () => <></>;
            return {
                Footer: empty,
                Header: empty,
                Scripts: empty,
                Styles: empty,
            };
        });

        return {
            ...initialProps,
            ...Dekorator,
            locale,
        };
    }

    render(): JSX.Element {
        const { Styles, Scripts, Header, Footer, locale } = this.props;
        const { basePath } = getConfig().publicRuntimeConfig;
        return (
            <Html lang={locale ?? 'nb'}>
                <Head>
                    <Styles />
                    <link rel="icon" href={`${basePath}/favicon.ico`} />
                </Head>
                <body>
                    <Scripts />
                    <Header />
                    <Main />
                    <Footer />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
