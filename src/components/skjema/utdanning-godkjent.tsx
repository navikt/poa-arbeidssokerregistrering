import { SporsmalId, UtdanningGodkjentValg } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../hooks/useSprak';

import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import { hentTekst } from '../../model/sporsmal';

const UtdanningGodkjent = (props: SkjemaKomponentProps<UtdanningGodkjentValg> & { visKomponent: boolean }) => {
    const { onChange, valgt, visFeilmelding, visKomponent } = props;
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);

    const lagValg = (valg: UtdanningGodkjentValg) => ({ tekst: tekst(valg), value: valg });
    const valg = [
        lagValg(UtdanningGodkjentValg.JA),
        lagValg(UtdanningGodkjentValg.NEI),
        lagValg(UtdanningGodkjentValg.VET_IKKE),
    ];

    if (!visKomponent) {
        return null;
    }

    return (
        <RadioGruppe
            legend={tekst(SporsmalId.utdanningGodkjent)}
            valg={valg}
            onSelect={(val) => onChange(val)}
            valgt={valgt}
            visFeilmelding={visFeilmelding}
        />
    );
};

export default UtdanningGodkjent;
