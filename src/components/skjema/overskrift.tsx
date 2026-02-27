import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';
import { Heading } from '@navikt/ds-react';

const TEKSTER: Tekster<string> = {
    nb: {
        registrer: 'Registrer deg som arbeidssøker',
        kvittering: 'Du er registrert som arbeidssøker',
        oppdater: 'Oppdater dine opplysninger gitt i arbeidssøkerregistreringen',
    },
    nn: {
        registrer: 'Registrer deg som arbeidssøkjar',
        kvittering: 'Du er registrert som arbeidssøkjar',
        oppdater: 'Oppdater opplysningane du ga i arbeidssøkjarregistreringa',
    },
    en: {
        registrer: 'Register as a jobseeker',
        kvittering: 'You are registered as a jobseeker',
        oppdater: 'Update your jobseeker information',
    },
};

interface Props {
    erOppdaterOpplysninger?: boolean;
    erKvittering?: boolean;
}

const getKey = (props: Props) => {
    if (props.erKvittering) {
        return 'kvittering';
    } else if (props.erOppdaterOpplysninger) {
        return 'oppdater';
    }

    return 'registrer';
};

export default function Overskrift(props: Props) {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    return (
        <Heading size={'xlarge'} level={'1'} spacing>
            {tekst(getKey(props))}
        </Heading>
    );
}
