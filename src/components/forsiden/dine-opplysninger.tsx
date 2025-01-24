import { BodyLong, Heading, Link, ReadMore } from '@navikt/ds-react';

import useSprak from '../../hooks/useSprak';

import { loggAktivitet } from '../../lib/amplitude';
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
    nn: {
        tittel: 'Dine opplysningar',
        innledning:
            'Når du registrerer deg som arbeidssøkjar, vil NAV vurdere opplysningane dine og foreslå ei oppfølging. For at vi skal kunne danne oss eit bilete av tenestene du treng, må vi ha opplysningar om',
        alder: 'alderen din',
        jobb: 'du har vore i arbeid før',
        utdanning: 'utdanninga di',
        utfordringer: 'eventuelle utfordringar',
        beskrivelse1: `Opplysningane du har gitt oss, vil bli vurderte opp mot opplysningane vi har om andre arbeidssøkjarar som er i omtrent same situasjon som deg. På bakgrunn av dette blir det utarbeidd eit automatisk forslag til tenester som kan passe for deg. Ein rettleiar vurderer forslaget og sender deg eit vedtak.`,
        beskrivelse2: `Dersom det skjer endringar som gjer at opplysningane du er registrert med hos oss, ikkje lenger stemmer, kan du kontakte oss på nav.no. Vi gjer då ei ny vurdering av behovet ditt for tenester. Dersom du er usamd i oppfølginga vi foreslår, kan du logge på og gi tilbakemelding om dette.`,
        bistandsbehovOverskrift: 'Kvifor vurderer NAV behovet mitt for bistand?',
        bistandsbehovInnhold: `Alle personar med lovleg opphald i Noreg har rett til å bli registrerte som arbeidssøkjarar. Dette går fram av arbeidsmarknadslova § 10. Når du kontaktar NAV som arbeidssøkjar, har du også rett til å få vurdert bistanden du treng for å kome i arbeid. Dette går fram av NAV-lova § 14 a. Etter NAV-lova § 4 har NAV dessutan plikt til å hjelpe deg som arbeidssøkjar med å kome i jobb.`,
        personopplysningerOverskrift: 'Behandling av personopplysningane mine',
        personopplysningerLenkeTekst: `Les mer om hvordan NAV behandler personopplysninger`,
        lovligOpphold:
            'Alle personar med lovleg opphald i Noreg har rett til å bli registrerte som arbeidssøkjarar. Dette går fram av',
        aml10: 'arbeidsmarknadslova § 10',
        vurdertBistandsbehov:
            'Når du kontaktar NAV som arbeidssøkjar, har du også rett til å få vurdert bistanden du treng for å kome i arbeid. Dette går fram av',
        nav14a: 'NAV-lova § 14 a',
        navogsa: 'Etter',
        nav4: 'NAV-lova § 4',
        navForpliktet: 'har NAV dessutan plikt til å hjelpe deg som arbeidssøkjar med å kome i jobb.',
        registreringOgBehovsvurdering:
            'Når du registrerer deg som arbeidssøkjar, ber vi deg om ulike opplysningar for å kunne tilby oppfølging tilpassa situasjonen din og behova du har. Vi bruker opplysningane til å gjere behovsvurderinga som NAV-lova § 14 a',
        tilpassetInformasjon:
            'pålegg oss å utføre. Hensikta er å hjelpe rettleiarane hos NAV å gjere ei korrekt vurdering av bistandsbehovet, slik at vi kan tilby oppfølging og informasjon tilpassa situasjonen din.',
    },
    en: {
        tittel: 'Your information ',
        innledning:
            'When you register as a jobseeker, NAV assesses the information you provide and suggests a follow-up plan for you. To assess what kind of services you need, we need information about',
        alder: 'your age',
        jobb: 'if you have been working',
        utdanning: 'your education',
        utfordringer: 'any challenges you might have',
        beskrivelse1:
            'We will evaluate the information you have given us against the information we have about other jobseekers who are in a similar situation as you. Based on this, automatic suggestions are compiled about which services we think may suit you. A NAV counsellor will review these suggestions and send you a decision.',
        beskrivelse2:
            "If there are changes that mean that the information you have given us is no longer correct, please contact us online: nav.no. We will then re-assess your need for services. If you disagree with NAV's assessment of the need for follow-up, you have the opportunity to respond to us about the matter by logging on to nav.no.",
        bistandsbehovOverskrift: 'Why does NAV assess my need for assistance?',
        bistandsbehovInnhold:
            'All persons lawfully residing in Norway are entitled to be registered as jobseekers. This is stated in Section 10 of the Labour Market Act. When you contact NAV as a jobseeker, you also have a right to have your need for assistance assessed as a means to find employment. This is stated in Section 14a of the NAV Act. Pursuant to Section 4 of the NAV Act, NAV is also obligated to assist you as a jobseeker in getting a job.',
        personopplysningerOverskrift: 'Processing my personal data',
        personopplysningerLenkeTekst: 'Read more about how NAV processes personal data ',
        lovligOpphold:
            'All persons lawfully residing in Norway are entitled to be registered as jobseekers. This is stated in',
        aml10: 'Section 10 of the Labour Market Act',
        vurdertBistandsbehov:
            'When you contact NAV as a jobseeker, you also have a right to have your need for assistance assessed as a means to find employment. This is stated in',
        nav14a: 'Section 14a of the NAV Act.',
        navogsa: 'Pursuant to',
        nav4: 'Section 4 of the NAV Act,',
        navForpliktet: 'NAV is also obligated to assist you as a jobseeker in getting a job.',
        registreringOgBehovsvurdering:
            'When you register as a jobseeker, we will ask for information from you in order to offer help that is suited to your situation and needs. We use the information to assess your needs, which we are obligated to do pursuant to ',
        tilpassetInformasjon:
            "The purpose here is to provide NAV's counsellors with support in making decisions about your rights and need for assistance so we can offer help and give you correct information suited to your situation.",
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
            </ReadMore>
        </>
    );
};

export default DineOpplysninger;
