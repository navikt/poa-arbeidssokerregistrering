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
        <div>
            <Box className="mb-12">
                <List as="ul">
                    <List.Item>
                        Nå vil opplysningene du har gitt om utdanning, livssituasjon og tidligere arbeidsforhold bli
                        brukt til å vurdere hvilken hjelp du skal få fra NAV. Vi vurderer de opplysningene du har gitt
                        oss opp mot de opplysningene vi har om andre arbeidssøkere i omtrent samme situasjon som deg. På
                        bakgrunn av dette vil en veileder fatte et vedtak som sendes til deg. Vedtaket forteller hvordan
                        NAV vurderer din situasjon i arbeidsmarkedet.
                    </List.Item>
                    <List.Item>
                        Dersom du er uenig i NAV sin vurdering, har du mulighet til å gi tilbakemelding om dette inne på
                        innloggede sider.
                    </List.Item>
                    <List.Item>
                        Om du søker om pengestøtte fra NAV vil du få mer informasjon om hva NAV krever av deg dersom du
                        får denne innvilget.
                    </List.Item>
                    <List.Item>
                        I den perioden du ønsker å være registrert som arbeidssøker hos NAV er det viktig at du leverer
                        meldekort.
                    </List.Item>
                    <List.Item>
                        Hvis det skjer endringer i livet ditt som påvirker din status som arbeidssøker må du ta kontakt
                        med NAV. Da gjør vi en ny vurdering av ditt behov.
                    </List.Item>
                </List>
                <List as="ul" title="For å komme deg raskest mulig tilbake i jobb anbefaler vi også at:">
                    <List.Item>du oppdaterer CVen din</List.Item>
                    <List.Item>holder deg oppdatert på arbeidsmarkedet innenfor ditt felt</List.Item>
                </List>
            </Box>
        </div>
    );
};

export default NyeRettigheterKvittering;
