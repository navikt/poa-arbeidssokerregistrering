import { Heading, Panel } from '@navikt/ds-react';
import Head from 'next/head';
import { SporsmalId, UtdanningGodkjentValg, lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../hooks/useSprak';

import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import { hentTekst } from '../../model/sporsmal';

import styles from '../../styles/skjema.module.css';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Er utdanningen godkjent',
        heading: 'Utdanning',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Er utdanninga godkjend',
        heading: 'Utdanning',
    },
};

const UtdanningGodkjent = (props: SkjemaKomponentProps<UtdanningGodkjentValg>) => {
    const { onChange, valgt, visFeilmelding } = props;
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);
    const sideTekst = lagHentTekstForSprak(TEKSTER, sprak);

    const lagValg = (valg: UtdanningGodkjentValg) => ({ tekst: tekst(valg), value: valg });
    const valg = [
        lagValg(UtdanningGodkjentValg.JA),
        lagValg(UtdanningGodkjentValg.NEI),
        lagValg(UtdanningGodkjentValg.VET_IKKE),
    ];

    return (
        <>
            <Head>
                <title>{sideTekst('sideTittel')}</title>
            </Head>
            <Panel className={styles.panel} border={true}>
                <form>
                    <Heading size="medium" spacing level="1">
                        {sideTekst('heading')}
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
