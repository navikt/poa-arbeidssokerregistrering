import { BodyLong, Heading, Link, ReadMore } from '@navikt/ds-react';

import useSprak from '../../hooks/useSprak';

import { loggAktivitet } from '../../lib/amplitude';
import Feedback from '../feedback/feedback';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Dine opplysninger',
        innledning:
            'Når du registrerer deg som arbeidssøker vurderer NAV opplysningene dine og foreslår oppfølging for deg. For å vurdere hva slags tjenester du trenger må vi ha opplysninger om',
        alder: 'alderen din',
        jobb: 'du har vært i jobb',
        utdanning: 'utdanningen din',
        utfordringer: 'eventuelle utfordringer',
        beskrivelse1: `Vi vurderer de opplysningene du har gitt oss opp mot de opplysningene vi har om andre arbeidssøkere i omtrent samme situasjon som deg. 
            På bakgrunn av dette blir det laget et automatisk forslag til hvilke tjenester vi tror kan passe deg. En veileder vurderer forslaget og sender deg et vedtak.`,
        beskrivelse2: `Hvis det skjer endringer som gjør at opplysningene du har gitt oss ikke er riktige lenger, kan du ta kontakt med oss på nav.no. 
        Da gjør vi en ny vurdering av ditt behov for tjenester. 
        Dersom du er uenig i det oppfølgingsbehovet vi foreslår, har du mulighet til å gi tilbakemelding om dette inne på innloggede sider.`,
        bistandsbehovOverskrift: 'Hvorfor vurderer NAV mitt bistandsbehov?',
        bistandsbehovInnhold: `Alle personer med lovlig opphold i Norge har rett til å bli registrert som arbeidssøkere. Dette går frem av arbeidsmarkedsloven § 10.  
        Når du henvender deg til NAV som arbeidssøker har du også en rett til å få vurdert ditt bistandsbehov for å komme i arbeid. 
        Dette går frem av NAV-loven § 14 a. NAV er også etter NAV-loven § 4 forpliktet til å bistå deg som arbeidssøker med å komme i jobb.`,
        personopplysningerOverskrift: 'Behandling av mine personopplysninger',
        personopplysningerInnhold: `Når du registrerer deg som arbeidssøker ber vi om opplysninger fra deg for å kunne tilby oppfølging tilpasset din situasjon og dine behov. 
        Opplysningene bruker vi til en behovsvurdering som vi etter <a href="https://lovdata.no/dokument/NL/lov/2006-06-16-20/KAPITTEL_3#%C2%A714a">NAV-loven § 14 a</a> er pålagt å utføre. 
        Formålet er å gi NAVs veiledere støtte til å treffe vedtak om riktig bistandsbehov slik at vi kan tilby oppfølging og informasjon tilpasset din situasjon.`,
        personopplysningerLenkeTekst: `Les mer om hvordan NAV behandler personopplysninger`,
        lovligOpphold:
            'Alle personer med lovlig opphold i Norge har rett til å bli registrert som arbeidssøkere. Dette går frem av',
        aml10: 'arbeidsmarkedsloven § 10',
        vurdertBistandsbehov:
            'Når du henvender deg til NAV som arbeidssøker har du også en rett til å få vurdert ditt bistandsbehov for å komme i arbeid. Dette går frem av',
        nav14a: 'NAV-loven § 14 a',
        navogsa: 'NAV er også etter',
        nav4: 'NAV-loven § 4',
        navForpliktet: 'forpliktet til å bistå deg som arbeidssøker med å komme i jobb.',
        registreringOgBehovsvurdering:
            'Når du registrerer deg som arbeidssøker ber vi om opplysninger fra deg for å kunne tilby oppfølging tilpasset din situasjon og dine behov. Opplysningene bruker vi til en behovsvurdering som vi etter',
        tilpassetInformasjon:
            'er pålagt å utføre. Formålet er å gi NAVs veiledere støtte til å treffe vedtak om riktig bistandsbehov slik at vi kan tilby oppfølging og informasjon tilpasset din situasjon.',
    },
};

const DineOpplysninger = () => {
    // eslint-disable-next-line
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    return (
        <>
            <Heading size={'large'} level="2" className="text-center mb-6">
                {tekst('tittel')}
            </Heading>
            <BodyLong>{tekst('innledning')}</BodyLong>
            <div>
                <ul className="list-disc px-8 my-4">
                    <li>{tekst('alder')}</li>
                    <li>{tekst('jobb')}</li>
                    <li>{tekst('utdanning')}</li>
                    <li>{tekst('utfordringer')}</li>
                </ul>
            </div>
            <BodyLong className="mb-6">{tekst('beskrivelse1')}</BodyLong>
            <BodyLong className="mb-6">{tekst('beskrivelse2')}</BodyLong>
            <ReadMore
                header={tekst('bistandsbehovOverskrift')}
                className="mb-4"
                onClick={() =>
                    loggAktivitet({
                        aktivitet: 'Åpner bistandsbehov',
                    })
                }
            >
                <BodyLong className="mb-4">
                    {tekst('lovligOpphold')}{' '}
                    <Link
                        href="https://lovdata.no/lov/2004-12-10-76/§10"
                        target="_blank"
                        onClick={() =>
                            loggAktivitet({
                                aktivitet: 'Går til lovdata',
                            })
                        }
                    >
                        {tekst('aml10')}
                    </Link>
                    . {tekst('vurdertBistandsbehov')}{' '}
                    <Link
                        href="https://lovdata.no/lov/2006-06-16-20/§14a"
                        target="_blank"
                        onClick={() =>
                            loggAktivitet({
                                aktivitet: 'Går til lovdata',
                            })
                        }
                    >
                        {tekst('nav14a')}
                    </Link>
                    . {tekst('navogsa')}{' '}
                    <Link
                        href="https://lovdata.no/lov/2006-06-16-20/§4"
                        target="_blank"
                        onClick={() =>
                            loggAktivitet({
                                aktivitet: 'Går til lovdata',
                            })
                        }
                    >
                        {tekst('nav4')}
                    </Link>{' '}
                    {tekst('navForpliktet')}
                </BodyLong>
                <Feedback id={'bistandsbehov'}></Feedback>
            </ReadMore>
            <ReadMore
                header={tekst('personopplysningerOverskrift')}
                onClick={() =>
                    loggAktivitet({
                        aktivitet: 'Åpner personopplysninger',
                    })
                }
            >
                <BodyLong className="mb-4">
                    {tekst('registreringOgBehovsvurdering')}{' '}
                    <Link
                        href="https://lovdata.no/lov/2006-06-16-20/§14a"
                        target="_blank"
                        onClick={() =>
                            loggAktivitet({
                                aktivitet: 'Går til lovdata',
                            })
                        }
                    >
                        {tekst('nav14a')}
                    </Link>{' '}
                    {tekst('tilpassetInformasjon')}
                </BodyLong>
                <Link
                    target="_blank"
                    href="https://www.nav.no/personvern"
                    onClick={() =>
                        loggAktivitet({
                            aktivitet: 'Går til personvernsiden',
                        })
                    }
                >
                    {tekst('personopplysningerLenkeTekst')}
                </Link>
                <Feedback id={'personopplysninger'}></Feedback>
            </ReadMore>
        </>
    );
};

export default DineOpplysninger;
