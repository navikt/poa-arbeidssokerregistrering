import { BodyLong, GuidePanel, Heading } from '@navikt/ds-react';
import Head from 'next/head';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../../hooks/useSprak';
import OppsummeringSvg from './oppsummering-svg';
import { SkjemaState } from '../../../model/skjema';
import FullforRegistreringKnappNyInngang from '../fullfor-registrering-knapp-ny-inngang';
import SvarTabell from './SvarTabell';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Gjennomgang av opplysninger',
        header: 'Er opplysningene riktige?',
        ingress: 'Her er opplysningene vi har registrert om deg.',
        fullfoerRegistrering: 'Fullfør registrering som arbeidssøker',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Stemmer opplysningane',
        header: 'Stemmer opplysningane?',
        ingress: 'Her er opplysningane vi har registrert om deg.',
        fullfoerRegistrering: 'Fullfør registreringa som arbeidssøkjar',
    },
    en: {
        sideTittel: 'Register as a Job Seeker: Is the information correct?',
        header: 'Is the information correct?',
        ingress: 'Here is the information we have registered about you.',
        fullfoerRegistrering: 'Complete jobseeker registration',
    },
};

interface OppsummeringProps {
    skjemaState: SkjemaState;
    skjemaPrefix: '/opplysninger/' | '/oppdater-opplysninger/';
    onSubmit(): void;
}

const OppsummeringUtenPlikter = (props: OppsummeringProps) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    const { skjemaState, skjemaPrefix, onSubmit } = props;

    const onValiderSkjema = () => {
        return true;
    };

    return (
        <>
            <Head>
                <title>{tekst('sideTittel')}</title>
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
            <div className="mt-12">
                <FullforRegistreringKnappNyInngang
                    skjemaState={skjemaState}
                    onSubmit={onSubmit}
                    onValiderSkjema={onValiderSkjema}
                    tekst={tekst}
                />
            </div>
        </>
    );
};

export default OppsummeringUtenPlikter;
