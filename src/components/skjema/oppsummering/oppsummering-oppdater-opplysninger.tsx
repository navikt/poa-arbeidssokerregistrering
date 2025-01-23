import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { BodyLong, GuidePanel, Heading, Alert, Link } from '@navikt/ds-react';

import Head from 'next/head';
import { SkjemaState } from '../../../model/skjema';
import useSprak from '../../../hooks/useSprak';
import OppsummeringSvg from './oppsummering-svg';
import SvarTabell from './SvarTabell';
import OppdaterOpplysningerKnapp from '../oppdater-opplysninger-knapp';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Oppdater opplysninger',
        header: 'Oppdater opplysninger',
        ingress: 'Her er opplysningene vi har registrert om deg.',
        fullfoerRegistrering: 'Oppdater opplysninger',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'kontakte oss',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Oppdater opplysningar',
        header: 'Oppdater opplysningar?',
        ingress: 'Her er opplysningane vi har registrert om deg.',
        fullfoerRegistrering: 'Oppdater opplysningar',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'kontakte oss',
    },
    en: {
        sideTittel: 'Register as a Job Seeker: Is the information correct?',
        header: 'Is the information correct?',
        ingress: 'Here is the information we have registered about you.',
        fullfoerRegistrering: 'Complete jobseeker registration',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'kontakte oss',
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
            <Heading size={'medium'} level="1" spacing>
                {tekst('header')}
            </Heading>
            <BodyLong size={'large'} className="mb-6">
                {tekst('ingress')}
            </BodyLong>
            <GuidePanel poster illustration={<OppsummeringSvg />}>
                <SvarTabell skjemaState={skjemaState} skjemaPrefix={skjemaPrefix} />
            </GuidePanel>
            <Alert variant="info">
                <Heading level="2" size="small">
                    Må du fortelle oss om endringene
                </Heading>
                <BodyLong spacing>
                    Hvis endringene er slik at de kan påvirke eventuelle ytelser eller søknader hos Nav må du{' '}
                    <Link href={tekst('kontaktOssLenke')}>{tekst('kontaktOssLenkeTekst')}</Link>.
                </BodyLong>
            </Alert>
            <div className="mt-12">
                <OppdaterOpplysningerKnapp
                    skjemaState={skjemaState}
                    onSubmit={onSubmit}
                    onValiderSkjema={onValiderSkjema}
                    tekst={tekst}
                />
            </div>
        </>
    );
};

export default OppsummeringOppdaterOpplysninger;
