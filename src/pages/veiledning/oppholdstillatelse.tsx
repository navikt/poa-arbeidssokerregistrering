import { useEffect } from 'react';
import { Alert, BodyLong, Heading, Link } from '@navikt/ds-react';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';

import { loggStoppsituasjon } from '../../lib/amplitude';
import { useConfig } from '../../contexts/config-context';
import { Config } from '../../model/config';
import { withAuthenticatedPage } from '../../auth/withAuthentication';

const TEKSTER: Tekster<string> = {
    nb: {
        overskrift: 'Vi får ikke bekreftet at du kan registrere deg',
        innhold:
            'Vi kan dessverre ikke registrere deg som arbeidssøker da du i følge våre systemer ikke har bostedsadresse i Norge. Ta kontakt med NAV kontaktsenter på 55 55 33 33 for å få mer informasjon om hva du må gjøre for å kunne registrere deg som arbeidssøker.',
        lesomkrav: 'Du finner mer informasjon om hva som kreves for å registrere deg som arbeidssøker i Norge på',
        workInNorwayLenke: 'https://www.workinnorway.no/no/Forside',
        workInNorwayLenkeTekst: 'sidene til Work in Norway',
        vilDuHaHjelp: 'Vil du at vi skal hjelpe deg videre kan du',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss',
        kontaktOssLenkeTekst: 'kontakte oss',
    },
};

function Oppholdstillatelse() {
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
                {tekst('lesomkrav')} <Link href={tekst('workInNorwayLenke')}>{tekst('workInNorwayLenkeTekst')}</Link>
            </BodyLong>
            <BodyLong spacing>
                {tekst('vilDuHaHjelp')} <Link href={tekst('kontaktOssLenke')}>{tekst('kontaktOssLenkeTekst')}</Link>
            </BodyLong>
        </Alert>
    );
}

export const getServerSideProps = withAuthenticatedPage();
export default Oppholdstillatelse;
