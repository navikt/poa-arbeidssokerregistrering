import { Alert, Link } from '@navikt/ds-react';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../hooks/useSprak';

const TEKSTER: Tekster<string> = {
    nb: {
        tlfHosKRR: 'Telefonnummer lagret hos Kontakt- og reservasjonsregisteret',
        tlfHosNAV: 'Telefonnummer lagret hos NAV',
        endreOpplysninger: 'Endre kontaktopplysninger på nav.no',
        ingenOpplysninger: 'Ingen kontaktopplysninger funnet!',
        leggInnOpplysninger: 'Legg inn kontaktopplysninger på nav.no',
        hjelpetekst: 'Pass på at kontaktopplysningene dine er oppdatert, ellers kan vi ikke nå deg.',
    },
    nn: {
        tlfHosKRR: 'Telefonnummer lagra hos Kontakt- og reservasjonsregisteret',
        tlfHosNAV: 'Telefonnummer lagra hos NAV',
        endreOpplysninger: 'Endre kontaktopplysningar på nav.no ',
        ingenOpplysninger: 'Ingen kontaktopplysningar funnet!',
        leggInnOpplysninger: 'Legg inn kontaktopplysninger på nav.no',
        hjelpetekst: 'Pass på at kontaktopplysningane dine er oppdaterte, slik at vi kan nå tak i deg.',
    },
    en: {
        tlfHosKRR: "Telephone number stored in NAV's Contact and Reservation Register",
        tlfHosNAV: "Telephone number in NAV's archives",
        endreOpplysninger: 'Change contact information online: nav.no',
        ingenOpplysninger: 'We could not find any contact information!',
        leggInnOpplysninger: 'Enter contact details',
        hjelpetekst: 'Make sure your contact information is up to date or we will not be able to reach you.',
    },
};

export const Kontaktinformasjon = () => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <>
            <Alert variant="info" inline className="mb-6">
                {tekst('hjelpetekst')}
            </Alert>
            <EndreOpplysningerLink tekst={tekst('leggInnOpplysninger')} />
        </>
    );
};

const EndreOpplysningerLink = (props: { tekst: string }) => {
    return (
        <Link href="https://www.nav.no/person/personopplysninger/#kontaktinformasjon" target="_blank">
            {props.tekst}
            <ExternalLinkIcon />
        </Link>
    );
};
