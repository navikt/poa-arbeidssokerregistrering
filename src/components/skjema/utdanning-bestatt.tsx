import { Heading, Panel } from '@navikt/ds-react';
import Head from 'next/head';

import useSprak from '../../hooks/useSprak';

import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import { hentTekst, JaEllerNei, SporsmalId } from '../../model/sporsmal';

import styles from '../../styles/skjema.module.css';

const BestattUtdanning = (props: SkjemaKomponentProps<JaEllerNei>) => {
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);
    const { onChange, valgt, visFeilmelding } = props;
    const lagValg = (valg: JaEllerNei) => ({ tekst: tekst(valg), value: valg });
    const valg = [lagValg(JaEllerNei.JA), lagValg(JaEllerNei.NEI)];

    return (
        <>
            <Head>
                <title>Arbeidssøkerregistrering: Er utdanningen bestått</title>
            </Head>
            <Panel className={styles.panel} border={true}>
                <form>
                    <Heading size="medium" spacing level="1">
                        Utdanning
                    </Heading>
                    <RadioGruppe
                        legend={tekst(SporsmalId.utdanningBestatt)}
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

export default BestattUtdanning;
