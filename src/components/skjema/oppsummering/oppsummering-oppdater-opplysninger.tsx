import { SkjemaState } from '../../../model/skjema';
import useSprak from '../../../hooks/useSprak';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSWR from 'swr';
import { fetcher as api } from '../../../lib/api-utils';
import { useFeatureToggles } from '../../../contexts/featuretoggle-context';
import Head from 'next/head';
import { GuidePanel, Heading, Ingress } from '@navikt/ds-react';
import OppsummeringSvg from './oppsummering-svg';
import SvarTabell from './SvarTabell';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Oppdater opplysninger',
        header: 'Oppdater opplysninger',
        ingress: 'Her er opplysningene vi har registrert om deg.',
        fullfoerRegistrering: 'Endre opplysninger',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Oppdater opplysningar',
        header: 'Oppdater opplysningar?',
        ingress: 'Her er opplysningane vi har registrert om deg.',
        fullfoerRegistrering: 'Endre opplysningar',
    },
    en: {
        sideTittel: 'Register as a Job Seeker: Is the information correct?',
        header: 'Is the information correct?',
        ingress: 'Here is the information we have registered about you.',
        fullfoerRegistrering: 'Complete jobseeker registration',
    },
};

interface Props {
    skjemaState: SkjemaState;
    skjemaPrefix: '/oppdater-opplysninger/';
    onSubmit(): void;
}

const OppsummeringOppdaterOpplysninger = (props: Props) => {
    const { skjemaState, skjemaPrefix } = props;
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    // const onValiderSkjema = () => {
    //     return true;
    // };

    return (
        <>
            <Head>
                <title>{tekst('sideTittel')}</title>
            </Head>
            <Heading size={'medium'} level="1" spacing>
                {tekst('header')}
            </Heading>
            <Ingress className="mb-6">{tekst('ingress')}</Ingress>
            <GuidePanel poster illustration={<OppsummeringSvg />}>
                <SvarTabell skjemaState={skjemaState} skjemaPrefix={skjemaPrefix} />
            </GuidePanel>
            <div className="mt-12">Knapp</div>
        </>
    );
};

export default OppsummeringOppdaterOpplysninger;
