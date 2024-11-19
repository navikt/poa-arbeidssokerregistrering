import { NextPage } from 'next';
import { Dispatch, useEffect, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { SkjemaSide, SkjemaState } from '../model/skjema';
import { SkjemaAction, skjemaReducer, SkjemaReducer } from '../lib/skjema-state';
import styles from '../styles/skjema.module.css';
import TilbakeKnapp from './skjema/tilbake-knapp';
import { Knapperad } from './skjema/knapperad/knapperad';
import Avbryt from './skjema/avbryt-lenke';
import { StandardRegistreringTilstandsmaskin } from '../lib/standard-registrering-tilstandsmaskin';
import { StandardRegistreringUtenPlikterTilstandsmaskin } from '../lib/standard-registrering-uten-plikter-tilstandsmaskin';
import ProgressBar from './progress-bar/progress-bar';
import { loggAktivitet } from '../lib/amplitude';
import { Link } from '@navikt/ds-react';
import { useConfig } from '../contexts/config-context';
import { Config } from '../model/config';

export type SiderMap = { [key: string]: JSX.Element };
export interface SkjemaProps {
    aktivSide: any;
    eksisterendeOpplysninger?: any;
}

export interface LagSkjemaSideProps {
    urlPrefix: 'skjema' | 'opplysninger' | 'oppdater-opplysninger';
    validerSkjemaForSide: (side: SkjemaSide, skjemaState: SkjemaState) => boolean;
    hentKomponentForSide: (
        side: SkjemaSide,
        skjemaState: SkjemaState,
        dispatch: Dispatch<SkjemaAction>,
        visFeilmelding: boolean,
    ) => JSX.Element;
    beregnNavigering: StandardRegistreringTilstandsmaskin | StandardRegistreringUtenPlikterTilstandsmaskin;
}

export type SkjemaSideFactory = (opts: LagSkjemaSideProps) => NextPage<SkjemaProps>;

const initialArgs = () => ({ startTid: Date.now() });

export const SkjemaSideKomponent = (props: SkjemaProps & LagSkjemaSideProps) => {
    const {
        aktivSide,
        eksisterendeOpplysninger,
        beregnNavigering,
        urlPrefix,
        validerSkjemaForSide,
        hentKomponentForSide,
    } = props;
    const router = useRouter();
    const { dittNavUrl } = useConfig() as Config;

    const initializer = (skjemaState: SkjemaState) => {
        return skjemaState;
    };

    const [erSkjemaSendt, settErSkjemaSendt] = useState<boolean>(false);

    useEffect(() => {
        loggAktivitet({
            aktivitet: 'Start registrering',
        });
    }, []);

    const [skjemaState, dispatch] = useReducer<SkjemaReducer, SkjemaState>(
        skjemaReducer,
        {
            ...(eksisterendeOpplysninger ?? {}),
            ...initialArgs(),
        },
        initializer,
    );

    const [visFeilmelding, settVisFeilmelding] = useState<boolean>(false);

    const { forrige, neste, fremdrift } = beregnNavigering(aktivSide, skjemaState);

    useEffect(() => {
        const url = eksisterendeOpplysninger ? urlPrefix : '/start';
        // valider at forrige side har gyldig state. Hvis ikke starter vi registrering på nytt
        if (forrige) {
            if (!validerSkjemaForSide(forrige, skjemaState)) {
                router.push(url);
            }
        }

        if (fremdrift < 0) {
            router.push(url);
        }
    }, [forrige, router, skjemaState, fremdrift]);

    const navigerTilSide = (side: SkjemaSide) => {
        return router.push(`/${urlPrefix}/${side}`);
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

    useEffect(() => {
        if (validerSkjemaForSide(aktivSide, skjemaState)) {
            settVisFeilmelding(false);
        }

        if (aktivSide !== SkjemaSide.FullforRegistrering && erSkjemaSendt) {
            settErSkjemaSendt(false);
        }
    }, [skjemaState, aktivSide, erSkjemaSendt]);

    const forrigeLenke = forrige ? `/${urlPrefix}/${forrige}/` : undefined;

    const dispatcher = (action: SkjemaAction) => {
        if (action.type === 'SenderSkjema') {
            settErSkjemaSendt(true);
        } else {
            dispatch(action);
        }
    };

    const skjemaWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const inputElement: HTMLInputElement | null | undefined =
            skjemaWrapperRef.current?.querySelector('input[checked]') ||
            skjemaWrapperRef.current?.querySelector('input');
        if (inputElement) {
            inputElement.focus();
        }
    }, [aktivSide]);

    return (
        <div ref={skjemaWrapperRef} className={styles.main}>
            <ProgressBar value={erSkjemaSendt ? 1 : fremdrift} className={'mb-6'} />
            {forrigeLenke && (
                <div className="self-start">
                    <TilbakeKnapp href={forrigeLenke} />
                </div>
            )}
            {hentKomponentForSide(aktivSide, skjemaState, dispatcher, visFeilmelding)}
            {neste && <Knapperad onNeste={validerOgGaaTilNeste} />}
            {urlPrefix !== 'oppdater-opplysninger' && <Avbryt />}
            {urlPrefix === 'oppdater-opplysninger' && (
                <div className="text-center py-4">
                    <Link href={dittNavUrl}>Avbryt oppdatering</Link>
                </div>
            )}
        </div>
    );
};

const skjemaSideFactory: SkjemaSideFactory = (opts) => {
    const { beregnNavigering, urlPrefix, validerSkjemaForSide, hentKomponentForSide } = opts;
    return function SkjemaSide(props: SkjemaProps) {
        return (
            <SkjemaSideKomponent
                aktivSide={props.aktivSide}
                urlPrefix={urlPrefix}
                validerSkjemaForSide={validerSkjemaForSide}
                hentKomponentForSide={hentKomponentForSide}
                beregnNavigering={beregnNavigering}
                eksisterendeOpplysninger={props.eksisterendeOpplysninger}
            />
        );
    };
};

export default skjemaSideFactory;
