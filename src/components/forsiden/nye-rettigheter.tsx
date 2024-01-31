import NextLink from 'next/link';
import { GuidePanel, Heading, Link, BodyShort, BodyLong, Box, List, ReadMore, Button } from '@navikt/ds-react';

import useSprak from '../../hooks/useSprak';

import { loggAktivitet } from '../../lib/amplitude';
import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';
import DineOpplysninger from './dine-opplysninger';

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

const NyeRettigheterPanel = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    const logStartHandler = () => {
        loggAktivitet({ aktivitet: 'Går til start registrering' });
    };

    return (
        <div>
            <GuidePanel poster>
                <Heading size={'large'} level={'2'} className="text-center">
                    {tekst('tittel')}
                </Heading>
                <ul className="list-disc px-8 mt-4">
                    <li>
                        <BodyShort spacing>
                            Du har rett til å registrere deg som arbeidssøker hos NAV hvis du oppfyller forutsetningene
                            gitt i{' '}
                            <Link target="_blank" href="https://lovdata.no/lov/2004-12-10-76/§10">
                                arbeidsmarkedslovens §10
                            </Link>
                        </BodyShort>
                    </li>
                    <li>
                        <BodyShort spacing>
                            Du har krav på at NAV vurderer behovet ditt for veiledning med mål om å komme tilbake i
                            arbeid. Du kan lese mer om dette i{' '}
                            <Link
                                target="_blank"
                                href="https://lovdata.no/dokument/NL/lov/2006-06-16-20/KAPITTEL_3#%C2%A714a"
                            >
                                NAV-loven §14a
                            </Link>{' '}
                            på lovdata.no
                        </BodyShort>
                    </li>
                    <li>
                        <BodyShort spacing>
                            Du kan søke om dagpenger eller andre ytelser når du har registrert deg som arbeidssøker
                        </BodyShort>
                    </li>
                </ul>
            </GuidePanel>
            <Box className="mt-12 pl-12 pr-12">
                <Heading size={'medium'} level={'2'} className="text-center">
                    Hva skjer etter at du har registrert deg?
                </Heading>
                <List as="ul">
                    <List.Item>
                        Etter at du har registrert deg vil opplysningene du har gitt om utdanning, livssituasjon og
                        tidligere arbeidsforhold bli brukt til å vurdere hvilken hjelp du skal få fra NAV. Vi vurderer
                        de opplysningene du har gitt oss opp mot de opplysningene vi har om andre arbeidssøkere i
                        omtrent samme situasjon som deg. På bakgrunn av dette vil en veileder fatte et vedtak som sendes
                        til deg. Vedtaket forteller hvordan NAV vurderer din situasjon i arbeidsmarkedet.
                    </List.Item>
                    <List.Item>
                        Dersom du er uenig i NAV sin vurdering, har du mulighet til å gi tilbakemelding om dette inne på
                        innloggede sider.
                    </List.Item>
                    <List.Item>
                        Avhengig av hvilken hjelp og ytelser du har krav på kan du få ulike plikter som NAV forventer at
                        du følger opp.
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
            </Box>
            <div className="pl-12 pr-12">
                <ReadMore header="Hvilke opplysninger henter vi inn og hva brukes de til?">
                    <DineOpplysninger />
                </ReadMore>
            </div>
            <div className="mt-12 flex items-center justify-center">
                <NextLink href="/start" passHref locale={false}>
                    <Button onClick={() => logStartHandler()}>{tekst('startRegistrering')}</Button>
                </NextLink>
            </div>
            <div className="text-center p-6 mt-6">
                <Heading size={'medium'} level="3" spacing={true}>
                    {tekst('elektroniskId')}
                </Heading>
                <BodyLong style={{ maxWidth: '22em', display: 'inline-block' }}>{tekst('elektroniskIdInfo')}</BodyLong>
            </div>
        </div>
    );
};

export default NyeRettigheterPanel;
