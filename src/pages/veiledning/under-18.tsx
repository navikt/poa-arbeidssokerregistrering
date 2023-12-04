import { BodyLong, GuidePanel, Heading } from '@navikt/ds-react';
import { Feiltype, OppgaveRegistreringstype } from '../../model/feilsituasjonTyper';
import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';
import useSprak from '../../hooks/useSprak';
import { withAuthenticatedPage } from '../../auth/withAuthentication';

const TEKSTER: Tekster<string> = {
    nb: {
        heading: 'En veileder må hjelpe deg slik at du blir registrert',
        body2: 'Dette gjør at du ikke kan registrere deg som arbeidssøker på nett.',
        kontaktOss: 'Kontakt oss, så hjelper vi deg videre.',
        kontaktKnapp: 'Ta kontakt',
        avbryt: 'Avbryt',
    },
    en: {
        //TODO: Oversetting
    },
};
function Under18() {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <GuidePanel poster>
            <Heading size="medium" spacing={true} level="1">
                {tekst('heading')}
            </Heading>
            <BodyLong>Du er under 18 år og kan ikke registrere deg</BodyLong>
            <BodyLong spacing>{tekst('body2')}</BodyLong>
            <BodyLong>{tekst('kontaktOss')}</BodyLong>
        </GuidePanel>
    );
}

export const getServerSideProps = withAuthenticatedPage();
export default Under18;
