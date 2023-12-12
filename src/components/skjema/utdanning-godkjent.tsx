import { Heading, Panel } from '@navikt/ds-react';
import Head from 'next/head';

import useSprak from '../../hooks/useSprak';

import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import { hentTekst, SporsmalId, UtdanningGodkjentValg } from '../../model/sporsmal';

import styles from '../../styles/skjema.module.css';

const UtdanningGodkjent = (props: SkjemaKomponentProps<UtdanningGodkjentValg>) => {
    const { onChange, valgt, visFeilmelding } = props;
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);

    const lagValg = (valg: UtdanningGodkjentValg) => ({ tekst: tekst(valg), value: valg });
    const valg = [
        lagValg(UtdanningGodkjentValg.JA),
        lagValg(UtdanningGodkjentValg.NEI),
        lagValg(UtdanningGodkjentValg.VET_IKKE),
    ];

    return (
        <>
            <Head>
                <title>Arbeidssøkerregistrering: Er utdanningen godkjent</title>
            </Head>
            <Panel className={styles.panel} border={true}>
                <form>
                    <Heading size="medium" spacing level="1">
                        Utdanning
                    </Heading>
                    <RadioGruppe
                        legend={tekst(SporsmalId.utdanningGodkjent)}
                        valg={valg}
                        onSelect={(val) => onChange(val)}
                        valgt={valgt}
                        visFeilmelding={visFeilmelding}
                    />
                </form>
            </Panel>
        </>
    );
};

export default UtdanningGodkjent;
