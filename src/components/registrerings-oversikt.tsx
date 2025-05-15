import useSprak from '../hooks/useSprak';
import { FormProgress, Heading } from '@navikt/ds-react';
import { SkjemaSide, SkjemaState } from '../model/skjema';
import { lagHentTekstForSprak } from '@navikt/arbeidssokerregisteret-utils';
import NextLink from 'next/link';
import { loggAktivitet } from '../lib/amplitude';

const TEKSTER = {
    nb: {
        dinsituasjon: 'Din arbeidssøkersituasjon',
        sistejobb: 'Hva er din siste jobb?',
        utdanning: 'Utdanning',
        hindringer: 'Hindringer',
        oppsummering: 'Oppsummering',
    },
    nn: {
        dinsituasjon: 'Din situasjon som arbeidssøkjar',
        sistejobb: 'Kva var den siste jobben din?',
        utdanning: 'Utdanning',
        hindringer: 'Hindringar',
        oppsummering: 'Oppsummering',
    },
    en: {
        dinsituasjon: 'Your jobseeker situation',
        sistejobb: 'What was your last job?',
        utdanning: 'Education',
        hindringer: 'Impediments',
        oppsummering: 'Summary',
    },
};

interface Props {
    aktivSide: number;
    validerSkjemaForSide: (side: SkjemaSide, skjemaState: SkjemaState) => boolean;
    skjemaState: SkjemaState;
    navigerTilSide: (side: SkjemaSide) => void;
    skjemaPrefix: string;
}

const steps = [
    { side: SkjemaSide.DinSituasjon, tittel: 'dinsituasjon' },
    { side: SkjemaSide.SisteJobb, tittel: 'sistejobb' },
    { side: SkjemaSide.Utdanning, tittel: 'utdanning' },
    { side: SkjemaSide.Hindringer, tittel: 'hindringer' },
    { side: SkjemaSide.Oppsummering, tittel: 'oppsummering', sisteSteg: true },
];

const RegistreringsOversikt = (props: Props) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const { validerSkjemaForSide, aktivSide, skjemaState, navigerTilSide } = props;
    const heading = steps[aktivSide - 1]?.tittel;
    return (
        <>
            {heading && (
                <Heading size={'medium'} level="2" spacing>
                    {tekst(heading)}
                </Heading>
            )}
            <FormProgress
                totalSteps={5}
                activeStep={aktivSide}
                onStepChange={(step: unknown) => {
                    navigerTilSide(step as SkjemaSide);
                }}
                className={'mb-8'}
            >
                {steps.map((s) => {
                    const harGyldigTilstand = validerSkjemaForSide(s.side, skjemaState);
                    return (
                        <FormProgress.Step
                            key={s.tittel}
                            interactive={harGyldigTilstand}
                            completed={!s.sisteSteg && harGyldigTilstand}
                            onClick={() => {
                                loggAktivitet({
                                    aktivitet: 'Trykker på steg i SkjemaVelger',
                                    steg: s.tittel,
                                    skjemaPrefix: props.skjemaPrefix,
                                });
                            }}
                        >
                            {tekst(s.tittel)}
                        </FormProgress.Step>
                    );
                })}
            </FormProgress>
        </>
    );
};

export default RegistreringsOversikt;
