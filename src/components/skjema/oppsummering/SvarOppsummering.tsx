'use client';

import { Box, FormSummary } from '@navikt/ds-react';
import NextLink from 'next/link';
import {
    DinSituasjon,
    lagHentTekstForSprak,
    SisteStillingValg,
    SporsmalId,
    Tekster,
} from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../../hooks/useSprak';

import { hentTekst } from '@/model/sporsmal';
import { hentSkjemaside, SkjemaState } from '@/model/skjema';
import { loggAktivitet } from '@/lib/amplitude';

type Svar = {
    spoersmal: string;
    svaralternativ: string;
    key: string;
};

interface OppsummeringProps {
    tittel: string;
    url: string;
    key: string;
    alternativer: Svar[];
}

const TEKSTER: Tekster<string> = {
    nb: {
        [SporsmalId.dinSituasjon + 'radTittel']: 'Situasjon',
        [SporsmalId.sisteJobb + 'radTittel']: 'Siste stilling',
        [SporsmalId.utdanning + 'radTittel']: 'Høyeste fullførte utdanning',
        [SporsmalId.utdanningGodkjent + 'radTittel']: 'Utdanning godkjent i Norge',
        [SporsmalId.utdanningBestatt + 'radTittel']: 'Utdanning bestått',
        [SporsmalId.helseHinder + 'radTittel']: 'Helseproblemer',
        //TODO: Hvilken av andre forhold-tekstene skal vi bruke i oppsummeringen?
        [SporsmalId.andreForhold + 'radTittel']: 'Andre problemer',
        [SporsmalId.andreForhold + 'radTittel']: 'Andre hensyn',
        endreSvaret: 'Endre svaret',
        SITUASJON: 'Situasjon',
        STILLING: 'Siste stilling',
        UTDANNING: 'Utdanning',
        HINDRINGER: 'Hindringer',
    },
    nn: {
        [SporsmalId.dinSituasjon + 'radTittel']: 'Situasjon',
        [SporsmalId.sisteJobb + 'radTittel']: 'Siste stilling',
        [SporsmalId.utdanning + 'radTittel']: 'Høgaste fullførte utdanning',
        [SporsmalId.utdanningGodkjent + 'radTittel']: 'Utdanning godkjent i Norge',
        [SporsmalId.utdanningBestatt + 'radTittel']: 'Utdanning bestått',
        [SporsmalId.helseHinder + 'radTittel']: 'Helseproblem',
        //TODO: Hvilken av andre forhold-tekstene skal vi bruke i oppsummeringen?
        [SporsmalId.andreForhold + 'radTittel']: 'Andre problem',
        [SporsmalId.andreForhold + 'radTittel']: 'Andre omsyn',
        SITUASJON: 'Situasjon',
        STILLING: 'Siste stilling',
        UTDANNING: 'Utdanning',
        HINDRINGER: 'Hindringar',
    },
    en: {
        [SporsmalId.dinSituasjon + 'radTittel']: 'Situation',
        [SporsmalId.sisteJobb + 'radTittel']: 'Last position',
        [SporsmalId.utdanning + 'radTittel']: 'Highest completed education',
        [SporsmalId.utdanningGodkjent + 'radTittel']: 'Education approved in Norway',
        [SporsmalId.utdanningBestatt + 'radTittel']: 'Education completed and passed',
        [SporsmalId.helseHinder + 'radTittel']: 'Health problems',
        [SporsmalId.andreForhold + 'radTittel']: 'Other considerations',
        endreSvaret: 'Change your reply',
        SITUASJON: 'Situation',
        STILLING: 'Last position',
        UTDANNING: 'Education',
        HINDRINGER: 'Challenges',
    },
};

enum TOPLEVEL_VALUES {
    situasjon = 'SITUASJON',
    stilling = 'STILLING',
    utdanning = 'UTDANNING',
    hindringer = 'HINDRINGER',
}

const toplevels = {
    [SporsmalId.dinSituasjon]: TOPLEVEL_VALUES.situasjon,
    [SporsmalId.sisteJobb]: TOPLEVEL_VALUES.stilling,
    [SporsmalId.sisteStilling]: TOPLEVEL_VALUES.stilling,
    [SporsmalId.utdanning]: TOPLEVEL_VALUES.utdanning,
    [SporsmalId.utdanningGodkjent]: TOPLEVEL_VALUES.utdanning,
    [SporsmalId.utdanningBestatt]: TOPLEVEL_VALUES.utdanning,
    [SporsmalId.helseHinder]: TOPLEVEL_VALUES.hindringer,
    [SporsmalId.andreForhold]: TOPLEVEL_VALUES.hindringer,
};

interface OppsummeringsInterface {
    [TOPLEVEL_VALUES.situasjon]?: OppsummeringProps;
    [TOPLEVEL_VALUES.stilling]?: OppsummeringProps;
    [TOPLEVEL_VALUES.utdanning]?: OppsummeringProps;
    [TOPLEVEL_VALUES.hindringer]?: OppsummeringProps;
}

const hentNivaa = (sporsmalId: SporsmalId) => toplevels[sporsmalId];

const Oppsummeringsboks = (props: OppsummeringProps) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    return (
        <Box className="mb-8">
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">{props.tittel}</FormSummary.Heading>
                    <FormSummary.EditLink as={'span'}>
                        <NextLink
                            href={props.url}
                            aria-label={`${tekst('endreSvaret')}: ${props.tittel.toLowerCase()}`}
                            className={'navds-link'}
                            onClick={() => {
                                loggAktivitet({
                                    aktivitet: 'Trykker på "Endre svar" fra oppsummering',
                                    steg: props.tittel,
                                    skjemaPrefix: props.url.split('/')[1],
                                });
                            }}
                        >
                            {tekst('endreSvaret')}
                        </NextLink>
                    </FormSummary.EditLink>
                </FormSummary.Header>
                {props.alternativer.map((alternativ) => {
                    return (
                        alternativ.svaralternativ && (
                            <FormSummary.Answer className="pl-7 py-4 !mb-0" key={alternativ.key}>
                                <FormSummary.Label>{alternativ.spoersmal}</FormSummary.Label>
                                <FormSummary.Value>{alternativ.svaralternativ}</FormSummary.Value>
                            </FormSummary.Answer>
                        )
                    );
                })}
            </FormSummary>
        </Box>
    );
};

interface Props {
    skjemaState: SkjemaState;
    skjemaPrefix: '/opplysninger/' | '/oppdater-opplysninger/';
}

const SvarOppsummering = (props: Props) => {
    const { skjemaState, skjemaPrefix } = props;
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const oppsummering = Object.entries(skjemaState)
        .filter(([sporsmalId]) => {
            const filtrerVekkSporsmalId = [SporsmalId.sisteStilling, 'startTid'];

            if (
                skjemaState[SporsmalId.sisteStilling] === SisteStillingValg.HAR_IKKE_HATT_JOBB ||
                skjemaState[SporsmalId.dinSituasjon] === DinSituasjon.ALDRI_HATT_JOBB
            ) {
                filtrerVekkSporsmalId.push(SporsmalId.sisteJobb);
            }

            return !filtrerVekkSporsmalId.includes(sporsmalId);
        })
        .reduce((oppsummering, [sporsmalId, svar]) => {
            const nivaa = hentNivaa(sporsmalId as SporsmalId);
            const denne = oppsummering[nivaa];
            const alternativ = {
                spoersmal: tekst(`${sporsmalId}radTittel`),
                svaralternativ: sporsmalId === SporsmalId.sisteJobb ? svar.label : hentTekst(sprak, svar),
                key: sporsmalId,
            };
            if (denne !== undefined) {
                denne.alternativer.push(alternativ);
            } else {
                oppsummering[nivaa] = {
                    tittel: tekst(nivaa),
                    url: `${skjemaPrefix}${hentSkjemaside(sporsmalId as SporsmalId)}`,
                    key: nivaa,
                    alternativer: [alternativ],
                };
            }
            return oppsummering;
        }, {} as OppsummeringsInterface);

    return (
        <Box>
            {Object.values(oppsummering).map((oppfoering) => {
                const { tittel, url, key, alternativer } = oppfoering as OppsummeringProps;
                return <Oppsummeringsboks tittel={tittel} url={url} alternativer={alternativer} key={key} />;
            })}
        </Box>
    );
};

export default SvarOppsummering;
