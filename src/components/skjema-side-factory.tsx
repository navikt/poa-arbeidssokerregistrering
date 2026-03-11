'use client';

import { NextPage } from 'next';
import { Dispatch, JSX, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { SkjemaSide, SkjemaState } from '@/model/skjema';
import { SkjemaAction } from '@/lib/skjema-state';
import Avbryt from './skjema/avbryt-lenke';
import { StandardRegistreringTilstandsmaskin } from '@/lib/standard-registrering-tilstandsmaskin';
import { loggAktivitet } from '@/lib/tracker';
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
}

interface LagSkjemaSideProps {
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

type SkjemaSideFactory = (opts: LagSkjemaSideProps) => NextPage<SkjemaProps>;

export const SkjemaSideKomponent = (props: SkjemaProps & LagSkjemaSideProps) => {
    const { aktivSide, beregnNavigering, urlPrefix, validerSkjemaForSide, hentKomponentForSide } = props;
    const sprak = useSprak();
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;

    const router = useRouter();
    const { arbeidssoekerregisteretUrl } = useConfig() as Config;

    useEffect(() => {
        loggAktivitet({
            aktivitet: 'Start registrering',
        });
    }, []);

    const { skjemaState, dispatch } = useSkjemaState();
    const [harNavigertMedUgyldigState, settHarNavigertMedUgyldigState] = useState<boolean>(false);

    const { forrige, neste, fremdrift } = beregnNavigering(aktivSide, skjemaState);

    const ugyldigStateUrl = urlPrefix === 'oppdater-opplysninger' ? `${sprakUrl}/${urlPrefix}` : `${sprakUrl}/start`;

    useEffect(() => {
        // forhindre redirect-loop før vi har initialisert state
        if (urlPrefix === 'oppdater-opplysninger' && !skjemaState.hasInitialized) {
            return;
        }

        // valider at forrige side har gyldig state. Hvis ikke starter vi registrering på nytt
        if (forrige) {
            if (!validerSkjemaForSide(forrige, skjemaState)) {
                router.push(ugyldigStateUrl);
            }
        }
        if (fremdrift < 0) {
            router.push(ugyldigStateUrl);
        }
    }, [forrige, router, skjemaState, fremdrift, urlPrefix, validerSkjemaForSide, ugyldigStateUrl]);

    const navigerTilSide = (side: SkjemaSide) => {
        return router.push(`${sprakUrl}/${urlPrefix}/${side}`);
    };

    const validerOgGaaTilNeste = () => {
        if (!validerSkjemaForSide(aktivSide, skjemaState)) {
            settHarNavigertMedUgyldigState(true);
            return;
        }

        settHarNavigertMedUgyldigState(false);

        if (neste) {
            return navigerTilSide(neste);
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

    const forrigeLenke = forrige ? `${sprakUrl}/${urlPrefix}/${forrige}/` : undefined;
    const visFeilmelding = harNavigertMedUgyldigState && !validerSkjemaForSide(aktivSide, skjemaState);

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
                    {hentKomponentForSide(aktivSide, skjemaState, dispatch, visFeilmelding)}
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
                            <Link href={arbeidssoekerregisteretUrl}>
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
            />
        );
    };
};

export default skjemaSideFactory;
