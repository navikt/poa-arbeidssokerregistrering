import { useEffect } from 'react';
import { Alert, BodyLong, GuidePanel, Heading, Link } from '@navikt/ds-react';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';

import { loggStoppsituasjon } from '../../lib/amplitude';
import { useConfig } from '../../contexts/config-context';
import { Config } from '../../model/config';
import { withAuthenticatedPage } from '../../auth/withAuthentication';

const TEKSTER: Tekster<string> = {
    nb: {
        overskrift: 'Vi kan dessverre ikke registrere deg som arbeidssøker',
        innledning:
            'De opplysningene vi henter om deg fra folkeregisteret oppfyller ikke kravene til at du kan registrere deg som arbeidssøker.',
        folkeregisteretKontakt: 'Du kan kontakte folkeregisteret for å gjøre endringer i opplysningene dine',
        folkeregisteretLenke: 'https://www.skatteetaten.no/person/folkeregister/endre/',
        folkeregisteretLenkeTekst: 'på nettsiden deres.',
        vilDuHaHjelp: 'Vil du at vi skal hjelpe deg videre kan du',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'kontakte oss',
    },
};

function Registerdata() {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren kunne ikke verifiseres etter registerdata',
        });
    }, []);

    const { dialogUrl } = useConfig() as Config;

    return (
        <Alert variant="warning">
            <Heading spacing size="small" level="1">
                {tekst('overskrift')}
            </Heading>
            <BodyLong spacing>{tekst('innledning')}</BodyLong>
            <BodyLong spacing>
                {tekst('folkeregisteretKontakt')}{' '}
                <Link href={tekst('folkeregisteretLenke')}>{tekst('folkeregisteretLenkeTekst')}</Link>
            </BodyLong>
            <BodyLong spacing>
                {tekst('vilDuHaHjelp')} <Link href={tekst('kontaktOssLenke')}>{tekst('kontaktOssLenkeTekst')}</Link>
                {''}.
            </BodyLong>
        </Alert>
    );
}

export const getServerSideProps = withAuthenticatedPage();
export default Registerdata;
