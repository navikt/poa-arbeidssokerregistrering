import { useEffect } from 'react';
import { Alert, BodyLong, Button, Heading, Link } from '@navikt/ds-react';

import useSprak from '../../hooks/useSprak';
import { useErrorContext } from '../../contexts/error-context';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { loggStoppsituasjon } from '../../lib/amplitude';

const TEKSTER: Tekster<string> = {
    nb: {
        feilISystemene: 'På grunn av feil i systemene våre kan du ikke registrere deg akkurat nå.',
        provIgjen: 'Vennligst prøv igjen litt senere.',
        kontaktBrukerstotte: 'Kontakt teknisk brukerstøtte dersom problemene vedvarer.',
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
                Beklager, teknisk feil
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
                    Lukk
                </Button>
            </BodyLong>
        </Alert>
    );
};

export { FeilmeldingGenerell, GlobalFeilmelding };
