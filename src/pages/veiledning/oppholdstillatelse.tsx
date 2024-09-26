import { useEffect } from 'react';
import { Alert, BodyLong, Heading, Link } from '@navikt/ds-react';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';
import { useFeatureToggles } from '../../contexts/featuretoggle-context';

import { loggStoppsituasjon } from '../../lib/amplitude';
import { withAuthenticatedPage } from '../../auth/withAuthentication';

const TEKSTER: Tekster<string> = {
    nb: {
        overskrift: 'Vi kan dessverre ikke registrere deg som arbeidssøker',
        overskriftNy: 'Du må registreres som arbeidssøker av en veileder',
        innhold: 'Dette er fordi du i følge våre systemer ikke er bosatt i Norge i henhold til folkeregisterloven.',
        innholdNy: 'Noen av opplysningene vi har hentet om deg må kontrolleres manuelt.',
        folkeregisteretTekst: 'hvis du mener dette er feil eller har behov for å oppdatere opplysningene dine',
        folkeregisteretLenke: 'https://www.skatteetaten.no/person/folkeregister/endre/opplysninger-om-identiteten-din/',
        folkeregisteretLenkeTekst: 'Ta kontakt med folkeregisteret',
        kontaktOssTekst: 'hvis du ønsker at vi skal hjelpe deg.',
        kontaktOssTekstNy: 'for å bli registrert som arbeidssøker',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'Ta kontakt med NAV',
    },
};

function DuKanIkkeRegistrereDegSelv() {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren kan ikke registrere seg selv',
        });
    }, []);

    return (
        <Alert variant="info">
            <Heading spacing size="small" level="1">
                {tekst('overskriftNy')}
            </Heading>
            <BodyLong spacing>{tekst('innholdNy')}</BodyLong>
            <BodyLong spacing>
                <Link href={tekst('kontaktOssLenke')}>{tekst('kontaktOssLenkeTekst')}</Link>{' '}
                {tekst('kontaktOssTekstNy')}.
            </BodyLong>
        </Alert>
    );
}

function ViIkkeRegistrereDeg() {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren er ikke bosatt i Norge etter folkeregisteret',
        });
    }, []);

    return (
        <Alert variant="warning">
            <Heading spacing size="small" level="1">
                {tekst('overskrift')}
            </Heading>
            <BodyLong spacing>{tekst('innhold')}</BodyLong>
            <BodyLong spacing>
                <Link href={tekst('folkeregisteretLenke')}>{tekst('folkeregisteretLenkeTekst')}</Link>{' '}
                {tekst('folkeregisteretTekst')} .
            </BodyLong>
            <BodyLong spacing>
                <Link href={tekst('kontaktOssLenke')}>{tekst('kontaktOssLenkeTekst')}</Link> {tekst('kontaktOssTekst')}.
            </BodyLong>
        </Alert>
    );
}

function Oppholdstillatelse() {
    const { toggles } = useFeatureToggles();
    const brukNyMelding = toggles['arbeidssokerregistrering.bruk-ny-du-kan-ikke-registrere-deg-selv-melding'];

    if (brukNyMelding) {
        return <DuKanIkkeRegistrereDegSelv />;
    }

    return <ViIkkeRegistrereDeg />;
}

export const getServerSideProps = withAuthenticatedPage();

export default Oppholdstillatelse;
