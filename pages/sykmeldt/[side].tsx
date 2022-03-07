import { NextPage } from 'next';
import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';
import useSprak from '../../hooks/useSprak';
import { useRouter } from 'next/router';
import { Dispatch, useReducer, useState } from 'react';
import { SkjemaSide, SkjemaState, SykmeldtSkjemaSide } from '../../model/skjema';
import styles from '../../styles/skjema.module.css';
import { Alert } from '@navikt/ds-react';
import { Knapperad } from '../../components/skjema/knapperad/knapperad';
import Avbryt from '../../components/skjema/avbryt-lenke';
import Utdanning from '../../components/skjema/utdanning';
import GodkjentUtdanning from '../../components/skjema/utdanning-godkjent';
import BestattUtdanning from '../../components/skjema/utdanning-bestatt';
import Oppsummering from '../../components/skjema/oppsummering/oppsummering';
import AndreHensyn from '../../components/skjema/andre-hensyn';
import { beregnNavigering } from '../../lib/sykmeldt-registrering-tilstandsmaskin';
import SykmeldtFremtidigSituasjon from '../../components/skjema/sykmeldt-fremtidig-situasjon';
import TilbakeTilJobb from '../../components/skjema/tilbake-til-jobb';
import SkalTilbakeTilJobb from '../../components/skjema/skal-tilbake-til-jobb';
import { SkjemaAction, skjemaReducer, SkjemaReducer } from '../../lib/standard-skjema-state';

const TEKSTER: Tekster<string> = {
    nb: {
        advarsel: 'Du må svare på spørsmålet før du kan gå videre.',
    },
};

interface SkjemaProps {
    aktivSide: SykmeldtSkjemaSide;
    isValid?: boolean;
}

type SiderMap = { [key: string]: JSX.Element };

const lagSiderMap = (skjemaState: SkjemaState, dispatch: Dispatch<SkjemaAction>): SiderMap => {
    return {
        [SkjemaSide.SykmeldtFremtidigSituasjon]: (
            <SykmeldtFremtidigSituasjon
                onChange={(value: any) => dispatch({ type: SkjemaSide.SykmeldtFremtidigSituasjon, value })}
            />
        ),
        [SkjemaSide.TilbakeTilJobb]: (
            <TilbakeTilJobb onChange={(value: any) => dispatch({ type: SkjemaSide.TilbakeTilJobb, value })} />
        ),
        [SkjemaSide.SkalTilbakeTilJobb]: <SkalTilbakeTilJobb />,
        [SkjemaSide.Utdanning]: (
            <Utdanning
                onChange={(value: any) => dispatch({ type: SkjemaSide.Utdanning, value })}
                valgt={skjemaState.utdanning}
            />
        ),
        [SkjemaSide.GodkjentUtdanning]: (
            <GodkjentUtdanning
                onChange={(value: any) => dispatch({ type: SkjemaSide.GodkjentUtdanning, value })}
                valgt={skjemaState.godkjentUtdanning}
            />
        ),
        [SkjemaSide.BestaattUtdanning]: (
            <BestattUtdanning
                onChange={(value: any) => dispatch({ type: SkjemaSide.BestaattUtdanning, value })}
                valgt={skjemaState.bestaattUtdanning}
            />
        ),
        [SkjemaSide.AndreHensyn]: (
            <AndreHensyn
                onChange={(value: any) => dispatch({ type: SkjemaSide.AndreProblemer, value })}
                valgt={skjemaState.andreProblemer}
            />
        ),
        [SkjemaSide.Oppsummering]: <Oppsummering {...skjemaState} />,
    };
};

const validerSkjemaForSide = (side: SkjemaSide, skjemaState: SkjemaState) => {
    const hentVerdi = () => {
        switch (side) {
            case SkjemaSide.SykmeldtFremtidigSituasjon:
                return skjemaState.sykmeldtFremtidigSituasjon;
            case SkjemaSide.TilbakeTilJobb:
                return skjemaState.tilbakeTilJobb;
            case SkjemaSide.Utdanning:
                return skjemaState.utdanning;
            case SkjemaSide.GodkjentUtdanning:
                return skjemaState.godkjentUtdanning;
            case SkjemaSide.BestaattUtdanning:
                return skjemaState.bestaattUtdanning;
            case SkjemaSide.AndreHensyn:
                return skjemaState.andreProblemer;
        }
    };

    return Boolean(hentVerdi());
};

const hentKomponentForSide = (side: SkjemaSide, siderMap: SiderMap) =>
    siderMap[side] || siderMap[SkjemaSide.SykmeldtFremtidigSituasjon];

const initializer = (skjemaState: SkjemaState) => skjemaState;

const SykmeldtSkjema: NextPage<SkjemaProps> = (props) => {
    const { aktivSide } = props;
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const router = useRouter();

    const [skjemaState, dispatch] = useReducer<SkjemaReducer, SkjemaState>(skjemaReducer, {}, initializer);
    const [visFeilmelding, settVisFeilmelding] = useState<boolean>(false);

    const { forrige, neste } = beregnNavigering(aktivSide, skjemaState);

    const navigerTilSide = (side: SkjemaSide) => {
        return router.push(`/sykmeldt/${side}`);
    };

    const validerOgGaaTilNeste = () => {
        if (!validerSkjemaForSide(aktivSide, skjemaState)) {
            settVisFeilmelding(true);
            return;
        }

        settVisFeilmelding(false);

        if (neste) {
            return navigerTilSide(neste);
        }
    };

    const onForrige = forrige ? () => navigerTilSide(forrige) : undefined;

    return (
        <>
            <main className={styles.main}>
                {hentKomponentForSide(aktivSide, lagSiderMap(skjemaState, dispatch))}
                {visFeilmelding && <Alert variant="warning">{tekst('advarsel')}</Alert>}
                <Knapperad onNeste={validerOgGaaTilNeste} onForrige={onForrige} />
                <Avbryt />
            </main>
        </>
    );
};

SykmeldtSkjema.getInitialProps = async (context: any) => {
    const { side } = context.query;

    return {
        aktivSide: side,
    };
};

export default SykmeldtSkjema;
