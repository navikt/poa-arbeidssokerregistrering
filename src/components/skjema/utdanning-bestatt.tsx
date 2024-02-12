import { Heading, Panel } from '@navikt/ds-react';
import Head from 'next/head';
import { JaEllerNei, SporsmalId, lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../hooks/useSprak';

import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import { hentTekst } from '../../model/sporsmal';

import styles from '../../styles/skjema.module.css';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Er utdanningen bestått',
        heading: 'Utdanning',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Er utdanninga bestått',
        heading: 'Utdanning',
    },
    en: {
        sideTittel: 'Register as a Job Seeker : Education',
        heading: 'Education',
    },
};

const BestattUtdanning = (props: SkjemaKomponentProps<JaEllerNei>) => {
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);
    const sideTekst = lagHentTekstForSprak(TEKSTER, sprak);
    const { onChange, valgt, visFeilmelding } = props;
    const lagValg = (valg: JaEllerNei) => ({ tekst: tekst(valg), value: valg });
    const valg = [lagValg(JaEllerNei.JA), lagValg(JaEllerNei.NEI)];

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
