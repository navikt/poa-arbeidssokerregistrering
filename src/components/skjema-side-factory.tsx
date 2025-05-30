'use client';

import { NextPage } from 'next';
import { Dispatch, JSX, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { SkjemaSide, SkjemaState } from '@/model/skjema';
import { SkjemaAction } from '@/lib/skjema-state';
import Avbryt from './skjema/avbryt-lenke';
import { StandardRegistreringTilstandsmaskin } from '@/lib/standard-registrering-tilstandsmaskin';
import { loggAktivitet } from '@/lib/amplitude';
import { HGrid, Link } from '@navikt/ds-react';
import { useConfig } from '@/contexts/config-context';
import { Config } from '@/model/config';
import RegistreringsOversikt from './registrerings-oversikt';
import { XMarkIcon } from '@navikt/aksel-icons';
import ForrigeSteg from './skjema/knapperad/forrige-steg';
import NesteSteg from './skjema/knapperad/neste-steg';
import Image from 'next/image';
import skjemaIkonSvg from './skjema-ikon.svg';
import Overskrift from './skjema/overskrift';
import { useSkjemaState } from '@/contexts/skjema-state-context';
import useSprak from '@/hooks/useSprak';

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

export const SkjemaSideKomponent = (props: SkjemaProps & LagSkjemaSideProps) => {
    const { aktivSide, beregnNavigering, urlPrefix, validerSkjemaForSide, hentKomponentForSide } = props;
    const sprak = useSprak();
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;

    const router = useRouter();
    const { dittNavUrl } = useConfig() as Config;
    const [erSkjemaSendt, settErSkjemaSendt] = useState<boolean>(false);

    useEffect(() => {
        loggAktivitet({
            aktivitet: 'Start registrering',
        });
    }, []);

    const { skjemaState, dispatch } = useSkjemaState();
    const [visFeilmelding, settVisFeilmelding] = useState<boolean>(false);

    const { forrige, neste, fremdrift } = beregnNavigering(aktivSide, skjemaState);

    useEffect(() => {
        const url = urlPrefix === 'oppdater-opplysninger' ? `/${urlPrefix}` : `${sprakUrl}/start`;
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
        return router.push(`${sprakUrl}/${urlPrefix}/${side}`);
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

    const forrigeLenke = forrige ? `${sprakUrl}/${urlPrefix}/${forrige}/` : undefined;

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
            <HGrid columns={{ sm: 1, md: 1, lg: '1fr 11fr', xl: '1fr 11fr' }} gap={{ lg: 'space-24' }}>
                <div style={{ width: '96px', height: '96px' }}>
                    <Image src={skjemaIkonSvg} alt="ikon" width={96} height={96} />
                </div>
                <div className={urlPrefix === 'oppdater-opplysninger' ? '' : 'sm:mt-8'}>
                    <Overskrift erOppdaterOpplysninger={urlPrefix === 'oppdater-opplysninger'} />
                    <RegistreringsOversikt
                        aktivSide={props.aktivSide}
                        validerSkjemaForSide={validerSkjemaForSide}
                        skjemaState={skjemaState}
                        navigerTilSide={navigerTilSide}
                        skjemaPrefix={urlPrefix}
                    />
                    {hentKomponentForSide(aktivSide, skjemaState, dispatcher, visFeilmelding)}
                    {neste && (
                        <div className={'flex my-8'}>
                            <ForrigeSteg
                                disabled={!forrigeLenke}
                                onClick={() => navigerTilSide(forrige as SkjemaSide)}
                            />
                            <NesteSteg onClick={validerOgGaaTilNeste} disabled={!neste} />
                        </div>
                    )}
                    {urlPrefix !== 'oppdater-opplysninger' && aktivSide === SkjemaSide.Oppsummering && (
                        <div className={'py-8'}>
                            <Avbryt />
                        </div>
                    )}
                    {urlPrefix === 'oppdater-opplysninger' && (
                        <div className="my-8">
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
