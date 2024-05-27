import { BodyLong, GuidePanel, Heading } from '@navikt/ds-react';
import Head from 'next/head';
import useSWR from 'swr';
import OppsummeringSvg from './oppsummering-svg';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../../hooks/useSprak';
import { SkjemaState } from '../../../model/skjema';
import { fetcher } from '../../../lib/api-utils';
import SvarTabell from './SvarTabell';

const TEKSTER: Tekster<string> = {
    nb: {
        header: 'Er opplysningene riktige?',
        ingress: 'Her er opplysningene vi har registrert om deg.',
        ikkeIJobbSisteAaret: `Ifølge Arbeidsgiver- og arbeidstakerregisteret har du ikke vært i jobb i løpet av det siste året. 
             Hvis det er feil, er det likevel viktig at du fullfører registreringen. Du kan gi riktig informasjon senere til NAV.`,
        harJobbetSisteAaret:
            'Ifølge Arbeidsgiver- og arbeidstakerregisteret har du vært i jobb i løpet av det siste året. ' +
            'Hvis det er feil, er det likevel viktig at du fullfører registreringen. Du kan gi riktig informasjon senere til NAV.',
    },
};

interface OppsummeringProps {
    skjemaState: SkjemaState;
    skjemaPrefix: '/skjema/' | '/opplysninger/';
}

const Oppsummering = ({ skjemaState, skjemaPrefix }: OppsummeringProps) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const { data: startRegistreringData, error } = useSWR('/api/startregistrering', fetcher);

    return (
        <>
            <Head>
                <title>Arbeidssøkerregistrering: Gjennomgang av opplysninger</title>
            </Head>
            <Heading size={'medium'} level="1" spacing>
                {tekst('header')}
            </Heading>
            <BodyLong size={'large'} className="mb-6">
                {tekst('ingress')}
            </BodyLong>
            <GuidePanel poster illustration={<OppsummeringSvg />}>
                {skjemaPrefix === '/skjema/' && (
                    <p>
                        {startRegistreringData && startRegistreringData.jobbetSeksAvTolvSisteManeder
                            ? tekst('harJobbetSisteAaret')
                            : tekst('ikkeIJobbSisteAaret')}
                    </p>
                )}
                <SvarTabell skjemaState={skjemaState} skjemaPrefix={skjemaPrefix} />
            </GuidePanel>
        </>
    );
};

export default Oppsummering;
