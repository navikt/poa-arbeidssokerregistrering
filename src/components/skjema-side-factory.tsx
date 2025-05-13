import { NextPage } from 'next';
import { Dispatch, JSX, useEffect, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { SkjemaSide, SkjemaState } from '../model/skjema';
import { SkjemaAction, skjemaReducer } from '../lib/skjema-state';
import Avbryt from './skjema/avbryt-lenke';
import { StandardRegistreringTilstandsmaskin } from '../lib/standard-registrering-tilstandsmaskin';
import { loggAktivitet } from '../lib/amplitude';
import { Heading, HGrid, Link } from '@navikt/ds-react';
import { useConfig } from '../contexts/config-context';
import { Config } from '../model/config';
import RegistreringsOversikt from './registrerings-oversikt';
import { XMarkIcon } from '@navikt/aksel-icons';
import ForrigeSteg from './skjema/knapperad/forrige-steg';
import NesteSteg from './skjema/knapperad/neste-steg';
import Image from 'next/image';
import skjemaIkonSvg from './skjema-ikon.svg';

export type SiderMap = { [key: string]: JSX.Element };
export interface SkjemaProps {
    aktivSide: any;
    eksisterendeOpplysninger?: any;
}

export interface LagSkjemaSideProps {
    urlPrefix: 'opplysninger' | 'oppdater-opplysninger';
    validerSkjemaForSide: (side: SkjemaSide, skjemaState: SkjemaState) => boolean;
    hentKomponentForSide: (
        side: SkjemaSide,
        skjemaState: SkjemaState,
        dispatch: Dispatch<SkjemaAction>,
        visFeilmelding: boolean,
    ) => JSX.Element;
    beregnNavigering: StandardRegistreringTilstandsmaskin;
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

    const [skjemaState, dispatch] = useReducer(
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
        <div ref={skjemaWrapperRef} className={'max-w-4xl'}>
            <HGrid columns={{ sm: 1, md: 1, lg: '1fr auto', xl: '1fr auto' }} gap={{ lg: 'space-24' }}>
                <div style={{ width: '96px', height: '96px' }}>
                    <Image src={skjemaIkonSvg} alt="ikon" width={96} height={96} />
                </div>
                <div>
                    <Heading size={'xlarge'} level={'1'} spacing>
                        Registrer deg som arbeidssøker
                    </Heading>
                    <RegistreringsOversikt
                        aktivSide={props.aktivSide}
                        validerSkjemaForSide={validerSkjemaForSide}
                        skjemaState={skjemaState}
                        navigerTilSide={navigerTilSide}
                    />
                    {hentKomponentForSide(aktivSide, skjemaState, dispatcher, visFeilmelding)}
                    <div className={'flex my-8'}>
                        <ForrigeSteg disabled={!forrigeLenke} onClick={() => navigerTilSide(forrige as SkjemaSide)} />
                        {neste && <NesteSteg onClick={validerOgGaaTilNeste} disabled={!neste} />}
                    </div>
                    {urlPrefix !== 'oppdater-opplysninger' && <Avbryt />}
                    {urlPrefix === 'oppdater-opplysninger' && (
                        <div className="text-center py-4">
                            <Link href={dittNavUrl}>
                                <XMarkIcon title="a11y-title" fontSize="1.5rem" /> Avbryt oppdatering
                            </Link>
                        </div>
                    )}
                </div>
            </HGrid>
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
