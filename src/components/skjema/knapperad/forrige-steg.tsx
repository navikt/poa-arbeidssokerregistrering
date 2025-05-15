import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { Button } from '@navikt/ds-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import useSprak from '../../../hooks/useSprak';

interface Props {
    onClick: () => void;
    disabled?: boolean;
}
const TEKSTER: Tekster<string> = {
    nb: {
        forrige: 'Forrige steg',
    },
    nn: {
        forrige: 'Forrige steg',
    },
    en: {
        forrige: 'Previous step',
    },
};
const ForrigeSteg = (props: Props) => {
    const sprak = useSprak();
    const { onClick, disabled } = props;
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <Button
            className={'mr-8'}
            variant={'secondary'}
            disabled={disabled}
            onClick={onClick}
            icon={<ArrowLeftIcon title="a11y-title" fontSize="1.5rem" />}
        >
            {tekst('forrige')}
        </Button>
    );
};

export default ForrigeSteg;
