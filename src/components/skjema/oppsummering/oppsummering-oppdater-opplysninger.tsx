import Head from 'next/head';
import { BodyLong } from '@navikt/ds-react';

import useSprak from '../../../hooks/useSprak';

import { SkjemaState } from '../../../model/skjema';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import SvarOppsummering from './SvarOppsummering';
import OppdaterOpplysningerKnapp from '../oppdater-opplysninger-knapp';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Oppdater opplysninger',
        header: 'Oppdater opplysninger',
        ingress: 'Her er opplysningene vi har registrert om deg.',
        fullfoerRegistrering: 'Oppdater opplysninger',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Oppdater opplysningar',
        header: 'Oppdater opplysningar?',
        ingress: 'Her er opplysningane vi har registrert om deg.',
        fullfoerRegistrering: 'Oppdater opplysningar',
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
    const { skjemaState, skjemaPrefix, onSubmit } = props;
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

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
            <OppdaterOpplysningerKnapp
                skjemaState={skjemaState}
                onSubmit={onSubmit}
                onValiderSkjema={onValiderSkjema}
                tekst={tekst}
            />
        </>
    );
};

export default OppsummeringOppdaterOpplysninger;
