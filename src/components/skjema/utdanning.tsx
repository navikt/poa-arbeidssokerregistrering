import { Heading, Panel } from '@navikt/ds-react';
import Head from 'next/head';

import useSprak from '../../hooks/useSprak';

import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import { hentTekst } from '../../model/sporsmal';

import styles from '../../styles/skjema.module.css';
import { SporsmalId, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';

const Utdanning = (props: SkjemaKomponentProps<Utdanningsnivaa>) => {
    const { onChange, valgt, visFeilmelding } = props;
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);

    const valg = [
        { tekst: tekst(Utdanningsnivaa.INGEN_UTDANNING), value: Utdanningsnivaa.INGEN_UTDANNING },
        { tekst: tekst(Utdanningsnivaa.GRUNNSKOLE), value: Utdanningsnivaa.GRUNNSKOLE },
        {
            tekst: tekst(Utdanningsnivaa.VIDEREGAENDE_GRUNNUTDANNING),
            value: Utdanningsnivaa.VIDEREGAENDE_GRUNNUTDANNING,
        },
        {
            tekst: tekst(Utdanningsnivaa.VIDEREGAENDE_FAGBREV_SVENNEBREV),
            value: Utdanningsnivaa.VIDEREGAENDE_FAGBREV_SVENNEBREV,
        },
        { tekst: tekst(Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4), value: Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4 },
        {
            tekst: tekst(Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER),
            value: Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
        },
    ];

    return (
        <>
            <Head>
                <title>Arbeidssøkerregistrering: Utdanningsnivå</title>
            </Head>
            <Panel className={styles.panel} border={true}>
                <form>
                    <Heading size="medium" spacing level="1">
                        Utdanning
                    </Heading>
                    <RadioGruppe
                        legend={tekst(SporsmalId.utdanning)}
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

export default Utdanning;
