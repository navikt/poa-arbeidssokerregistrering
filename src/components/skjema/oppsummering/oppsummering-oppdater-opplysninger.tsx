import { lagHentTekstForSprak, type Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { BodyLong } from '@navikt/ds-react';
import Head from 'next/head';
import useSprak from '../../../hooks/useSprak';
import type { SkjemaState } from '../../../model/skjema';
import OppdaterOpplysningerKnapp from '../oppdater-opplysninger-knapp';
import SvarOppsummering from './SvarOppsummering';

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
