import { useState } from 'react';
import { Button, Detail } from '@navikt/ds-react';
import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';
import useSprak from '../../hooks/useSprak';
import { loggFeedback } from '../../lib/amplitude';

const TEKSTER: Tekster<string> = {
    nb: {
        varDetteNyttig: 'Var dette nyttig å lese?',
        ja: 'Ja',
        nei: 'Nei',
        hvorforNei: 'Hvorfor svarte du nei?',
        gammeltNytt: 'Visste det fra før',
        forstodIkke: 'Forstår ikke innholdet',
        uviktig: 'Føles ikke viktig',
        andreGrunner: 'Andre grunner',
        vetIkke: 'Vet ikke',
    },
    en: {
        varDetteNyttig: 'Was this information useful?',
        ja: 'Yes',
        nei: 'No',
        hvorforNei: 'Why did you answer No?',
        gammeltNytt: 'I already knew this',
        forstodIkke: 'I did not understand it',
        uviktig: 'Felt unimportant',
        andreGrunner: 'Other reasons',
        vetIkke: 'Uncertain',
    },
};

interface Props {
    id: string;
    className?: string;
    sporsmal?: string;
}
function Feedback({ id, sporsmal, className }: Props) {
    const [valgt, setValgt] = useState('');
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    const handleFeedback = (feedback: string) => {
        loggFeedback({ id: id, feedback: feedback });
        setValgt(feedback);
    };

    return (
        <div className={'my-6'}>
            <Detail className={'mb-4'}>{sporsmal ? sporsmal : tekst('varDetteNyttig')}</Detail>
            <div>
                <Button
                    size="xsmall"
                    variant={valgt === 'ja' ? 'primary' : 'secondary'}
                    onClick={() => handleFeedback('ja')}
                >
                    <Detail>{tekst('ja')}</Detail>
                </Button>
                <span className={'mx-2 tekst-svak-graa'} aria-hidden="true">
                    |
                </span>
                <Button
                    size="xsmall"
                    variant={valgt === 'nei' ? 'primary' : 'secondary'}
                    onClick={() => handleFeedback('nei')}
                >
                    <Detail>{tekst('nei')}</Detail>
                </Button>
                <span className={'mx-2 tekst-svak-graa'} aria-hidden="true">
                    |
                </span>
                <Button
                    size="xsmall"
                    variant={valgt === 'vet ikke' ? 'primary' : 'secondary'}
                    onClick={() => handleFeedback('vet ikke')}
                >
                    <Detail>{tekst('vetIkke')}</Detail>
                </Button>
            </div>
        </div>
    );
}

export default Feedback;
