import { BodyLong, GuidePanel, Heading } from '@navikt/ds-react';
import Head from 'next/head';
// import useSWR from 'swr';
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
        ikkeIJobbSisteAaret: `Ifølge Arbeidsgiver- og arbeidstakerregisteret har du ikke vært i jobb i løpet av det siste året. 
             Hvis det er feil, er det likevel viktig at du fullfører registreringen. Du kan gi riktig informasjon senere til NAV.`,
        harJobbetSisteAaret:
            'Ifølge Arbeidsgiver- og arbeidstakerregisteret har du vært i jobb i løpet av det siste året. ' +
            'Hvis det er feil, er det likevel viktig at du fullfører registreringen. Du kan gi riktig informasjon senere til NAV.',
        fullfoerRegistrering: 'Fullfør registrering som arbeidssøker',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Stemmer opplysningane',
        header: 'Stemmer opplysningane?',
        ingress: 'Her er opplysningane vi har registrert om deg.',
        ikkeIJobbSisteAaret: `Ifølgje Arbeidsgivar- og arbeidstakarregisteret har du ikkje vore i jobb i løpet av det siste året. Om dette ikkje stemmer, er det likevel viktig at du fullfører registreringa. Du kan gi rett informasjon til NAV seinare.`,
        harJobbetSisteAaret:
            'Ifølgje Arbeidsgivar- og arbeidstakarregisteret har du vore i jobb i løpet av det siste året. Om dette ikkje stemmer, er det likevel viktig at du fullfører registreringa. Du kan gi rett informasjon til NAV seinare.',
        fullfoerRegistrering: 'Fullfør registreringa som arbeidssøkjar',
    },
    en: {
        sideTittel: 'Register as a Job Seeker: Is the information correct?',
        header: 'Is the information correct?',
        ingress: 'Here is the information we have registered about you.',
        ikkeIJobbSisteAaret: `According to the As Register, you have not been employed during the past year. 
            It is important to complete the registration even if you find errors. You can provide the correct information later to NAV.`,
        harJobbetSisteAaret: `According to the As Register, you have been employed during the past year. 
            It is important to complete the registration even if you find errors. You can provide the correct information later to NAV.`,
        fullfoerRegistrering: 'Complete jobseeker registration',
    },
};

interface OppsummeringProps {
    skjemaState: SkjemaState;
    skjemaPrefix: '/skjema/' | '/opplysninger/' | '/oppdater-opplysninger/';
    onSubmit(): void;
}

const OppsummeringUtenPlikter = (props: OppsummeringProps) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    // const { data: startRegistreringData, error } = useSWR('/api/startregistrering', api);

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
                {/* {skjemaPrefix === '/opplysninger/' && (
                    <p>
                        {startRegistreringData && startRegistreringData.jobbetSeksAvTolvSisteManeder
                            ? tekst('harJobbetSisteAaret')
                            : tekst('ikkeIJobbSisteAaret')}
                    </p>
                )}*/}
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
