import React, { Dispatch } from 'react';

import { withAuthenticatedPage } from '../../auth/withAuthentication';

import DinSituasjon from '../../components/skjema/din-situasjon';
import SisteJobb from '../../components/skjema/siste-jobb/siste-jobb';
import Utdanning from '../../components/skjema/utdanning';
import UtdanningGodkjent from '../../components/skjema/utdanning-godkjent';
import BestattUtdanning from '../../components/skjema/utdanning-bestatt';
import Helseproblemer from '../../components/skjema/helseproblemer';
import AndreProblemer from '../../components/skjema/andre-problemer';
import Oppsummering from '../../components/skjema/oppsummering/oppsummering';
import { beregnNavigering } from '../../lib/standard-registrering-tilstandsmaskin';
import { SkjemaSide, SkjemaState, visSisteStilling } from '../../model/skjema';
import { SkjemaAction } from '../../lib/skjema-state';
import SisteStilling from '../../components/skjema/siste-jobb/siste-stilling';
import skjemaSideFactory, { SiderMap } from '../../components/skjema-side-factory';
import { SisteStillingValg, SporsmalId } from '@navikt/arbeidssokerregisteret-utils';
import visUtdanningsvalg from '../../lib/vis-utdanningsvalg';
import Hindringer from '../../components/skjema/hindringer';

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
            >
                <div className={'my-8'}>
                    <UtdanningGodkjent
                        onChange={(value) => dispatch({ type: SporsmalId.utdanningGodkjent, value: value })}
                        valgt={skjemaState.utdanningGodkjent}
                        visFeilmelding={visFeilmelding}
                        visKomponent={visUtdanningsvalg(skjemaState)}
                    />
                </div>
                <BestattUtdanning
                    onChange={(value) => dispatch({ type: SporsmalId.utdanningBestatt, value: value })}
                    valgt={skjemaState.utdanningBestatt}
                    visFeilmelding={visFeilmelding}
                    visKomponent={visUtdanningsvalg(skjemaState)}
                />
            </Utdanning>
        ),
        [SkjemaSide.Hindringer]: (
            <Hindringer>
                <div className={'my-8'}>
                    <Helseproblemer
                        onChange={(value) => dispatch({ type: SporsmalId.helseHinder, value: value })}
                        valgt={skjemaState.helseHinder}
                        visFeilmelding={visFeilmelding && !skjemaState.helseHinder}
                    />
                </div>
                <AndreProblemer
                    onChange={(value) => dispatch({ type: SporsmalId.andreForhold, value: value })}
                    valgt={skjemaState.andreForhold}
                    skjematype={'standard'}
                    visFeilmelding={visFeilmelding && !skjemaState.andreForhold}
                />
            </Hindringer>
        ),
        [SkjemaSide.Oppsummering]: (
            <Oppsummering
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
                return (
                    skjemaState.utdanning &&
                    (visUtdanningsvalg(skjemaState)
                        ? skjemaState.utdanningGodkjent && skjemaState[SporsmalId.utdanningBestatt]
                        : true)
                );
            case SkjemaSide.Hindringer:
                return skjemaState.helseHinder && skjemaState.andreForhold;
            case SkjemaSide.Oppsummering:
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
    useSkjemaState: () => {
        return {} as any;
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
