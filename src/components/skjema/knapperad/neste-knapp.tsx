import { Button } from '@navikt/ds-react';
import { useCallback } from 'react';

import useSprak from '../../../hooks/useSprak';

import lagHentTekstForSprak, { Tekster } from '../../../lib/lag-hent-tekst-for-sprak';

const TEKSTER: Tekster<string> = {
    nb: {
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
