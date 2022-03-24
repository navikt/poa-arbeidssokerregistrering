import lagHentTekstForSprak, { Tekster } from '../lib/lag-hent-tekst-for-sprak';
import useSprak from '../hooks/useSprak';
import { BodyShort, Button, ContentContainer, GuidePanel, Heading } from '@navikt/ds-react';
import { fetcher as api } from '../lib/api-utils';
import { useRouter } from 'next/router';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Du er ikke lenger registrert som arbeidssøker',
        maaSokePaaNytt:
            'Hvis du fortsatt skal motta ytelser må du først bekrefte at du ønsker å være registrert, så søke på nytt.',
        vilDuRegistreres: 'Ønsker du å være registrert som arbeidssøker?',
        ja: 'Ja',
        avbryt: 'Avbryt',
    },
};

const Reaktivering = () => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const router = useRouter();

    const reaktiverBruker = async () => {
        try {
            await api('/api/reaktivering', { method: 'post', body: JSON.stringify({}) });
            return router.push('/kvittering-reaktivering');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ContentContainer>
            <Heading spacing level="1" size={'medium'}>
                {tekst('tittel')}
            </Heading>
            <GuidePanel>{tekst('maaSokePaaNytt')}</GuidePanel>
            <BodyShort>{tekst('vilDuRegistreres')}</BodyShort>
            <Button onClick={reaktiverBruker}>{tekst('ja')}</Button>
            <Button variant={'tertiary'}>{tekst('avbryt')}</Button>
        </ContentContainer>
    );
};

export default Reaktivering;