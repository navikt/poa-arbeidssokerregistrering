'use client';

import Head from 'next/head';
import { lagHentTekstForSprak, SporsmalId, Tekster, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../hooks/useSprak';

import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import { hentTekst } from '../../model/sporsmal';
import { SkjemaBox } from './skjema-box';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Utdanningsnivå',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Høgaste fullførte utdanning',
    },
    en: {
        sideTittel: 'Register as a Job Seeker : Education',
    },
};

const Utdanning = (props: SkjemaKomponentProps<Utdanningsnivaa> & { children?: React.ReactNode }) => {
    const { onChange, valgt, visFeilmelding, children } = props;
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);
    const sideTekst = lagHentTekstForSprak(TEKSTER, sprak);

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
                <title>{sideTekst('sideTittel')}</title>
            </Head>
            <SkjemaBox>
                <form>
                    <RadioGruppe
                        legend={tekst(SporsmalId.utdanning)}
                        valg={valg}
                        onSelect={(val) => onChange(val)}
                        valgt={valgt}
                        visFeilmelding={visFeilmelding && !valgt}
                    />
                    {children}
                </form>
            </SkjemaBox>
        </>
    );
};

export default Utdanning;
