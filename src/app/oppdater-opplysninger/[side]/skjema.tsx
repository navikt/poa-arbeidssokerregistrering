'use client';

import { SkjemaSide, SkjemaState, visSisteStilling } from '@/model/skjema';
import { Dispatch } from 'react';
import { SkjemaAction } from '@/lib/skjema-state';
import { SiderMap, SkjemaProps, SkjemaSideKomponent } from '@/components/skjema-side-factory';
import DinSituasjon from '@/components/skjema/din-situasjon';
import { OpplysningerOmArbeidssoker, SisteStillingValg, SporsmalId } from '@navikt/arbeidssokerregisteret-utils';
import SisteJobb from '@/components/skjema/siste-jobb/siste-jobb';
import SisteStilling from '@/components/skjema/siste-jobb/siste-stilling';
import Utdanning from '@/components/skjema/utdanning';
import UtdanningGodkjent from '@/components/skjema/utdanning-godkjent';
import visUtdanningsvalg from '@/lib/vis-utdanningsvalg';
import BestattUtdanning from '@/components/skjema/utdanning-bestatt';
import Hindringer from '@/components/skjema/hindringer';
import Helseproblemer from '@/components/skjema/helseproblemer';
import AndreProblemer from '@/components/skjema/andre-problemer';
import OppsummeringOppdaterOpplysninger from '@/components/skjema/oppsummering/oppsummering-oppdater-opplysninger';
import { beregnNavigering } from '@/lib/standard-registrering-tilstandsmaskin';
import { validerOpplysningerSkjemaForSide } from '@/app/opplysninger/[side]/skjema';

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
            <OppsummeringOppdaterOpplysninger
                skjemaState={skjemaState}
                skjemaPrefix={'/oppdater-opplysninger/'}
                onSubmit={() => dispatch({ type: 'SenderSkjema' })}
            />
        ),
    };
};

const hentKomponentForSkjemaSide = (side: SkjemaSide, siderMap: SiderMap) =>
    siderMap[side] || siderMap[SkjemaSide.DinSituasjon];

const loggOgDispatch = (dispatch: Dispatch<SkjemaAction>) => {
    return (action: SkjemaAction) => {
        return dispatch(action);
    };
};

const Side = (props: SkjemaProps & { opplysninger?: OpplysningerOmArbeidssoker }) => {
    const hentKomponentForSide = (
        side: SkjemaSide,
        skjemaState: SkjemaState,
        dispatch: Dispatch<SkjemaAction>,
        visFeilmelding: boolean,
    ) => {
        return hentKomponentForSkjemaSide(side, lagSiderMap(skjemaState, loggOgDispatch(dispatch), visFeilmelding));
    };

    return (
        <SkjemaSideKomponent
            beregnNavigering={beregnNavigering}
            hentKomponentForSide={hentKomponentForSide}
            validerSkjemaForSide={validerOpplysningerSkjemaForSide}
            urlPrefix={'oppdater-opplysninger'}
            aktivSide={props.aktivSide}
        />
    );
};

export default Side;
