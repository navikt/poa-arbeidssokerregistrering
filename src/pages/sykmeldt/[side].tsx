import { Dispatch } from 'react';
import { SkjemaSide, SkjemaState } from '../../model/skjema';
import Utdanning from '../../components/skjema/utdanning';
import UtdanningGodkjent from '../../components/skjema/utdanning-godkjent';
import BestattUtdanning from '../../components/skjema/utdanning-bestatt';
import { beregnNavigering } from '../../lib/sykmeldt-registrering-tilstandsmaskin';
import SykmeldtFremtidigSituasjon from '../../components/skjema/sykmeldt-fremtidig-situasjon';
import TilbakeTilJobb from '../../components/skjema/tilbake-til-jobb';
import SkalTilbakeTilJobb from '../../components/skjema/skal-tilbake-til-jobb';
import { SkjemaAction } from '../../lib/skjema-state';
import AndreProblemer from '../../components/skjema/andre-problemer';
import skjemaSideFactory, { SiderMap } from '../../components/skjema-side-factory';
import { loggBesvarelse } from '../../lib/amplitude';
import SykmeldtOppsummering from '../../components/skjema/oppsummering/sykmeldt-oppsummering';
import { withAuthenticatedPage } from '../../auth/withAuthentication';
import { SporsmalId } from '@navikt/arbeidssokerregisteret-utils';

const lagSiderMap = (skjemaState: SkjemaState, dispatch: Dispatch<SkjemaAction>, visFeilmelding: boolean): SiderMap => {
    return {
        [SkjemaSide.SykmeldtFremtidigSituasjon]: (
            <SykmeldtFremtidigSituasjon
                onChange={(value: any) => dispatch({ type: SporsmalId.fremtidigSituasjon, value })}
                valgt={skjemaState[SporsmalId.fremtidigSituasjon]}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.TilbakeTilJobb]: (
            <TilbakeTilJobb
                onChange={(value: any) => dispatch({ type: SporsmalId.tilbakeIArbeid, value })}
                valgt={skjemaState[SporsmalId.tilbakeIArbeid]}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.SkalTilbakeTilJobb]: <SkalTilbakeTilJobb />,
        [SkjemaSide.Utdanning]: (
            <Utdanning
                onChange={(value: any) => dispatch({ type: SporsmalId.utdanning, value })}
                valgt={skjemaState.utdanning}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.GodkjentUtdanning]: (
            <UtdanningGodkjent
                onChange={(value: any) => dispatch({ type: SporsmalId.utdanningGodkjent, value })}
                valgt={skjemaState.utdanningGodkjent}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.BestaattUtdanning]: (
            <BestattUtdanning
                onChange={(value: any) => dispatch({ type: SporsmalId.utdanningBestatt, value })}
                valgt={skjemaState.utdanningBestatt}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.AndreProblemer]: (
            <AndreProblemer
                onChange={(value: any) => dispatch({ type: SporsmalId.andreForhold, value })}
                valgt={skjemaState.andreForhold}
                skjematype={'sykmeldt'}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.Oppsummering]: (
            <SykmeldtOppsummering skjemaState={skjemaState} onSubmit={() => dispatch({ type: 'SenderSkjema' })} />
        ),
    };
};

const validerSkjemaForSide = (side: SkjemaSide, skjemaState: SkjemaState) => {
    const hentVerdi = () => {
        switch (side) {
            case SkjemaSide.SykmeldtFremtidigSituasjon:
                return skjemaState.fremtidigSituasjon;
            case SkjemaSide.TilbakeTilJobb:
                return skjemaState.tilbakeIArbeid;
            case SkjemaSide.Utdanning:
                return skjemaState.utdanning;
            case SkjemaSide.GodkjentUtdanning:
                return skjemaState.utdanningGodkjent;
            case SkjemaSide.BestaattUtdanning:
                return skjemaState.utdanningBestatt;
            case SkjemaSide.AndreProblemer:
                return skjemaState.andreForhold;
            case SkjemaSide.Oppsummering:
                return skjemaState.fremtidigSituasjon || skjemaState.tilbakeIArbeid || skjemaState.andreForhold;
        }
    };

    return Boolean(hentVerdi());
};

const hentKomponentForSykmeldtSide = (side: SkjemaSide, siderMap: SiderMap) =>
    siderMap[side] || siderMap[SkjemaSide.SykmeldtFremtidigSituasjon];

const loggOgDispatch = (dispatch: Dispatch<SkjemaAction>) => {
    return (action: SkjemaAction) => {
        if (action.type !== 'SenderSkjema') {
            loggBesvarelse({ skjematype: 'standard', sporsmalId: action.type, svar: action.value });
        }
        return dispatch(action);
    };
};

const SykmeldtSkjema = skjemaSideFactory({
    urlPrefix: 'sykmeldt',
    validerSkjemaForSide,
    beregnNavigering,
    hentKomponentForSide: (side, skjemaState, dispatch, visFeilmelding) => {
        return hentKomponentForSykmeldtSide(side, lagSiderMap(skjemaState, loggOgDispatch(dispatch), visFeilmelding));
    },
});

export const getServerSideProps = withAuthenticatedPage(async (context) => {
    const { side } = context.query;

    return {
        props: {
            aktivSide: side,
        },
    };
});

export default SykmeldtSkjema;
