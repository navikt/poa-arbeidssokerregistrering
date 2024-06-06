import { useCallback, useState } from 'react';
import { BodyLong, Button, GuidePanel, Heading } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import { logger } from '@navikt/next-logger';
import Head from 'next/head';
import useSWR from 'swr';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../../hooks/useSprak';
import OppsummeringSvg from './oppsummering-svg';
import { SkjemaState } from '../../../model/skjema';
import { fetcher as api } from '../../../lib/api-utils';
import byggFullforRegistreringPayload from '../../../lib/bygg-fullfor-registrering-payload';
import { FeilmeldingGenerell } from '../../feilmeldinger/feilmeldinger';
import { FullforRegistreringResponse } from '../../../model/registrering';
import hentKvitteringsUrl from '../../../lib/hent-kvitterings-url';
import { loggAktivitet, loggFlyt } from '../../../lib/amplitude';
import { hentRegistreringFeiletUrl } from '../../../lib/hent-registrering-feilet-url';
import { OppgaveRegistreringstype } from '../../../model/feilsituasjonTyper';
import { useFeatureToggles } from '../../../contexts/featuretoggle-context';
import FullforRegistreringKnappNyInngang from '../fullfor-registrering-knapp-ny-inngang';
import SvarTabell from './SvarTabell';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Gjennomgang av opplysninger',
        header: 'Er opplysningene riktige?',
        ingress: 'Her er opplysningene vi har registrert om deg.',
        ikkeIJobbSisteAaret: `Ifølge Arbeidsgiver- og arbeidstakerregisteret har du ikke vært i jobb i løpet av det siste året. 
             Hvis det er feil, er det likevel viktig at du fullfører registreringen. Du kan gi riktig informasjon senere til NAV.`,
        harJobbetSisteAaret:
            'Ifølge Arbeidsgiver- og arbeidstakerregisteret har du vært i jobb i løpet av det siste året. ' +
            'Hvis det er feil, er det likevel viktig at du fullfører registreringen. Du kan gi riktig informasjon senere til NAV.',
        fullfoerRegistrering: 'Fullfør registrering som arbeidssøker',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Stemmer opplysningane',
        header: 'Stemmer opplysningane?',
        ingress: 'Her er opplysningane vi har registrert om deg.',
        ikkeIJobbSisteAaret: `Ifølgje Arbeidsgivar- og arbeidstakarregisteret har du ikkje vore i jobb i løpet av det siste året. Om dette ikkje stemmer, er det likevel viktig at du fullfører registreringa. Du kan gi rett informasjon til NAV seinare.`,
        harJobbetSisteAaret:
            'Ifølgje Arbeidsgivar- og arbeidstakarregisteret har du vore i jobb i løpet av det siste året. Om dette ikkje stemmer, er det likevel viktig at du fullfører registreringa. Du kan gi rett informasjon til NAV seinare.',
        fullfoerRegistrering: 'Fullfør registreringa som arbeidssøkjar',
    },
    en: {
        sideTittel: 'Register as a Job Seeker: Is the information correct?',
        header: 'Is the information correct?',
        ingress: 'Here is the information we have registered about you.',
        ikkeIJobbSisteAaret: `According to the As Register, you have not been employed during the past year. 
            It is important to complete the registration even if you find errors. You can provide the correct information later to NAV.`,
        harJobbetSisteAaret: `According to the As Register, you have been employed during the past year. 
            It is important to complete the registration even if you find errors. You can provide the correct information later to NAV.`,
        fullfoerRegistrering: 'Complete jobseeker registration',
    },
};

interface FullforProps {
    skjemaState: SkjemaState;
    onSubmit(): void;
}

const beregnTidBrukt = (skjemaState: SkjemaState) => {
    if (!skjemaState.startTid) {
        return;
    }

    return (Date.now() - skjemaState.startTid) / 1000;
};

const hentProfilering = async (response: FullforRegistreringResponse) => {
    if (!response.type) {
        try {
            return await api('api/profilering/');
        } catch (e) {
            logger.error('profilering feilet', e);
        }
    }
};

interface FullforKnappProps extends FullforProps {
    onValiderSkjema(): boolean;
}

interface OppsummeringProps {
    skjemaState: SkjemaState;
    skjemaPrefix: '/skjema/' | '/opplysninger/' | '/oppdater-opplysninger/';
    onSubmit(): void;
}

export const FullforRegistreringKnapp = (props: FullforKnappProps) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const [senderSkjema, settSenderSkjema] = useState<boolean>(false);
    const [visFeilmelding, settVisFeilmelding] = useState<boolean>(false);
    const [visFeilmeldingTeller, settVisFeilmeldingTeller] = useState<number>(0);
    const router = useRouter();

    const { skjemaState, onSubmit, onValiderSkjema } = props;

    const validerOgFullfor = () => {
        if (onValiderSkjema()) {
            return fullforRegistrering();
        }
    };

    const fullforRegistrering = useCallback(async () => {
        try {
            const body = byggFullforRegistreringPayload(skjemaState);
            settSenderSkjema(true);
            settVisFeilmelding(false);
            onSubmit();

            const response: FullforRegistreringResponse = await api(`api/fullforregistrering`, {
                method: 'post',
                body: JSON.stringify(body),
            });

            const feiltype = response.type;

            if (feiltype) {
                loggFlyt({ hendelse: 'Får ikke fullført registreringen', aarsak: feiltype });
                return router.push(hentRegistreringFeiletUrl(feiltype, OppgaveRegistreringstype.REGISTRERING));
            }

            const profilering = await hentProfilering(response);

            loggAktivitet({
                aktivitet: 'Utfylling av skjema fullført',
                tidBruktForAaFullforeSkjema: beregnTidBrukt(skjemaState),
                innsatsgruppe: profilering ? profilering.innsatsgruppe : 'IKKE_PROFILERT',
            });

            loggFlyt({ hendelse: 'Sender inn skjema for registrering' });

            return router.push(hentKvitteringsUrl());
        } catch (e) {
            settVisFeilmeldingTeller(visFeilmeldingTeller + 1);
            settVisFeilmelding(true);
            logger.error(e, `Registrering uten plikter feilet`);
            if (visFeilmeldingTeller >= 3) {
                return router.push('/feil/');
            }
        } finally {
            settSenderSkjema(false);
        }
    }, [onSubmit, router, skjemaState, visFeilmeldingTeller]);

    return (
        <>
            {visFeilmelding && (
                <div className="mb-6">
                    <FeilmeldingGenerell />
                </div>
            )}
            <div style={{ textAlign: 'center' }}>
                <Button onClick={validerOgFullfor} loading={senderSkjema} disabled={senderSkjema}>
                    {tekst('fullfoerRegistrering')}
                </Button>
            </div>
        </>
    );
};

const OppsummeringUtenPlikter = (props: OppsummeringProps) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const { data: startRegistreringData, error } = useSWR('/api/startregistrering', api);

    const { toggles } = useFeatureToggles();
    const brukNyInngang = toggles['arbeidssokerregistrering.bruk-ny-inngang'];

    const { skjemaState, skjemaPrefix, onSubmit } = props;

    const onValiderSkjema = () => {
        return true;
    };

    return (
        <>
            <Head>
                <title>{tekst('sideTittel')}</title>
            </Head>
            <Heading size={'medium'} level="1" spacing>
                {tekst('header')}
            </Heading>
            <BodyLong size={'large'} className="mb-6">
                {tekst('ingress')}
            </BodyLong>
            <GuidePanel poster illustration={<OppsummeringSvg />}>
                {/* {skjemaPrefix === '/opplysninger/' && (
                    <p>
                        {startRegistreringData && startRegistreringData.jobbetSeksAvTolvSisteManeder
                            ? tekst('harJobbetSisteAaret')
                            : tekst('ikkeIJobbSisteAaret')}
                    </p>
                )}*/}
                <SvarTabell skjemaState={skjemaState} skjemaPrefix={skjemaPrefix} />
            </GuidePanel>
            <div className="mt-12">
                {brukNyInngang ? (
                    <FullforRegistreringKnappNyInngang
                        skjemaState={skjemaState}
                        onSubmit={onSubmit}
                        onValiderSkjema={onValiderSkjema}
                        tekst={tekst}
                    />
                ) : (
                    <FullforRegistreringKnapp
                        skjemaState={skjemaState}
                        onSubmit={onSubmit}
                        onValiderSkjema={onValiderSkjema}
                    />
                )}
            </div>
        </>
    );
};

export default OppsummeringUtenPlikter;
