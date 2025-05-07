import { Dispatch } from 'react';

import { withAuthenticatedPage } from '../../auth/withAuthentication';

import DinSituasjon from '../../components/skjema/din-situasjon';
import SisteJobb from '../../components/skjema/siste-jobb/siste-jobb';
import Utdanning from '../../components/skjema/utdanning';
import UtdanningGodkjent from '../../components/skjema/utdanning-godkjent';
import BestattUtdanning from '../../components/skjema/utdanning-bestatt';
import Helseproblemer from '../../components/skjema/helseproblemer';
import AndreProblemer from '../../components/skjema/andre-problemer';
import OppsummeringUtenPlikter from '../../components/skjema/oppsummering/oppsummering-uten-plikter';
import { beregnNavigering } from '../../lib/standard-registrering-tilstandsmaskin';
import { SkjemaSide, SkjemaState, visSisteStilling } from '../../model/skjema';
import { SkjemaAction } from '../../lib/skjema-state';
import SisteStilling from '../../components/skjema/siste-jobb/siste-stilling';
import skjemaSideFactory, { SiderMap } from '../../components/skjema-side-factory';
import { SisteStillingValg, SporsmalId } from '@navikt/arbeidssokerregisteret-utils';

const lagSiderMap = (skjemaState: SkjemaState, dispatch: Dispatch<SkjemaAction>, visFeilmelding: boolean): SiderMap => {
    return {
        [SkjemaSide.DinSituasjon]: (
            <DinSituasjon
                onChange={(value) => dispatch({ type: SporsmalId.dinSituasjon, value: value })}
                valgt={skjemaState.dinSituasjon}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.SisteJobb]: (
            <SisteJobb
                onChange={(value) => dispatch({ type: SporsmalId.sisteJobb, value: value })}
                valgt={skjemaState.sisteJobb}
                visSisteJobb={skjemaState.sisteStilling !== SisteStillingValg.HAR_IKKE_HATT_JOBB}
            >
                {visSisteStilling(skjemaState) ? (
                    <SisteStilling
                        onChange={(value) => dispatch({ type: SporsmalId.sisteStilling, value: value })}
                        valgt={skjemaState.sisteStilling}
                        visFeilmelding={visFeilmelding}
                    />
                ) : undefined}
            </SisteJobb>
        ),
        [SkjemaSide.Utdanning]: (
            <Utdanning
                onChange={(value) => dispatch({ type: SporsmalId.utdanning, value: value })}
                valgt={skjemaState.utdanning}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.GodkjentUtdanning]: (
            <UtdanningGodkjent
                onChange={(value) => dispatch({ type: SporsmalId.utdanningGodkjent, value: value })}
                valgt={skjemaState.utdanningGodkjent}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.BestaattUtdanning]: (
            <BestattUtdanning
                onChange={(value) => dispatch({ type: SporsmalId.utdanningBestatt, value: value })}
                valgt={skjemaState.utdanningBestatt}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.Helseproblemer]: (
            <Helseproblemer
                onChange={(value) => dispatch({ type: SporsmalId.helseHinder, value: value })}
                valgt={skjemaState.helseHinder}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.AndreProblemer]: (
            <AndreProblemer
                onChange={(value) => dispatch({ type: SporsmalId.andreForhold, value: value })}
                valgt={skjemaState.andreForhold}
                skjematype={'standard'}
                visFeilmelding={visFeilmelding}
            />
        ),
        [SkjemaSide.OppsummeringUtenPlikter]: (
            <OppsummeringUtenPlikter
                skjemaState={skjemaState}
                skjemaPrefix={'/opplysninger/'}
                onSubmit={() => dispatch({ type: 'SenderSkjema' })}
            />
        ),
    };
};

export const validerOpplysningerSkjemaForSide = (side: SkjemaSide, skjemaState: SkjemaState) => {
    const hentVerdi = () => {
        switch (side) {
            case SkjemaSide.DinSituasjon:
                return skjemaState.dinSituasjon;
            case SkjemaSide.SisteJobb: {
                if (visSisteStilling(skjemaState)) {
                    return skjemaState.sisteStilling && skjemaState.sisteStilling !== SisteStillingValg.INGEN_SVAR;
                }
                return skjemaState.sisteJobb;
            }
            case SkjemaSide.Utdanning:
                return skjemaState.utdanning;
            case SkjemaSide.GodkjentUtdanning:
                return skjemaState.utdanningGodkjent;
            case SkjemaSide.BestaattUtdanning:
                return skjemaState.utdanningBestatt;
            case SkjemaSide.Helseproblemer:
                return skjemaState.helseHinder;
            case SkjemaSide.AndreProblemer:
                return skjemaState.andreForhold;
            case SkjemaSide.OppsummeringUtenPlikter:
                return skjemaState.andreForhold;
        }
    };

    return Boolean(hentVerdi());
};

const hentKomponentForSkjemaSide = (side: SkjemaSide, siderMap: SiderMap) =>
    siderMap[side] || siderMap[SkjemaSide.DinSituasjon];

const loggOgDispatch = (dispatch: Dispatch<SkjemaAction>) => {
    return (action: SkjemaAction) => {
        return dispatch(action);
    };
};

const Skjema = skjemaSideFactory({
    urlPrefix: 'opplysninger',
    validerSkjemaForSide: validerOpplysningerSkjemaForSide,
    beregnNavigering,
    hentKomponentForSide: (side, skjemaState, dispatch, visFeilmelding) => {
        return hentKomponentForSkjemaSide(side, lagSiderMap(skjemaState, loggOgDispatch(dispatch), visFeilmelding));
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
export default Skjema;
