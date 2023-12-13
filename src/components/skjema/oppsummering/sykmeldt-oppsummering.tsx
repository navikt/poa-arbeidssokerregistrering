import Oppsummering from './oppsummering';
import { SkjemaState } from '../../../model/skjema';
import { FullforRegistreringKnapp } from '../fullforRegistrering';

interface Props {
    skjemaState: SkjemaState;
    onSubmit(): void;
}

const onValiderSkjema = () => true;

const SykmeldtOppsummering = (props: Props) => {
    const { skjemaState, onSubmit } = props;

    return (
        <>
            <Oppsummering skjemaState={skjemaState} skjemaPrefix={'/sykmeldt/'} />
            <div style={{ textAlign: 'center' }} className={'my-8'}>
                <FullforRegistreringKnapp
                    skjemaState={skjemaState}
                    side={'sykmeldt'}
                    onSubmit={onSubmit}
                    onValiderSkjema={onValiderSkjema}
                />
            </div>
        </>
    );
};

export default SykmeldtOppsummering;
