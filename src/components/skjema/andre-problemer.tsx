import { Alert, Heading, Panel } from '@navikt/ds-react';
import Head from 'next/head';

import useSprak from '../../hooks/useSprak';

import { lagHentTekstForSprak, TeksterMedDefinerteNokler, JaEllerNei } from '@navikt/arbeidssokerregisteret-utils';
import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';

import styles from '../../styles/skjema.module.css';

const TEKSTER_STANDARD: AndreProblemerTekster = {
    nb: {
        tittel: 'Har du andre problemer med å søke eller være i jobb?',
        ingress: 'For eksempel språk, lesing og skriving eller familiesituasjon.',
        JA: 'Ja',
        NEI: 'Nei',
        fortellMer:
            'Svarer du ja, kan du fortelle mer til en veileder i en oppfølgingssamtale. Vi kontakter deg når du har registrert deg.',
    },
};

const TEKSTER_SYKMELDT: AndreProblemerTekster = {
    nb: {
        tittel: 'Er det noe annet enn helsen din som NAV bør ta hensyn til?',
        ingress: 'For eksempel språk, lesing og skriving eller familiesituasjon',
        JA: 'Ja',
        NEI: 'Nei',
        fortellMer: 'Svarer du ja, kan du fortelle mer til NAV-veilederen som tar kontakt med deg.',
    },
};

export type AndreProblemerTekster = TeksterMedDefinerteNokler<
    'tittel' | 'ingress' | 'JA' | 'NEI' | 'fortellMer',
    string
>;

type AndreProblemerProps = SkjemaKomponentProps<JaEllerNei> & { skjematype: 'standard' | 'sykmeldt' };

const AndreProblemer = (props: AndreProblemerProps) => {
    const TEKSTER = props.skjematype === 'standard' ? TEKSTER_STANDARD : TEKSTER_SYKMELDT;
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { onChange, valgt, visFeilmelding } = props;

    const lagValg = (valg: JaEllerNei) => ({ tekst: tekst(valg), value: valg });
    const valg = [lagValg(JaEllerNei.JA), lagValg(JaEllerNei.NEI)];

    return (
        <>
            <Head>
                <title>Arbeidssøkerregistrering: Andre utfordringer knyttet til arbeid</title>
            </Head>
            <Panel className={`${styles.panel} mb-6`} border={true}>
                <form>
                    <Heading size="medium" spacing level="1">
                        Andre utfordringer knyttet til arbeid
                    </Heading>
                    <RadioGruppe
                        legend={tekst('tittel')}
                        beskrivelse={tekst('ingress')}
                        valg={valg}
                        onSelect={(val) => onChange(val)}
                        valgt={valgt}
                        visFeilmelding={visFeilmelding}
                    />
                </form>
            </Panel>
            <Alert variant="info" inline={true}>
                {tekst('fortellMer')}
            </Alert>
        </>
    );
};

export default AndreProblemer;
