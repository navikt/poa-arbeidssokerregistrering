import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { Button } from '@navikt/ds-react';
import { ArrowRightIcon } from '@navikt/aksel-icons';
import useSprak from '../../../hooks/useSprak';

interface Props {
    onClick: () => void;
    disabled?: boolean;
}

const TEKSTER: Tekster<string> = {
    nb: {
        neste: 'Neste steg',
    },
    nn: {
        neste: 'Neste steg',
    },
    en: {
        neste: 'Next step',
    },
};
const NesteSteg = (props: Props) => {
    const sprak = useSprak();
    const { onClick, disabled } = props;
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <Button
            variant={'primary'}
            onClick={onClick}
            disabled={disabled}
            icon={<ArrowRightIcon title="a11y-title" fontSize="1.5rem" />}
            iconPosition={'right'}
        >
            {tekst('neste')}
        </Button>
    );
};

export default NesteSteg;
