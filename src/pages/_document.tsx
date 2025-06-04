import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

import {
    fetchDecoratorReact,
    DecoratorEnvProps,
    DecoratorFetchProps,
    DecoratorComponentsReact,
} from '@navikt/nav-dekoratoren-moduler/ssr';

import { logger } from '@navikt/next-logger';

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
        redirectToApp: true,
        availableLanguages,
    },
};

export default class MyDocument extends Document<DecoratorComponentsReact> {
    static async getInitialProps(ctx: DocumentContext) {
        const { locale } = ctx;
        const initialProps = await Document.getInitialProps(ctx);
        const Decorator: DecoratorComponentsReact = await fetchDecoratorReact({
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
                HeadAssets: empty,
                Footer: empty,
                Header: empty,
                Scripts: empty,
            };
        });

        return {
            ...initialProps,
            ...Decorator,
            locale,
        };
    }

    render() {
        const { HeadAssets, Header, Footer, Scripts, locale } = this.props;
        return (
            <Html lang={locale ?? 'nb'}>
                <Head>
                    <HeadAssets />
                </Head>
                <body>
                    <Header />
                    <Main />
                    <Footer />
                    <Scripts />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
