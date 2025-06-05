import { Alert, BodyLong, GuidePanel, Heading } from '@navikt/ds-react';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import LoggVisning from '@/app/vedlikehold/logg-visning';
import { NextPageProps } from '@/types/next';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';

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
        heading: 'Maintenance in progress',
        vedlikehold: 'Jobseeker registration is not available due to maintenance.',
        provIgjen: 'Please try again a little later.',
        dagpenger:
            'If you are going to apply for unemployment benefits, you can submit the application now and register as a jobseeker afterwards.',
    },
};

export default async function Vedlikehold({ params }: NextPageProps) {
    const { lang } = await params;
    const sprak = lang ?? 'nb';
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <>
            <LoggVisning />
            <SettSprakIDekorator sprak={sprak} />
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
