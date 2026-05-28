import { JaEllerNei, SporsmalId } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../hooks/useSprak';
import { hentTekst } from '../../model/sporsmal';
import RadioGruppe from '../radio-gruppe/radio-gruppe';
import type { SkjemaKomponentProps } from './skjema-felleskomponenter';

const BestattUtdanning = (props: SkjemaKomponentProps<JaEllerNei> & { visKomponent: boolean }) => {
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);
    const { onChange, valgt, visFeilmelding, visKomponent } = props;
    const lagValg = (valg: JaEllerNei) => ({ tekst: tekst(valg), value: valg });
    const valg = [lagValg(JaEllerNei.JA), lagValg(JaEllerNei.NEI)];

    if (!visKomponent) {
        return null;
    }

    return (
        <RadioGruppe
            legend={tekst(SporsmalId.utdanningBestatt)}
            valg={valg}
            onSelect={(val) => onChange(val)}
            valgt={valgt}
            visFeilmelding={visFeilmelding}
        />
    );
};

export default BestattUtdanning;
