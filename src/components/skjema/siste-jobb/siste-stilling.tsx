import { Panel } from '@navikt/ds-react';

import useSprak from '../../../hooks/useSprak';

import RadioGruppe from '../../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from '../skjema-felleskomponenter';
import { hentTekst, SisteStillingValg } from '../../../model/sporsmal';

import styles from '../../../styles/skjema.module.css';

const SisteStilling = (props: SkjemaKomponentProps<SisteStillingValg>) => {
    const { onChange, visFeilmelding } = props;
    let sprak = useSprak();

    const valg = [
        { tekst: hentTekst(sprak, SisteStillingValg.HAR_HATT_JOBB), value: SisteStillingValg.HAR_HATT_JOBB },
        { tekst: hentTekst(sprak, SisteStillingValg.HAR_IKKE_HATT_JOBB), value: SisteStillingValg.HAR_IKKE_HATT_JOBB },
    ];

    return (
        <Panel className={`${styles.panel} mb-6`} border={true} style={{ backgroundColor: 'var(--a-gray-100)' }}>
            <RadioGruppe
                valg={valg}
                valgt={props.valgt}
                onSelect={(val) => onChange(val)}
                visFeilmelding={visFeilmelding}
            />
        </Panel>
    );
};

export default SisteStilling;
