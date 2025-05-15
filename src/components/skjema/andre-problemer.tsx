import useSprak from '../../hooks/useSprak';

import { JaEllerNei, lagHentTekstForSprak, TeksterMedDefinerteNokler } from '@navikt/arbeidssokerregisteret-utils';
import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';

const TEKSTER: AndreProblemerTekster = {
    nb: {
        tittel: 'Har du andre problemer med å søke eller være i jobb?',
        ingress: 'For eksempel språk, lesing og skriving eller familiesituasjon.',
        JA: 'Ja',
        NEI: 'Nei',
    },
    nn: {
        tittel: 'Har du andre problem med å søkje eller vere i jobb?',
        ingress: 'Dette kan til dømes vere vanskar knytt til språk, lesing og skriving eller familiesituasjon',
        JA: 'Ja',
        NEI: 'Nei',
    },
    en: {
        tittel: 'Do you have other problems applying or being employed?',
        ingress: 'For example, language, reading or writing skills, or family situation.',
        JA: 'Yes',
        NEI: 'No',
    },
};

type AndreProblemerTekster = TeksterMedDefinerteNokler<'tittel' | 'ingress' | 'JA' | 'NEI', string>;

type AndreProblemerProps = SkjemaKomponentProps<JaEllerNei> & { skjematype: 'standard' };

const AndreProblemer = (props: AndreProblemerProps) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { onChange, valgt, visFeilmelding } = props;

    const lagValg = (valg: JaEllerNei) => ({ tekst: tekst(valg), value: valg });
    const valg = [lagValg(JaEllerNei.JA), lagValg(JaEllerNei.NEI)];

    return (
        <RadioGruppe
            legend={tekst('tittel')}
            beskrivelse={tekst('ingress')}
            valg={valg}
            onSelect={(val) => onChange(val)}
            valgt={valgt}
            visFeilmelding={visFeilmelding}
        />
    );
};

export default AndreProblemer;
