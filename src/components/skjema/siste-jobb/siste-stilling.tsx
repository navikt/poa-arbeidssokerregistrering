import { SisteStillingValg } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../../hooks/useSprak';
import { hentTekst } from '../../../model/sporsmal';
import RadioGruppe from '../../radio-gruppe/radio-gruppe';
import { SkjemaBox } from '../skjema-box';
import type { SkjemaKomponentProps } from '../skjema-felleskomponenter';

const SisteStilling = (props: SkjemaKomponentProps<SisteStillingValg>) => {
    const { onChange, visFeilmelding } = props;
    const sprak = useSprak();

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
