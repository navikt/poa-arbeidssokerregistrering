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
        informasjonOmEndringerTittel: 'Må du fortelle oss om endringene?',
        informasjonOmEndringerTekst:
            'Hvis endringene er slik at de kan påvirke eventuelle ytelser eller søknader hos Nav må du',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'kontakte oss og gi beskjed',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Oppdater opplysningar',
        header: 'Oppdater opplysningar?',
        ingress: 'Her er opplysningane vi har registrert om deg.',
        fullfoerRegistrering: 'Oppdater opplysningar',
        informasjonOmEndringerTittel: 'Må du fortelja oss om endringane?',
        informasjonOmEndringerTekst:
            'Viss endringane er slik at dei kan påverka eventuelle ytingar eller søknader hos Nav',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'må du kontakta oss og gi beskjed',
    },
    en: {
        sideTittel: 'Register as a Job Seeker: Is the information correct?',
        header: 'Is the information correct?',
        ingress: 'Here is the information we have registered about you.',
        fullfoerRegistrering: 'Complete jobseeker registration',
        informasjonOmEndringerTittel: 'Do you need to tell us about the changes?',
        informasjonOmEndringerTekst:
            'If the changes are such that they may affect any benefits or applications at Nav, you must',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'contact us and let us know',
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
            <Alert variant="info" className="mt-8">
                <Heading level="2" size="small">
                    {tekst('informasjonOmEndringerTittel')}
                </Heading>
                <BodyLong spacing>
                    Hvis endringene er slik at de kan påvirke eventuelle ytelser eller søknader hos Nav må du{' '}
                    <Link href={tekst('kontaktOssLenke')}>{tekst('kontaktOssLenkeTekst')}</Link>.
                </BodyLong>
            </Alert>
            <div className="mt-8">
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
