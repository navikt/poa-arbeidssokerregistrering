import { Button } from '@navikt/ds-react';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import { useCallback } from 'react';
import useSprak from '../../../hooks/useSprak';

const TEKSTER: Tekster<string> = {
    nb: {
        neste: 'Neste',
    },
    nn: {
        neste: 'Neste',
    },
    en: {
        neste: 'Next',
    },
};

interface NesteProps {
    onClick?: () => void;
}

const Neste = (props: NesteProps) => {
    const { onClick } = props;

    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    const onButtonClick = useCallback(() => {
        onClick && onClick();
    }, [onClick]);

    return (
        <>
            <div className="text-center py-4">
                <Button onClick={onButtonClick}>{tekst('neste')}</Button>
            </div>
        </>
    );
};

export default Neste;
