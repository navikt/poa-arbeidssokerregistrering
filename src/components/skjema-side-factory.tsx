'use client';

import { ErrorSummary, HGrid } from '@navikt/ds-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type Dispatch, type JSX, useEffect, useRef, useState } from 'react';
import AvbrytOppdatering from '@/components/skjema/avbryt-oppdatering';
import { useSkjemaState } from '@/contexts/skjema-state-context';
import useSprak from '@/hooks/useSprak';
import type { SkjemaAction } from '@/lib/skjema-state';
import type { StandardRegistreringTilstandsmaskin } from '@/lib/standard-registrering-tilstandsmaskin';
import { loggAktivitet } from '@/lib/tracker';
import { SkjemaSide, type SkjemaState } from '@/model/skjema';
import RegistreringsOversikt from './registrerings-oversikt';
import Avbryt from './skjema/avbryt-lenke';
import ForrigeSteg from './skjema/knapperad/forrige-steg';
import NesteSteg from './skjema/knapperad/neste-steg';
import Overskrift from './skjema/overskrift';
import skjemaIkonSvg from './skjema-ikon.svg';

export type SiderMap = { [key: string]: JSX.Element };

interface RadioGruppeFeil {
    id: string;
    legend: string;
    melding: string;
}

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

export const SkjemaSideKomponent = (props: SkjemaProps & LagSkjemaSideProps) => {
    const { aktivSide, beregnNavigering, urlPrefix, validerSkjemaForSide, hentKomponentForSide } = props;
    const sprak = useSprak();
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;

    const router = useRouter();

    useEffect(() => {
        loggAktivitet({
            aktivitet: 'Start registrering',
        });
    }, []);

    const { skjemaState, dispatch } = useSkjemaState();
    const [harNavigertMedUgyldigState, settHarNavigertMedUgyldigState] = useState<boolean>(false);
    const [valideringsforsok, settValideringsforsok] = useState(0);
    const [radioGruppeFeil, settRadioGruppeFeil] = useState<RadioGruppeFeil[]>([]);
    const sisteFokuserteValideringsforsok = useRef(0);
    const errorSummaryRef = useRef<HTMLDivElement>(null);

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
            settValideringsforsok((antall) => antall + 1);
            return;
        }

        settHarNavigertMedUgyldigState(false);

        if (neste) {
            return navigerTilSide(neste);
        }
    };

    const skjemaWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const heading =
            skjemaWrapperRef.current?.querySelector<HTMLElement>(`#skjema-steg-${aktivSide}`) ??
            skjemaWrapperRef.current?.querySelector<HTMLElement>('h1');
        heading?.focus();
    }, [aktivSide]);

    const forrigeLenke = forrige ? `${sprakUrl}/${urlPrefix}/${forrige}/` : undefined;
    const visFeilmelding = harNavigertMedUgyldigState && !validerSkjemaForSide(aktivSide, skjemaState);

    useEffect(() => {
        if (!visFeilmelding) {
            settRadioGruppeFeil([]);
            return;
        }

        const feil = Array.from(
            skjemaWrapperRef.current?.querySelectorAll<HTMLFieldSetElement>(
                'fieldset[role="radiogroup"][data-error-message]',
            ) ?? [],
        ).map((gruppe) => ({
            id: gruppe.id,
            legend: gruppe.querySelector('legend')?.textContent?.trim() ?? '',
            melding: gruppe.dataset.errorMessage ?? '',
        }));
        settRadioGruppeFeil(feil.filter((gruppe) => gruppe.id && gruppe.melding));
    }, [aktivSide, skjemaState, valideringsforsok, visFeilmelding]);

    useEffect(() => {
        if (!visFeilmelding || !valideringsforsok || sisteFokuserteValideringsforsok.current === valideringsforsok) {
            return;
        }

        if (radioGruppeFeil.length === 1) {
            document.getElementById(radioGruppeFeil[0].id)?.focus();
            sisteFokuserteValideringsforsok.current = valideringsforsok;
        } else if (radioGruppeFeil.length > 1 && errorSummaryRef.current) {
            errorSummaryRef.current.focus();
            sisteFokuserteValideringsforsok.current = valideringsforsok;
        }
    }, [radioGruppeFeil, valideringsforsok, visFeilmelding]);

    return (
        <div ref={skjemaWrapperRef} className={'w-full max-w-4xl min-w-0'}>
            <HGrid columns={{ xs: 1, sm: 1, md: 1, lg: '1fr 11fr', xl: '1fr 11fr' }} gap={{ lg: 'space-24' }}>
                <div style={{ width: '96px', height: '96px' }}>
                    <Image src={skjemaIkonSvg} alt="" width={96} height={96} />
                </div>
                <div className={`min-w-0 max-w-full ${urlPrefix === 'oppdater-opplysninger' ? '' : 'sm:mt-8'}`}>
                    <Overskrift erOppdaterOpplysninger={urlPrefix === 'oppdater-opplysninger'} />
                    <RegistreringsOversikt
                        aktivSide={props.aktivSide}
                        validerSkjemaForSide={validerSkjemaForSide}
                        skjemaState={skjemaState}
                        navigerTilSide={navigerTilSide}
                        skjemaPrefix={urlPrefix}
                    />
                    {hentKomponentForSide(aktivSide, skjemaState, dispatch, visFeilmelding)}
                    {visFeilmelding && radioGruppeFeil.length > 1 && (
                        <ErrorSummary
                            ref={errorSummaryRef}
                            className="my-8"
                            heading={
                                sprak === 'nn'
                                    ? 'Du må rette desse feila før du kan gå vidare:'
                                    : sprak === 'en'
                                      ? 'You must correct these errors before you can continue:'
                                      : 'Du må rette disse feilene før du kan fortsette:'
                            }
                        >
                            {radioGruppeFeil.map(({ id, legend, melding }) => (
                                <ErrorSummary.Item href={`#${id}`} key={id}>
                                    {legend ? `${legend}: ${melding}` : melding}
                                </ErrorSummary.Item>
                            ))}
                        </ErrorSummary>
                    )}
                    {neste && (
                        <div className={'my-8 flex flex-wrap gap-4'}>
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
                            <AvbrytOppdatering sprak={sprak} />
                        </div>
                    )}
                </div>
            </HGrid>
        </div>
    );
};
