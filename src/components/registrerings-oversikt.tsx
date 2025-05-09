import useSprak from '../hooks/useSprak';
import { FormProgress } from '@navikt/ds-react';
import { SkjemaSide, SkjemaState } from '../model/skjema';
import { lagHentTekstForSprak } from '@navikt/arbeidssokerregisteret-utils';

const TEKSTER = {
    nb: {
        dinsituasjon: 'Din situasjon',
        sistejobb: 'Siste jobb',
        utdanning: 'Utdanning',
        hindringer: 'Hindringer',
        oppsummering: 'Oppsummering',
    },
    nn: {
        dinsituasjon: 'Din situasjon',
        sistejobb: 'Siste jobb',
        utdanning: 'Utdanning',
        hindringer: 'Hindringar',
        oppsummering: 'Oppsummering',
    },
    en: {
        dinsituasjon: 'Your jobseeker situation',
        sistejobb: 'Last job',
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
    return (
        <FormProgress
            totalSteps={5}
            activeStep={aktivSide}
            onStepChange={(step: unknown) => {
                navigerTilSide(step as SkjemaSide);
            }}
        >
            {steps.map((s) => {
                const harGyldigTilstand = validerSkjemaForSide(s.side, skjemaState);
                return (
                    <FormProgress.Step
                        key={s.tittel}
                        href={'#'}
                        interactive={harGyldigTilstand}
                        completed={!s.sisteSteg && harGyldigTilstand}
                    >
                        {tekst(s.tittel)}
                    </FormProgress.Step>
                );
            })}
        </FormProgress>
    );
};

export default RegistreringsOversikt;
