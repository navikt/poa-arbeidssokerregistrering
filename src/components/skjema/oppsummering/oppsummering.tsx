import { GuidePanel, Heading, Ingress, Table } from '@navikt/ds-react';
import NextLink from 'next/link';
import Head from 'next/head';
import useSWR from 'swr';

import { hentTekst } from '../../../model/sporsmal';
import OppsummeringSvg from './oppsummering-svg';
import { lagHentTekstForSprak, Tekster, SisteStillingValg, SporsmalId } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../../hooks/useSprak';
import { hentSkjemaside, SkjemaState } from '../../../model/skjema';
import { fetcher } from '../../../lib/api-utils';

const TEKSTER: Tekster<string> = {
    nb: {
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
    },
};

interface OppsummeringProps {
    skjemaState: SkjemaState;
    skjemaPrefix: '/skjema/' | '/sykmeldt/' | '/opplysninger/';
}

const Oppsummering = ({ skjemaState, skjemaPrefix }: OppsummeringProps) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const { data: startRegistreringData, error } = useSWR('/api/startregistrering', fetcher);

    return (
        <>
            <Head>
                <title>Arbeidssøkerregistrering: Gjennomgang av opplysninger</title>
            </Head>
            <Heading size={'medium'} level="1" spacing>
                {tekst('header')}
            </Heading>
            <Ingress className="mb-6">{tekst('ingress')}</Ingress>
            <GuidePanel poster illustration={<OppsummeringSvg />}>
                {skjemaPrefix === '/skjema/' && (
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
                    aria-label={`Endre svaret på ${props.radTittel.toLowerCase()}`}
                    className={'navds-link'}
                >
                    Endre svaret
                </NextLink>
            </Table.DataCell>
        </Table.Row>
    );
};

export default Oppsummering;
