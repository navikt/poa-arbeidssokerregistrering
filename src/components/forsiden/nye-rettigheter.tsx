import NextLink from 'next/link';
import { GuidePanel, Heading, Link, BodyShort, BodyLong, Box, List, ReadMore, Button } from '@navikt/ds-react';

import useSprak from '../../hooks/useSprak';
import { useFeatureToggles } from '../../contexts/featuretoggle-context';

import { loggAktivitet } from '../../lib/amplitude';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import DineOpplysninger from './dine-opplysninger';
import ElektroniskID from './elektroniskID';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Rettigheter',
        startRegistrering: 'Start registrering',
        elektroniskId: 'Du må ha elektronisk ID for å registrere deg',
        elektroniskIdInfo: 'For å registrere deg hos NAV, må du logge inn med BankID, Buypass eller Commfides.',
        duHarRettTil:
            'Du har rett til å registrere deg som arbeidssøker hos NAV hvis du oppfyller forutsetningene gitt i',
        aml10: 'arbeidsmarkedslovens §10',
        duHarKravPaa:
            'Du har krav på at NAV vurderer behovet ditt for veiledning med mål om å komme tilbake i arbeid. Du kan lese mer om dette i',
        nav14a: 'NAV-loven §14a',
        lovdata: 'på lovdata.no',
        ytelser: 'Du kan søke om dagpenger eller andre ytelser når du har registrert deg som arbeidssøker',
        etterRegistrering: 'Hva skjer etter at du har registrert deg?',
        brukAvOpplysninger:
            'Etter at du har registrert deg vil opplysningene du har gitt om utdanning, livssituasjon og tidligere arbeidsforhold bli brukt til å vurdere hvilken hjelp du skal få fra NAV. Vi vurderer de opplysningene du har gitt oss opp mot de opplysningene vi har om andre arbeidssøkere i omtrent samme situasjon som deg. På bakgrunn av dette vil en veileder fatte et vedtak som sendes til deg. Vedtaket forteller hvordan NAV vurderer din situasjon i arbeidsmarkedet.',
        uenigIvurdering:
            'Dersom du er uenig i NAV sin vurdering, har du mulighet til å gi tilbakemelding om dette inne på innloggede sider.',
        muligePlikter:
            'Avhengig av hvilken hjelp og ytelser du har krav på kan du få ulike plikter som NAV forventer at du følger opp.',
        meldekort:
            'I den perioden du ønsker å være registrert som arbeidssøker hos NAV er det viktig at du leverer meldekort.',
        endringerIsituasjon:
            'Hvis det skjer endringer i livet ditt som påvirker din status som arbeidssøker må du ta kontakt med NAV. Da gjør vi en ny vurdering av ditt behov.',
        dineOpplysninger: 'Hvilke opplysninger henter vi inn og hva brukes de til?',
    },
    nn: {
        tittel: 'Rettar',
        startRegistrering: 'Start registrering',
        elektroniskId: 'Du må ha elektronisk ID for å registrere deg',
        elektroniskIdInfo: 'For å registrere deg hos NAV må du logge inn med BankID, Buypass eller Commfides.',
        duHarRettTil: 'Du har rett til å registrere deg som arbeidssøkjar hos NAV dersom du oppfyller føresetnadene i',
        aml10: 'arbeidsmarknadslova §10',
        duHarKravPaa:
            'Du har krav på at NAV vurderer behovet ditt for rettleiing med mål om å kome tilbake i arbeid. Du kan lese meir om dette i',
        nav14a: 'NAV-lova §14a',
        lovdata: 'på lovdata.no',
        ytelser: 'Du kan søkje om dagpengar eller andre ytingar når du har registrert deg som arbeidssøkjar',
        etterRegistrering: 'Kva skjer etter at du har registrert deg?',
        brukAvOpplysninger:
            'Etter at du har registrert deg, vil opplysningane du har gitt om utdanning, livssituasjon og tidlegare arbeidsforhold, bli brukte til å slå fast kva hjelp du skal få frå NAV. Opplysningane du har gitt oss, vil bli vurderte opp mot opplysningane vi har om andre arbeidssøkjarar som er i omtrent same situasjon som deg. Ein rettleiar vil på grunnlag av dette fatte eit vedtak som blir sendt til deg. Vedtaket seier noko om korleis NAV ser på situasjonen din på arbeidsmarknaden.',
        uenigIvurdering:
            'Dersom du er usamd i vurderinga som NAV har gjort, kan du logge på og gi tilbakemelding om dette.',
        muligePlikter:
            'Avhengig av hjelpa og ytingane du har krav på, kan du få ulike plikter som NAV forventar at du følgjer opp.',
        meldekort:
            'I den perioden du ønskjer å vere registrert som arbeidssøkjar hos NAV, er det viktig at du leverer meldekort.',
        endringerIsituasjon:
            'Dersom det skjer endringar i livet ditt som påverkar statusen din som arbeidssøkjar, må du ta kontakt med NAV. Vi gjer då ei ny vurdering av behovet ditt.',
        dineOpplysninger: 'Kva opplysningar hentar vi inn, og kva bruker vi dei til?',
    },
    en: {
        tittel: 'Your Rights ',
        startRegistrering: 'Start registration',
        elektroniskId: 'You must have an electronic ID to register',
        elektroniskIdInfo: 'To register with NAV, you must log in using BankID, Buypass or Commfides.',
        duHarRettTil: 'You have the right to register as a jobseeker with NAV if you meet the conditions stipulated in',
        aml10: 'Section 10 of the Labour Market Act',
        duHarKravPaa:
            'You are entitled to have NAV assess your need for guidance with the aim of returning to work. You can read more about this in',
        nav14a: 'Section 14a of the NAV Act',
        lovdata: 'online at lovdata.no',
        ytelser: 'You can apply for unemployment benefits or other benefits once you have registered as a jobseeker.',
        etterRegistrering: 'What happens after you register?',
        brukAvOpplysninger:
            'After signing up, the information you provide about your education, life situation and previous employment will be used to assess what help you can receive from NAV. We will evaluate the information you have given us against the information we have about other jobseekers who are in a similar situation as you. A NAV counsellor will review your situation and come to a decision. You will then be informed of the decision in a letter. The decision explains how NAV assessed your situation within the labour market.',
        uenigIvurdering:
            "If you disagree with NAV's assessment, you have the opportunity to respond to us about the matter by logging on to nav.no.",
        muligePlikter:
            'Depending on what help and benefits you are entitled to, you may be assigned different duties that NAV expects you to follow up.',
        meldekort:
            'During the period you wish to be registered as a jobseeker with NAV, it is important that you regularly submit the Employment Status Form.',
        endringerIsituasjon:
            'You must contact NAV if you experience changes in your life that affect your status as a jobseeker. We will then re-assess your needs.',
        dineOpplysninger: 'What information do we collect, and what is it used for?',
    },
};

function EkstraPlikter() {
    return (
        <BodyLong spacing className="max-w-3xl">
            Registrer deg som arbeidssøker hvis har som mål om å komme i arbeid og vil gjøre aktiviteter alene, eller i
            samhandling med NAV, som bidrar til dette.
        </BodyLong>
    );
}

const NyeRettigheterPanel = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { toggles } = useFeatureToggles();
    const ekstraPlikterToggletPaa = toggles['arbeidssokerregistrering.bruk-nye-plikter'];

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
                            {tekst('duHarRettTil')}{' '}
                            <Link target="_blank" href="https://lovdata.no/lov/2004-12-10-76/§10">
                                {tekst('aml10')}
                            </Link>
                        </BodyShort>
                    </li>
                    <li>
                        <BodyShort spacing>
                            {tekst('duHarKravPaa')}{' '}
                            <Link
                                target="_blank"
                                href="https://lovdata.no/dokument/NL/lov/2006-06-16-20/KAPITTEL_3#%C2%A714a"
                            >
                                {tekst('nav14a')}
                            </Link>{' '}
                            {tekst('lovdata')}
                        </BodyShort>
                    </li>
                    <li>
                        <BodyShort spacing>{tekst('ytelser')}</BodyShort>
                    </li>
                </ul>
            </GuidePanel>
            <Box className="mt-12 pl-12 pr-12">
                <Heading size={'medium'} level={'2'} className="text-center">
                    {tekst('etterRegistrering')}
                </Heading>
                <List as="ul">
                    <List.Item>{tekst('brukAvOpplysninger')}</List.Item>
                    <List.Item>{tekst('uenigIvurdering')}</List.Item>
                    <List.Item>{tekst('muligePlikter')}</List.Item>
                    <List.Item>{tekst('meldekort')}</List.Item>
                    <List.Item>{tekst('endringerIsituasjon')}</List.Item>
                </List>
            </Box>
            <div className="pl-12 pr-12">
                <ReadMore header={tekst('dineOpplysninger')}>
                    <DineOpplysninger />
                </ReadMore>
            </div>
            <div className="mt-12 flex flex-col items-center justify-center">
                {ekstraPlikterToggletPaa && <EkstraPlikter />}
                <NextLink href="/start" passHref>
                    <Button onClick={() => logStartHandler()}>{tekst('startRegistrering')}</Button>
                </NextLink>
            </div>
            <div className="text-center p-6 mt-6">
                <Heading size={'medium'} level="3" spacing={true}>
                    {tekst('elektroniskId')}
                </Heading>
                <BodyLong style={{ maxWidth: '22em', display: 'inline-block' }}>{tekst('elektroniskIdInfo')}</BodyLong>
            </div>
            <ElektroniskID />
        </div>
    );
};

export default NyeRettigheterPanel;
