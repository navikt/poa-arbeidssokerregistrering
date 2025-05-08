import useSprak from '../../hooks/useSprak';

import { JaEllerNei, lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Har du helseproblemer som hindrer deg i å søke eller være i jobb?',
        JA: 'Ja',
        NEI: 'Nei',
    },
    nn: {
        tittel: 'Har du helseproblem som hindrar deg i å søkje eller vere i jobb?',
        JA: 'Ja',
        NEI: 'Nei',
    },
    en: {
        tittel: 'Do you have health problems that prevent you from applying or staying in a job?',
        JA: 'Yes',
        NEI: 'No',
    },
};

const Helseproblemer = (props: SkjemaKomponentProps<JaEllerNei>) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { onChange, valgt, visFeilmelding } = props;

    const lagValg = (valg: JaEllerNei) => ({ tekst: tekst(valg), value: valg });
    const valg = [lagValg(JaEllerNei.JA), lagValg(JaEllerNei.NEI)];

    return (
        <RadioGruppe
            legend={tekst('tittel')}
            valg={valg}
            onSelect={(val) => onChange(val)}
            valgt={valgt}
            visFeilmelding={visFeilmelding}
        />
    );
};

export default Helseproblemer;
