import useSprak from '../../../hooks/useSprak';

import RadioGruppe from '../../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from '../skjema-felleskomponenter';
import { hentTekst } from '../../../model/sporsmal';
import { SisteStillingValg } from '@navikt/arbeidssokerregisteret-utils';
import { SkjemaBox } from '../skjema-box';

const SisteStilling = (props: SkjemaKomponentProps<SisteStillingValg>) => {
    const { onChange, visFeilmelding } = props;
    let sprak = useSprak();

    const valg = [
        { tekst: hentTekst(sprak, SisteStillingValg.HAR_HATT_JOBB), value: SisteStillingValg.HAR_HATT_JOBB },
        { tekst: hentTekst(sprak, SisteStillingValg.HAR_IKKE_HATT_JOBB), value: SisteStillingValg.HAR_IKKE_HATT_JOBB },
    ];

    return (
        <SkjemaBox>
            <RadioGruppe
                valg={valg}
                valgt={props.valgt}
                onSelect={(val) => onChange(val)}
                visFeilmelding={visFeilmelding}
            />
        </SkjemaBox>
    );
};

export default SisteStilling;
