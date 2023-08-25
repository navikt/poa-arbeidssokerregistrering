import { Heading, Panel } from '@navikt/ds-react';

import useSprak from '../../hooks/useSprak';

import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { FremtidigSituasjon, hentTekst, SporsmalId } from '../../model/sporsmal';

import styles from '../../styles/skjema.module.css';

const SykmeldtFremtidigSituasjon = (props: SkjemaKomponentProps<FremtidigSituasjon>) => {
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);
    const { onChange, valgt, visFeilmelding } = props;

    const lagValg = (valg: FremtidigSituasjon) => ({ tekst: tekst(valg), value: valg });
    const valg = [
        lagValg(FremtidigSituasjon.SAMME_ARBEIDSGIVER),
        lagValg(FremtidigSituasjon.SAMME_ARBEIDSGIVER_NY_STILLING),
        lagValg(FremtidigSituasjon.NY_ARBEIDSGIVER),
        lagValg(FremtidigSituasjon.USIKKER),
        lagValg(FremtidigSituasjon.INGEN_PASSER),
    ];

    return (
        <Panel className={styles.panel} border={true}>
            <form>
                <Heading size="medium" spacing level="1">
                    Arbeidssituasjon
                </Heading>
                <RadioGruppe
                    legend={tekst(SporsmalId.fremtidigSituasjon)}
                    valg={valg}
                    onSelect={(val) => onChange(val)}
                    valgt={valgt}
                    visFeilmelding={visFeilmelding}
                />
            </form>
        </Panel>
    );
};

export default SykmeldtFremtidigSituasjon;
