import { GuidePanel, Heading, Link, BodyShort, Box, List } from '@navikt/ds-react';

import useSprak from '../../hooks/useSprak';

import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Rettigheter',
        kravPaVurdering:
            'Du har krav på at NAV vurderer behovet ditt for veiledning. Dette er en rettighet du har etter ',
        paragraf14a: 'NAV-loven § 14a. (les paragrafen på lovdata.no)',
        brev: 'Du får et brev der du kan lese mer om tjenestene vi foreslår for deg.',
    },
};

const NyeRettigheterPanel = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    return (
        <>
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
            <Box className="mt-12">
                <Heading size={'large'} level={'2'} className="text-center">
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
        </>
    );
};

export default NyeRettigheterPanel;
