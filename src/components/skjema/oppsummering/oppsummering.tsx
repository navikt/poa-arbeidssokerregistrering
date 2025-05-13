import { BodyLong, Heading, HGrid } from '@navikt/ds-react';
import Image from 'next/image';
import Head from 'next/head';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import OppsummeringIkonSvg from '../../skjema-ikon.svg';

import useSprak from '../../../hooks/useSprak';

import { SkjemaState } from '../../../model/skjema';
import FullforRegistreringKnappNyInngang from '../fullfor-registrering-knapp-ny-inngang';
import SvarTabell from './SvarOppsummering';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Er alle opplysningene dine riktige?',
        header: 'Er alle opplysningene dine riktige?',
        ingress: 'Her er opplysningene vi har registrert om deg.',
        fullfoerRegistrering: 'Fullfør registrering som arbeidssøker',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Er alle opplysningane dine rette?',
        header: 'Er alle opplysningane dine rette?',
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
            <div className="max-w-4xl">
                <HGrid columns={{ sm: 1, md: 1, lg: '1fr auto', xl: '1fr auto' }} gap={{ lg: 'space-24' }}>
                    <div style={{ width: '96px', height: '96px' }}>
                        <Image src={OppsummeringIkonSvg} alt="ikon" width={96} height={96} />
                    </div>
                    <div className="w-full">
                        <Heading size={'xlarge'} level="1" spacing>
                            {tekst('header')}
                        </Heading>
                        <BodyLong size={'large'} className="mb-6">
                            {tekst('ingress')}
                        </BodyLong>

                        <SvarTabell skjemaState={skjemaState} skjemaPrefix={skjemaPrefix} />
                    </div>
                </HGrid>
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

export default Oppsummering;
