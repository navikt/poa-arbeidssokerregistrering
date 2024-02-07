import { Box, List } from '@navikt/ds-react';

import useSprak from '../hooks/useSprak';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

const TEKSTER: Tekster<string> = {
    nb: {
        veienVidere:
            'Vi vurderer nå de opplysningene du har gitt oss opp mot de opplysningene vi har om andre arbeidssøkere i omtrent samme situasjon som deg. På bakgrunn av dette vil en veileder fatte et vedtak som sendes til deg. Vedtaket forteller hvordan NAV vurderer din situasjon i arbeidsmarkedet og hvilken hjelp du skal få fra NAV.',
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
};

const NyeRettigheterKvittering = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    return (
        <Box padding="6" className="mb-12">
            <List as="ul">
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
