import { useEffect } from 'react';
import { Alert, BodyLong, Button, Heading, Link } from '@navikt/ds-react';

import useSprak from '../../hooks/useSprak';
import { useErrorContext } from '../../contexts/error-context';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { loggStoppsituasjon } from '../../lib/amplitude';

const TEKSTER: Tekster<string> = {
    nb: {
        heading: 'Beklager, teknisk feil',
        feilISystemene: 'På grunn av feil i systemene våre kan du ikke registrere deg akkurat nå.',
        provIgjen: 'Vennligst prøv igjen litt senere.',
        kontaktBrukerstotte: 'Kontakt teknisk brukerstøtte dersom problemene vedvarer.',
        lukkKnapp: 'Lukk',
    },
    nn: {
        heading: 'Vi beklagar, men det har oppstått ein teknisk feil ',
        feilISystemene: 'Grunna feil i systema våre kan du ikkje registrere deg akkurat no.',
        provIgjen: 'Prøv igjen litt seinare.',
        kontaktBrukerstotte: 'Kontakt teknisk brukarstøtte dersom problema varer ved.',
        lukkKnapp: 'Lukk',
    },
    en: {
        heading: 'Sorry, technical error',
        feilISystemene: 'You cannot register right now, due to bugs in our systems.',
        provIgjen: 'Please try again a little later.',
        kontaktBrukerstotte: 'Contact technical support if the problems persist.',
        lukkKnapp: 'Cancel',
    },
};

const FeilmeldingGenerell = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren får en feilmelding',
        });
    }, []);

    return (
        <>
            <Heading size="medium" spacing level="1">
                {tekst('heading')}
            </Heading>
            <Alert variant={'error'}>
                <BodyLong spacing>{tekst('feilISystemene')}</BodyLong>
                <BodyLong spacing>{tekst('provIgjen')}</BodyLong>
                <BodyLong>
                    <Link href="https://www.nav.no/kontaktoss">{tekst('kontaktBrukerstotte')}</Link>
                </BodyLong>
            </Alert>
        </>
    );
};

const GlobalFeilmelding = () => {
    const { error, setError } = useErrorContext();
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    useEffect(() => {
        if (error) {
            loggStoppsituasjon({
                situasjon: 'Arbeidssøkeren får en feilmelding',
            });
        }
    }, [error]);

    if (!error) {
        return null;
    }

    return (
        <Alert variant={'error'}>
            <BodyLong spacing>{tekst('feilISystemene')}</BodyLong>
            <BodyLong spacing>{tekst('provIgjen')}</BodyLong>
            <BodyLong spacing>
                <Link href="https://www.nav.no/kontaktoss">{tekst('kontaktBrukerstotte')}</Link>
            </BodyLong>
            <BodyLong>
                <Button variant={'secondary'} onClick={() => setError(null)}>
                    {tekst('lukkKnapp')}
                </Button>
            </BodyLong>
        </Alert>
    );
};

export { FeilmeldingGenerell, GlobalFeilmelding };
