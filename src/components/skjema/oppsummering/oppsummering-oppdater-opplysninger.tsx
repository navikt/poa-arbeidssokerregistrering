import { lagHentTekstForSprak, type Sprak, type Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { BodyLong } from '@navikt/ds-react';
import Head from 'next/head';
import { useConfig } from '@/contexts/config-context';
import type { Config } from '@/model/config';
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

const tilSprakSensitivUrl = (url: string, sprak: Sprak) => {
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
    return `${url}${sprakUrl}`;
};

const OppsummeringOppdaterOpplysninger = (props: Props) => {
    const { skjemaState, skjemaPrefix, onSubmit } = props;
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const { arbeidssoekerregisteretUrl } = useConfig() as Config;

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
                arbeidssoekerregisteretUrl={tilSprakSensitivUrl(arbeidssoekerregisteretUrl, sprak)}
            />
        </>
    );
};

export default OppsummeringOppdaterOpplysninger;
