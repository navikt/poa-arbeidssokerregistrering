import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';
import { Heading } from '@navikt/ds-react';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Registrer deg som arbeidssøker',
    },
    nn: {
        tittel: 'Registrer deg som arbeidssøkjar',
    },
    en: {
        tittel: 'Register as a Job Seeker',
    },
};

export default function Overskrift() {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    return (
        <Heading size={'xlarge'} level={'1'} spacing>
            {tekst('tittel')}
        </Heading>
    );
}
