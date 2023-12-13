import { ChevronLeftIcon } from '@navikt/aksel-icons';
import NextLink from 'next/link';

import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';
import useSprak from '../../hooks/useSprak';

interface TilbakeKnappProps {
    href: string;
}

const TEKSTER: Tekster<string> = {
    nb: {
        tilbake: 'Tilbake',
    },
    en: {
        tilbake: 'Back',
    },
};

const TilbakeKnapp = (props: TilbakeKnappProps) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    return (
        <NextLink href={props.href} locale={false} className="navds-link mb-4">
            <ChevronLeftIcon aria-hidden="true" /> {tekst('tilbake')}
        </NextLink>
    );
};

export default TilbakeKnapp;
