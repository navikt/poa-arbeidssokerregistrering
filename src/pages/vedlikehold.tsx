import { useEffect } from 'react';
import { Alert, BodyLong, GuidePanel, Heading } from '@navikt/ds-react';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../hooks/useSprak';

import { loggStoppsituasjon } from '../lib/amplitude';

const TEKSTER: Tekster<string> = {
    nb: {
        heading: 'Vedlikehold pågår',
        vedlikehold: 'Arbeidssøkerregistreringen er ikke tilgjengelig på grunn av vedlikehold.',
        provIgjen: 'Vennligst prøv igjen litt senere.',
        dagpenger:
            'Hvis du skal søke om dagpenger kan du sende inn søknaden nå, og registrere deg som arbeidssøker etterpå.',
    },
    nn: {
        heading: 'Det blir utført vedlikehald',
        vedlikehold: 'Arbeidssøkjarregistrering er ikkje tilgjengeleg grunna vedlikehald.',
        provIgjen: 'Prøv igjen litt seinare.',
        dagpenger:
            'Dersom du skal søkje om dagpengar, kan du sende inn søknaden no, og registrere deg som arbeidssøkjar etterpå.',
    },
    en: {
        heading: 'Maintenance',
        vedlikehold: 'Due to maintenance you can not register as a jobseeker at the moment.',
        provIgjen: 'Please try again later.',
        dagpenger:
            'If you are applying for unemployment benefits, you can submit the application now, and register as a jobseeker afterwards.',
    },
};

function Vedlikehold() {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren får ikke registrert seg pga nedetid',
        });
    }, []);

    return (
        <>
            <Heading level="1" size="large" spacing>
                {tekst('heading')}
            </Heading>
            <GuidePanel poster>
                <BodyLong>{tekst('vedlikehold')}</BodyLong>
                <BodyLong spacing>{tekst('provIgjen')}</BodyLong>
                <Alert variant="info">{tekst('dagpenger')}</Alert>
            </GuidePanel>
        </>
    );
}

export default Vedlikehold;
