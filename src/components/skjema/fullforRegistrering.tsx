import { useCallback, useState } from 'react';
import { Alert, Button, ConfirmationPanel, GuidePanel, Heading, ReadMore } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import { logger } from '@navikt/next-logger';
import Head from 'next/head';

import useSprak from '../../hooks/useSprak';
import { useConfig } from '../../contexts/config-context';
import { useFeatureToggles } from '../../contexts/featuretoggle-context';

import { lagHentTekstForSprak, Tekster, DinSituasjon, SporsmalId } from '@navikt/arbeidssokerregisteret-utils';
import { Side, SkjemaState } from '../../model/skjema';
import { fetcher as api } from '../../lib/api-utils';
import byggFullforRegistreringPayload from '../../lib/bygg-fullfor-registrering-payload';
import { FeilmeldingGenerell } from '../feilmeldinger/feilmeldinger';
import { FullforRegistreringResponse, Innsatsgruppe } from '../../model/registrering';
import hentKvitteringsUrl from '../../lib/hent-kvitterings-url';
import { loggAktivitet, loggEksperiment, loggFlyt } from '../../lib/amplitude';
import guidePanelStyles from '../../styles/guidepanel.module.css';
import PlikterSvg from '../forsiden/plikter-svg';
import { Config } from '../../model/config';
import { hentRegistreringFeiletUrl } from '../../lib/hent-registrering-feilet-url';
import { OppgaveRegistreringstype } from '../../model/feilsituasjonTyper';
import byggOpplysningerPayload from '../../lib/bygg-opplysninger-payload';
import FullforRegistreringKnappNyInngang from './fullfor-registrering-knapp-ny-inngang';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Fullfør registreringen',
        naarDuFullforer: 'Når du fullfører, godtar du kravene under fra NAV. Du må',
        sendeMeldekort: 'sende meldekort hver 14. dag',
        registrereCV: 'registrere CV-en din og holde den oppdatert',
        aktivJobbsoker: 'være en aktiv jobbsøker',
        brukeAktivitetsplan: 'bruke aktivitetsplanen din',
        lesMer: 'Les mer om kravene',
        okonomi: 'Økonomi',
        okonomiInfo:
            'Hvis du skal søke om dagpenger eller annen støtte fra NAV, må du gjøre det i en egen søknad ' +
            'etter at du har fullført registreringen. For å motta støtte, må du oppfylle kravene NAV stiller.',
        meldekort: 'Meldekort',
        meldekortInfo:
            'For å få oppfølging og støtte må du hver 14. dag melde fra at du fortsatt ønsker å være registrert som arbeidssøker. ' +
            'Dette gjør du ved å sende meldekort. Sender du meldekort for sent, kan det føre til at utbetalingen din blir redusert eller stanset.',
        aktivitetsplan: 'Aktivitetsplanen',
        aktivitetsplanInfo:
            'I aktivitetsplanen kan du holde orden på aktiviteter du gjør i samarbeid med NAV. ' +
            'Du kan også kommunisere med veilederen din. Når du fullfører registreringen, vil det ligge oppgaver til deg i aktivitetsplanen.',
        CV: 'CV',
        CVInfo:
            'Når du fullfører registreringen, vil du få en oppgave i aktivitetsplanen om at du må fylle ut CV-en din. ' +
            'Det er viktig at du holder CV-en din oppdatert slik at NAV kan bistå deg med å komme i arbeid. ',
        lestOgForstaatt: 'Jeg har lest og forstått kravene',
        lestKravFeilmelding: 'Du må huke av at du har lest og forstått kravene for å kunne fullføre registreringen.',
        fullfoerRegistrering: 'Fullfør',
    },
};

interface FullforProps {
    skjemaState: SkjemaState;
    side: Side;
    onSubmit(): void;
}

const beregnTidBrukt = (skjemaState: SkjemaState) => {
    if (!skjemaState.startTid) {
        return;
    }

    return (Date.now() - skjemaState.startTid) / 1000;
};

const hentProfilering = async (response: FullforRegistreringResponse, side: Side) => {
    if (!response.type && side === 'standard') {
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

export const FullforRegistreringKnapp = (props: FullforKnappProps) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const [senderSkjema, settSenderSkjema] = useState<boolean>(false);
    const [visFeilmelding, settVisFeilmelding] = useState<boolean>(false);
    const [visFeilmeldingTeller, settVisFeilmeldingTeller] = useState<number>(0);
    const router = useRouter();
    const { toggles } = useFeatureToggles();
    const { dittNavUrl } = useConfig() as Config;

    const { skjemaState, onSubmit, onValiderSkjema } = props;

    const validerOgFullfor = () => {
        if (onValiderSkjema()) {
            return fullforRegistrering();
        }
    };

    const fullforRegistrering = useCallback(async () => {
        try {
            const body = byggFullforRegistreringPayload(skjemaState, props.side);
            settSenderSkjema(true);
            settVisFeilmelding(false);
            onSubmit();

            const response: FullforRegistreringResponse = await api('api/fullforregistrering', {
                method: 'post',
                body: JSON.stringify(body),
            });

            const feiltype = response.type;

            if (feiltype) {
                loggFlyt({ hendelse: 'Får ikke fullført registreringen', aarsak: feiltype });
                return router.push(hentRegistreringFeiletUrl(feiltype, OppgaveRegistreringstype.REGISTRERING));
            }

            const profilering = await hentProfilering(response, props.side);
            const dinSituasjon = skjemaState[SporsmalId.dinSituasjon];
            const erStandardInnsatsgruppe = profilering && profilering.innsatsgruppe === Innsatsgruppe.STANDARD_INNSATS;
            const harMistetJobbSagtOppEllerPermittert =
                dinSituasjon &&
                [DinSituasjon.MISTET_JOBBEN, DinSituasjon.ER_PERMITTERT, DinSituasjon.HAR_SAGT_OPP].includes(
                    dinSituasjon,
                );

            const skalHoppeOverKvittering =
                erStandardInnsatsgruppe &&
                harMistetJobbSagtOppEllerPermittert &&
                toggles['arbeidssokerregistrering.eksperimenter.videresend-til-aia'];

            loggAktivitet({
                aktivitet: 'Utfylling av skjema fullført',
                tidBruktForAaFullforeSkjema: beregnTidBrukt(skjemaState),
                innsatsgruppe: profilering ? profilering.innsatsgruppe : 'IKKE_PROFILERT',
            });

            loggFlyt({ hendelse: 'Sender inn skjema for registrering' });

            if (skalHoppeOverKvittering) {
                loggEksperiment({
                    eksperiment: 'Videresender til AiA',
                    innsatsgruppe: profilering.innsatsgruppe,
                    situasjon: dinSituasjon,
                });
                loggFlyt({ hendelse: 'Registrering fullført' });

                return router.push(`${dittNavUrl}?goTo=registrering&aia.aktivTab=ytelse`);
            }
            return router.push(hentKvitteringsUrl(props.side));
        } catch (e) {
            settVisFeilmeldingTeller(visFeilmeldingTeller + 1);
            settVisFeilmelding(true);
            logger.error(e, `Registrering (${props.side}) feilet`);
            if (visFeilmeldingTeller >= 3) {
                return router.push('/feil/');
            }
        } finally {
            settSenderSkjema(false);
        }
    }, [onSubmit, props.side, router, skjemaState, visFeilmeldingTeller]);

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

const FullforRegistrering = (props: FullforProps) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const [lestKravChecked, setLestKravChecked] = useState<boolean>(false);
    const [visFeilmeldingLestKrav, settVisFeilmeldingLestKrav] = useState<boolean>(false);
    const { skjemaState, onSubmit, side } = props;

    const { toggles } = useFeatureToggles();
    const brukNyInngang = toggles['arbeidssokerregistrering.bruk-ny-inngang'];

    const onValiderSkjema = () => {
        if (!lestKravChecked) {
            settVisFeilmeldingLestKrav(true);
            return false;
        }

        return true;
    };

    return (
        <>
            <Head>
                <title>Arbeidssøkerregistrering: Fullfør registreringen</title>
            </Head>
            <div style={{ width: '100%' }}>
                <Heading size={'large'} level={'1'} className="text-center mb-6">
                    {tekst('tittel')}
                </Heading>
                <GuidePanel className={`${guidePanelStyles.plikter} mb-6`} poster illustration={<PlikterSvg />}>
                    <Heading level={'2'} size={'xsmall'}>
                        {tekst('naarDuFullforer')}
                    </Heading>
                    <ul className="list-disc px-8 my-4">
                        <li> {tekst('sendeMeldekort')} </li>
                        <li>{tekst('registrereCV')}</li>
                        <li>{tekst('aktivJobbsoker')}</li>
                        <li>{tekst('brukeAktivitetsplan')}</li>
                    </ul>
                </GuidePanel>
                <ReadMore header={tekst('lesMer')}>
                    <ul className="list-disc px-8">
                        <li className="mb-4">
                            <Heading level={'3'} size={'xsmall'}>
                                {tekst('okonomi')}
                            </Heading>
                            {tekst('okonomiInfo')}
                        </li>
                        <li className="mb-4">
                            <Heading level={'3'} size={'xsmall'}>
                                {tekst('meldekort')}
                            </Heading>
                            {tekst('meldekortInfo')}
                        </li>
                        <li className="mb-4">
                            <Heading level={'3'} size={'xsmall'}>
                                {tekst('aktivitetsplan')}
                            </Heading>
                            {tekst('aktivitetsplanInfo')}
                        </li>
                        <li>
                            <Heading level={'3'} size={'xsmall'}>
                                {tekst('CV')}
                            </Heading>
                            {tekst('CVInfo')}
                        </li>
                    </ul>
                </ReadMore>
                <ConfirmationPanel
                    checked={lestKravChecked}
                    onChange={() => {
                        settVisFeilmeldingLestKrav(false);
                        setLestKravChecked(!lestKravChecked);
                    }}
                    label={tekst('lestOgForstaatt')}
                    className="my-8"
                />

                {visFeilmeldingLestKrav && (
                    <div className="mb-6">
                        <Alert variant={'warning'}>{tekst('lestKravFeilmelding')}</Alert>
                    </div>
                )}

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
                        side={side}
                        onSubmit={onSubmit}
                        onValiderSkjema={onValiderSkjema}
                    />
                )}
            </div>
        </>
    );
};

export default FullforRegistrering;
