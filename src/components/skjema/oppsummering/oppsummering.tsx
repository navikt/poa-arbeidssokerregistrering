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
    },
};

interface OppsummeringProps {
    skjemaState: SkjemaState;
    skjemaPrefix: '/skjema/' | '/opplysninger/';
}

const Oppsummering = ({ skjemaState, skjemaPrefix }: OppsummeringProps) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

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
                <SvarTabell skjemaState={skjemaState} skjemaPrefix={skjemaPrefix} />
            </GuidePanel>
        </>
    );
};

export default Oppsummering;
