import { Heading, Panel } from '@navikt/ds-react';

import useSprak from '../../hooks/useSprak';

import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { hentTekst } from '../../model/sporsmal';

import styles from '../../styles/skjema.module.css';
import { SporsmalId, TilbakeIArbeid } from '@navikt/arbeidssokerregisteret-utils';

const TilbakeTilJobb = (props: SkjemaKomponentProps<TilbakeIArbeid>) => {
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);
    const { onChange, valgt, visFeilmelding } = props;

    const lagValg = (valg: TilbakeIArbeid) => ({ tekst: tekst(valg), value: valg });
    const valg = [
        lagValg(TilbakeIArbeid.JA_FULL_STILLING),
        lagValg(TilbakeIArbeid.JA_REDUSERT_STILLING),
        lagValg(TilbakeIArbeid.USIKKER),
        lagValg(TilbakeIArbeid.NEI),
    ];

    return (
        <Panel className={styles.panel} border={true}>
            <form>
                <Heading size="medium" spacing level="1">
                    Arbeidssituasjon
                </Heading>
                <RadioGruppe
                    legend={tekst(SporsmalId.tilbakeIArbeid)}
                    valg={valg}
                    onSelect={(val) => onChange(val)}
                    valgt={valgt}
                    visFeilmelding={visFeilmelding}
                />
            </form>
        </Panel>
    );
};

export default TilbakeTilJobb;
