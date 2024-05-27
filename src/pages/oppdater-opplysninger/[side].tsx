import { Dispatch } from 'react';

import { withAuthenticatedPage } from '../../auth/withAuthentication';

import DinSituasjon from '../../components/skjema/din-situasjon';
import SisteJobb from '../../components/skjema/siste-jobb/siste-jobb';
import Utdanning from '../../components/skjema/utdanning';
import UtdanningGodkjent from '../../components/skjema/utdanning-godkjent';
import BestattUtdanning from '../../components/skjema/utdanning-bestatt';
import Helseproblemer from '../../components/skjema/helseproblemer';
import AndreProblemer from '../../components/skjema/andre-problemer';
import { beregnNavigering } from '../../lib/standard-registrering-uten-plikter-tilstandsmaskin';
import { SkjemaSide, SkjemaState, visSisteStilling } from '../../model/skjema';
import { SkjemaAction } from '../../lib/skjema-state';
import SisteStilling from '../../components/skjema/siste-jobb/siste-stilling';
import skjemaSideFactory, { SiderMap, SkjemaProps } from '../../components/skjema-side-factory';
import { loggBesvarelse } from '../../lib/amplitude';
import {
    ArbeidssokerPeriode,
    OpplysningerOmArbeidssoker,
    SisteStillingValg,
    SporsmalId,
} from '@navikt/arbeidssokerregisteret-utils';
import useSWRImmutable from 'swr/immutable';
import { Loader } from '@navikt/ds-react';
import { fetcher } from '../../lib/api-utils';
import OppsummeringOppdaterOpplysninger from '../../components/skjema/oppsummering/oppsummering-oppdater-opplysninger';
import { validerOpplysningerSkjemaForSide } from '../opplysninger/[side]';
import mapOpplysningerTilSkjemaState from '../../lib/map-opplysninger-til-skjema-state';

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
        if (action.type !== 'SenderSkjema') {
            loggBesvarelse({ skjematype: 'standard', sporsmalId: action.type, svar: action.value });
        }
        return dispatch(action);
    };
};

export const getServerSideProps = withAuthenticatedPage(async (context) => {
    const { side } = context.query;
    return {
        props: {
            aktivSide: side,
        },
    };
});

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

const Side = (props: SkjemaProps) => {
    const { data, isLoading } = useSWRImmutable<{
        periode: ArbeidssokerPeriode;
        opplysninger: OpplysningerOmArbeidssoker;
    }>(brukerMock ? '/api/mocks/hent-siste-opplysninger' : '/api/hent-siste-opplysninger', fetcher);

    if (isLoading) {
        return <Loader />;
    }

    const Skjema = skjemaSideFactory({
        urlPrefix: 'oppdater-opplysninger',
        validerSkjemaForSide: validerOpplysningerSkjemaForSide,
        beregnNavigering,
        hentKomponentForSide: (side, skjemaState, dispatch, visFeilmelding) => {
            return hentKomponentForSkjemaSide(side, lagSiderMap(skjemaState, loggOgDispatch(dispatch), visFeilmelding));
        },
    });

    return (
        <Skjema
            aktivSide={props.aktivSide}
            eksisterendeOpplysninger={mapOpplysningerTilSkjemaState(data?.opplysninger!)}
        />
    );
};

export default Side;
