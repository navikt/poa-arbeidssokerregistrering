import { Alert, Heading, Panel } from '@navikt/ds-react';
import Head from 'next/head';

import useSprak from '../../hooks/useSprak';

import { lagHentTekstForSprak, Tekster, JaEllerNei } from '@navikt/arbeidssokerregisteret-utils';
import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';

import styles from '../../styles/skjema.module.css';
import { SkjemaBox } from './skjema-box';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Helse',
        heading: 'Helse',
        tittel: 'Har du helseproblemer som hindrer deg i å søke eller være i jobb?',
        JA: 'Ja',
        NEI: 'Nei',
        fortellMer:
            'Svarer du ja, kan du fortelle mer til en veileder i en oppfølgingssamtale. Vi kontakter deg når du har registrert deg.',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Helse',
        heading: 'Helse',
        tittel: 'Har du helseproblem som hindrar deg i å søkje eller vere i jobb?',
        JA: 'Ja',
        NEI: 'Nei',
        fortellMer:
            'Svarer du ja, kan du utdjupe dette nærmare til ein rettleiar i ein oppfølgingssamtale. Vi kontaktar deg når du har registrert deg.',
    },
    en: {
        sideTittel: 'Register as a Job Seeker : Health',
        heading: 'Health',
        tittel: 'Do you have health problems that prevent you from applying or staying in a job?',
        JA: 'Yes',
        NEI: 'No',
        fortellMer:
            'If you answer yes, you can tell your NAV counsellor more in a follow-up interview. We will contact you once you have registered.',
    },
};

const Helseproblemer = (props: SkjemaKomponentProps<JaEllerNei>) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { onChange, valgt, visFeilmelding } = props;

    const lagValg = (valg: JaEllerNei) => ({ tekst: tekst(valg), value: valg });
    const valg = [lagValg(JaEllerNei.JA), lagValg(JaEllerNei.NEI)];

    return (
        <>
            <Head>
                <title>{tekst('sideTittel')}</title>
            </Head>
            <SkjemaBox>
                <form>
                    <Heading size="medium" spacing level="1">
                        {tekst('heading')}
                    </Heading>
                    <RadioGruppe
                        legend={tekst('tittel')}
                        valg={valg}
                        onSelect={(val) => onChange(val)}
                        valgt={valgt}
                        visFeilmelding={visFeilmelding}
                    />
                </form>
            </SkjemaBox>
            <Alert variant="info" inline={true} className={'mt-6'}>
                {tekst('fortellMer')}
            </Alert>
        </>
    );
};

export default Helseproblemer;
