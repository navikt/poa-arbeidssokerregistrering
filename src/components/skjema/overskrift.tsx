import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';
import { Heading } from '@navikt/ds-react';

const TEKSTER: Tekster<string> = {
    nb: {
        registrer: 'Registrer deg som arbeidssøker',
        oppdater: 'Oppdater opplysninger',
    },
    nn: {
        registrer: 'Registrer deg som arbeidssøkjar',
        oppdater: 'Oppdater opplysningar',
    },
    en: {
        registrer: 'Register as a Job Seeker',
        oppdater: 'Update your information',
    },
};

interface Props {
    erOppdaterOpplysninger?: boolean;
}
export default function Overskrift(props: Props) {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    return (
        <Heading size={'xlarge'} level={'1'} spacing>
            {tekst(props.erOppdaterOpplysninger ? 'oppdater' : 'registrer')}
        </Heading>
    );
}
