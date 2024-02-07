import { useCallback, useState } from 'react';
import { GuidePanel, Heading, Ingress, Table, Button } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import { logger } from '@navikt/next-logger';
import NextLink from 'next/link';
import Head from 'next/head';
import useSWR from 'swr';
import { SisteStillingValg, SporsmalId, lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../../hooks/useSprak';

import { hentTekst } from '../../../model/sporsmal';
import OppsummeringSvg from './oppsummering-svg';
import { hentSkjemaside, SkjemaState } from '../../../model/skjema';
import { fetcher as api } from '../../../lib/api-utils';
import byggFullforRegistreringPayload from '../../../lib/bygg-fullfor-registrering-payload';
import { FeilmeldingGenerell } from '../../feilmeldinger/feilmeldinger';
import { FullforRegistreringResponse } from '../../../model/registrering';
import hentKvitteringsUrl from '../../../lib/hent-kvitterings-url';
import { loggAktivitet, loggFlyt } from '../../../lib/amplitude';
import { hentRegistreringFeiletUrl } from '../../../lib/hent-registrering-feilet-url';
import { OppgaveRegistreringstype } from '../../../model/feilsituasjonTyper';

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
        [SporsmalId.dinSituasjon + 'radTittel']: 'Situasjon',
        [SporsmalId.sisteJobb + 'radTittel']: 'Siste stilling',
        [SporsmalId.fremtidigSituasjon + 'radTittel']: 'Fremtidig situasjon',
        [SporsmalId.tilbakeIArbeid + 'radTittel']: 'Tilbake i jobb før sykmeldt i 52 uker',
        [SporsmalId.utdanning + 'radTittel']: 'Høyeste fullførte utdanning',
        [SporsmalId.utdanningGodkjent + 'radTittel']: 'Utdanning godkjent i Norge',
        [SporsmalId.utdanningBestatt + 'radTittel']: 'Utdanning bestått',
        [SporsmalId.helseHinder + 'radTittel']: 'Helseproblemer',
        //TODO: Hvilken av andre forhold-tekstene skal vi bruke i oppsummeringen?
        [SporsmalId.andreForhold + 'radTittel']: 'Andre problemer',
        [SporsmalId.andreForhold + 'radTittel']: 'Andre hensyn',
        fullfoerRegistrering: 'Fullfør registrering som arbeidssøker',
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
    skjemaPrefix: '/skjema/' | '/sykmeldt/' | '/opplysninger/';
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
            <Ingress className="mb-6">{tekst('ingress')}</Ingress>
            <GuidePanel poster illustration={<OppsummeringSvg />}>
                {skjemaPrefix === '/opplysninger/' && (
                    <p>
                        {startRegistreringData && startRegistreringData.jobbetSeksAvTolvSisteManeder
                            ? tekst('harJobbetSisteAaret')
                            : tekst('ikkeIJobbSisteAaret')}
                    </p>
                )}
                <Table>
                    <Table.Body>
                        {Object.entries(skjemaState)
                            .filter(([sporsmalId]) => {
                                const filtrerVekkSporsmalId = [SporsmalId.sisteStilling, 'startTid'];

                                if (skjemaState[SporsmalId.sisteStilling] === SisteStillingValg.HAR_IKKE_HATT_JOBB) {
                                    filtrerVekkSporsmalId.push(SporsmalId.sisteJobb);
                                }

                                return !filtrerVekkSporsmalId.includes(sporsmalId);
                            })
                            .map(
                                ([sporsmalId, svar]) =>
                                    svar && (
                                        <Rad
                                            radTittel={tekst(sporsmalId + 'radTittel')}
                                            svaralternativ={
                                                sporsmalId === SporsmalId.sisteJobb
                                                    ? svar.label
                                                    : hentTekst(sprak, svar)
                                            }
                                            url={`${skjemaPrefix}${hentSkjemaside(sporsmalId as SporsmalId)}`}
                                            key={sporsmalId}
                                        />
                                    ),
                            )}
                    </Table.Body>
                </Table>
            </GuidePanel>
            <div className="mt-12">
                <FullforRegistreringKnapp
                    skjemaState={skjemaState}
                    onSubmit={onSubmit}
                    onValiderSkjema={onValiderSkjema}
                />
            </div>
        </>
    );
};

interface RadProps {
    radTittel: string;
    svaralternativ: string;
    url: string;
    key: string;
}

const Rad = (props: RadProps) => {
    return (
        <Table.Row>
            <Table.HeaderCell scope="row">{props.radTittel}</Table.HeaderCell>
            <Table.DataCell>{props.svaralternativ}</Table.DataCell>
            <Table.DataCell>
                <NextLink
                    href={props.url}
                    locale={false}
                    aria-label={`Endre svaret på ${props.radTittel.toLowerCase()}`}
                    className={'navds-link'}
                >
                    Endre svaret
                </NextLink>
            </Table.DataCell>
        </Table.Row>
    );
};

export default OppsummeringUtenPlikter;
