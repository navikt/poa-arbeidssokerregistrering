import { Box, FormSummary } from '@navikt/ds-react';
import { lagHentTekstForSprak, SisteStillingValg, SporsmalId, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../../hooks/useSprak';

import { hentTekst } from '../../../model/sporsmal';
import { hentSkjemaside, SkjemaState } from '../../../model/skjema';

interface RadProps {
    radTittel: string;
    svaralternativ: string;
    url: string;
    key: string;
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
    },
};

const Rad = (props: RadProps) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    return (
        <Box className="mb-4">
            <FormSummary>
                <FormSummary.Header>
                    <FormSummary.Heading level="2">{props.radTittel}</FormSummary.Heading>
                    <FormSummary.EditLink href={props.url}>{tekst('endreSvaret')}</FormSummary.EditLink>
                </FormSummary.Header>
                <FormSummary.Answer className="pl-7 pt-4">
                    <FormSummary.Label>{props.radTittel}</FormSummary.Label>
                    <FormSummary.Value>{props.svaralternativ}</FormSummary.Value>
                </FormSummary.Answer>
            </FormSummary>
        </Box>
    );
};

interface Props {
    skjemaState: SkjemaState;
    skjemaPrefix: '/opplysninger/' | '/oppdater-opplysninger/';
}

const SvarTabell = (props: Props) => {
    const { skjemaState, skjemaPrefix } = props;
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <Box>
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
                                    sporsmalId === SporsmalId.sisteJobb ? svar.label : hentTekst(sprak, svar)
                                }
                                url={`${skjemaPrefix}${hentSkjemaside(sporsmalId as SporsmalId)}`}
                                key={sporsmalId}
                            />
                        ),
                )}
        </Box>
    );
};

export default SvarTabell;
