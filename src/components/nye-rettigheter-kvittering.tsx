import { GuidePanel, Heading, Link, BodyShort, Box, List } from '@navikt/ds-react';

import useSprak from '../hooks/useSprak';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Rettigheter',
        startRegistrering: 'Start registrering',
        elektroniskId: 'Du må ha elektronisk ID for å registrere deg',
        elektroniskIdInfo:
            'For å registrere deg hos NAV, må du logge inn med BankID, BankID på mobil, Buypass eller Commfides.',
    },
    en: {
        tittel: 'Your rights',
        startRegistrering: 'Start registration',
        elektroniskId: 'You will need an electronic ID to register',
        elektroniskIdInfo:
            'To register at NAV, you must login with either BankID, BankID on mobile, Buypass or Commfides.',
    },
};

const NyeRettigheterKvittering = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    return (
        <Box padding="6" className="mb-12">
            <List as="ul">
                <List.Item>
                    Vi vurderer nå de opplysningene du har gitt oss opp mot de opplysningene vi har om andre
                    arbeidssøkere i omtrent samme situasjon som deg. På bakgrunn av dette vil en veileder fatte et
                    vedtak som sendes til deg. Vedtaket forteller hvordan NAV vurderer din situasjon i arbeidsmarkedet
                    og hvilken hjelp du skal få fra NAV.
                </List.Item>
                <List.Item>
                    Hvis du er uenig i NAV sin vurdering, kan du gi tilbakemelding om dette på innloggede sider.
                </List.Item>
                <List.Item>
                    Om du søker pengestøtte fra NAV vil du få mer informasjon om hva NAV krever av deg dersom du får
                    denne innvilget.
                </List.Item>
                <List.Item>
                    I perioden du ønsker å være registrert som arbeidssøker hos NAV er det viktig at du leverer
                    meldekort.
                </List.Item>
                <List.Item>
                    Hvis det skjer endringer i livet ditt som påvirker din status som arbeidssøker må du ta kontakt med
                    NAV. Da gjør vi en ny vurdering av ditt behov.
                </List.Item>
            </List>
            <List
                as="ul"
                description="For å komme deg raskest mulig tilbake i jobb anbefaler vi også at:"
                className="mt-8"
            >
                <List.Item>Du oppdaterer CVen din.</List.Item>
                <List.Item>Holder deg oppdatert på arbeidsmarkedet innenfor ditt felt.</List.Item>
            </List>
        </Box>
    );
};

export default NyeRettigheterKvittering;
