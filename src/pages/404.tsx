import React from 'react';
import { ContentContainer } from '@navikt/ds-react';
import Head from 'next/head';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../hooks/useSprak';

const TEKSTER: Tekster<string> = {
    nb: {
        metaTittel: '404 - Fant ikke siden',
        metaDescription: 'Siden eksisterer ikke',
        fantIkke: 'Fant ikke siden',
    },
};

function NotFound() {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    return (
        <ContentContainer>
            <Head>
                <title>{tekst('metaTittel')}</title>
                <meta name="description" content={tekst('metaDescription')} />
            </Head>
            <div>{tekst('fantIkke')}</div>
        </ContentContainer>
    );
}

export default NotFound;
