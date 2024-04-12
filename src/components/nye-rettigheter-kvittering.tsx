import { Box, List } from '@navikt/ds-react';

import useSprak from '../hooks/useSprak';
import { useFeatureToggles } from '../contexts/featuretoggle-context';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

const TEKSTER: Tekster<string> = {
    nb: {
        veienVidere:
            'Vi vurderer nå de opplysningene du har gitt oss opp mot de opplysningene vi har om andre arbeidssøkere i omtrent samme situasjon som deg. På bakgrunn av dette vil en veileder fatte et oppfølgingsvedtak som sendes til deg. Oppfølgingsvedtaket forteller hvordan NAV vurderer din situasjon i arbeidsmarkedet og hvilken hjelp du skal få fra NAV.',
        uenigheter: 'Hvis du er uenig i NAV sin vurdering, kan du gi tilbakemelding om dette på innloggede sider.',
        ytelser:
            'Om du søker pengestøtte fra NAV vil du få mer informasjon om hva NAV krever av deg dersom du får denne innvilget.',
        meldekort:
            'I perioden du ønsker å være registrert som arbeidssøker hos NAV er det viktig at du leverer meldekort.',
        endringer:
            'Hvis det skjer endringer i livet ditt som påvirker din status som arbeidssøker må du ta kontakt med NAV. Da gjør vi en ny vurdering av ditt behov.',
        anbefalinger: 'For å komme deg raskest mulig tilbake i jobb anbefaler vi også at:',
        oppdaterCV: 'Du oppdaterer CVen din.',
        arbeidsmarkedet: 'Holder deg oppdatert på arbeidsmarkedet innenfor ditt felt.',
    },
    nn: {
        veienVidere:
            'Opplysningane du har gitt oss, vil no bli vurderte opp mot opplysningane vi har om andre arbeidssøkjarar som er i omtrent same situasjon som deg. Ein rettleiar vil på grunnlag av dette fatte eit vedtak som blir sendt til deg. Vedtaket seier noko om korleis NAV ser på situasjonen din på arbeidsmarknaden, og kva hjelp du skal få frå NAV.',
        uenigheter: 'Dersom du er usamd i vurderinga som NAV har gjort, kan du logge på og gi tilbakemelding om dette.',
        ytelser:
            'Viss du søkjer om pengestøtte frå NAV, vil du få meir informasjon om kva NAV krev av deg dersom søknaden blir innvilga.',
        meldekort:
            'I perioden du ønskjer å vere registrert som arbeidssøkjar hos NAV, er det viktig at du leverer meldekort.',
        endringer:
            'Dersom det skjer endringar i livet ditt som påverkar statusen din som arbeidssøkjar, må du ta kontakt med NAV. Vi gjer då ei ny vurdering av behovet ditt.',
        anbefalinger: 'For at du raskast mogleg skal kome deg tilbake i jobb, anbefaler vi i tillegg at du:',
        oppdaterCV: 'oppdaterer CV-en din',
        arbeidsmarkedet: 'held deg oppdatert på arbeidsmarknaden innanfor feltet ditt',
    },
    en: {
        veienVidere:
            'We will evaluate the information you have given us against the information we have about other jobseekers who are in a similar situation as you. A NAV counsellor will review your situation and come to a decision. You will then be informed of the decision in a letter. The decision will inform you as to how NAV assesses your situation in the labour market and what help you can receive from NAV.',
        uenigheter: "If you disagree with NAV's assessment, you can contact us about this online: nav.no.",
        ytelser:
            'If you apply for financial support from NAV, you will receive more information about what NAV requires of you if this is granted.',
        meldekort:
            'During the period you wish to be registered as a jobseeker with NAV, it is important that you regularly submit the Employment Status Form.',
        endringer:
            'You must contact NAV if you experience changes in your life that affect your status as a jobseeker. We will then re-assess your needs.',
        anbefalinger: 'To get back to work as quickly as possible, we also recommend that:',
        oppdaterCV: 'You update your CV',
        arbeidsmarkedet: 'Stay updated on the job market in your profession/field',
    },
};

function EkstraPlikter() {
    return (
        <List.Item>
            Du må fremover gjøre aktiviteter, alene eller sammen med NAV, som bidrar til at du kommer i arbeid.
        </List.Item>
    );
}

const NyeRettigheterKvittering = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { toggles } = useFeatureToggles();
    const ekstraPlikterToggletPaa = toggles['arbeidssokerregistrering.bruk-nye-plikter'];

    return (
        <Box padding="6" className="mb-12">
            <List as="ul">
                {ekstraPlikterToggletPaa && <EkstraPlikter />}
                <List.Item>{tekst('veienVidere')}</List.Item>
                <List.Item>{tekst('uenigheter')}</List.Item>
                <List.Item>{tekst('ytelser')}</List.Item>
                <List.Item>{tekst('meldekort')}</List.Item>
                <List.Item>{tekst('endringer')}</List.Item>
            </List>
            <List as="ul" description={tekst('anbefalinger')} className="mt-8">
                <List.Item>{tekst('oppdaterCV')}</List.Item>
                <List.Item>{tekst('arbeidsmarkedet')}</List.Item>
            </List>
        </Box>
    );
};

export default NyeRettigheterKvittering;
