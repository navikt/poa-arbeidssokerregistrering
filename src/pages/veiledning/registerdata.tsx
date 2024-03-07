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
        overskrift: 'Vi finner ikke de nødvendige opplysningene',
        innledning: 'For at du skal få registrert deg som arbeidssøker må vi hjelpe deg videre.',
        sendMelding: 'Send melding til veilederen din',
        ringOss: 'eller ring oss på',
        telefonNummer: '55 55 33 33',
    },
    nn: {
        overskrift: 'Vi må hjelpe deg vidare i andre kanalar',
        innledning: 'For at du skal få registrert deg som arbeidssøkjar, må vi hjelpe deg vidare.',
        sendMelding: 'Send melding til rettleiaren din',
        ringOss: 'eller ring oss på',
        telefonNummer: '55 55 33 33',
    },
    en: {
        overskrift: 'We need to help you further using other channels',
        innledning: 'You will need our assistance to register as a jobseeker. ',
        sendMelding: 'Send a message to your NAV counsellor',
        ringOss: 'or call us at',
        telefonNummer: '55 55 33 33',
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
            <BodyLong>{tekst('innledning')}</BodyLong>
            <BodyLong>
                <Link href={dialogUrl}>{tekst('sendMelding')}</Link> {tekst('ringOss')} <b>{tekst('telefonNummer')}</b>
            </BodyLong>
        </Alert>
    );
}

export const getServerSideProps = withAuthenticatedPage();
export default Registerdata;
