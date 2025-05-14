import { BodyLong, Heading } from '@navikt/ds-react';
import Head from 'next/head';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../../hooks/useSprak';

import { SkjemaState } from '../../../model/skjema';
import FullforRegistreringKnappNyInngang from '../fullfor-registrering-knapp-ny-inngang';
import SvarOppsummering from './SvarOppsummering';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Er alle opplysningene dine riktige?',
        header: 'Er alle opplysningene dine riktige?',
        ingress: 'Her er opplysningene du har oppgitt. Er alle opplysningene dine riktige?',
        fullfoerRegistrering: 'Fullfør registrering som arbeidssøker',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Er alle opplysningane dine rette?',
        header: 'Er alle opplysningane dine rette?',
        ingress: 'Her er opplysningane du har gitt oss. Er alle opplysningane dine rette?',
        fullfoerRegistrering: 'Fullfør registreringa som arbeidssøkjar',
    },
    en: {
        sideTittel: 'Register as a Job Seeker: Is the information correct?',
        header: 'Is the information correct? Is the information correct?',
        ingress: 'Here is the information you have given.',
        fullfoerRegistrering: 'Complete jobseeker registration',
    },
};

interface OppsummeringProps {
    skjemaState: SkjemaState;
    skjemaPrefix: '/opplysninger/' | '/oppdater-opplysninger/';
    onSubmit(): void;
}

const Oppsummering = (props: OppsummeringProps) => {
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
            <BodyLong size={'large'} className="mb-6">
                {tekst('ingress')}
            </BodyLong>
            <SvarOppsummering skjemaState={skjemaState} skjemaPrefix={skjemaPrefix} />
            <FullforRegistreringKnappNyInngang
                skjemaState={skjemaState}
                onSubmit={onSubmit}
                onValiderSkjema={onValiderSkjema}
                tekst={tekst}
            />
        </>
    );
};

export default Oppsummering;
