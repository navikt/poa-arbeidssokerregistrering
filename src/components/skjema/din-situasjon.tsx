import { Heading } from '@navikt/ds-react';
import { preload } from 'swr';
import Head from 'next/head';
import {
    SporsmalId,
    DinSituasjon as Jobbsituasjon,
    lagHentTekstForSprak,
    Tekster,
} from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../hooks/useSprak';
import { useFeatureToggles } from '../../contexts/featuretoggle-context';

import RadioGruppe from '../radio-gruppe/radio-gruppe';
import { SkjemaKomponentProps } from './skjema-felleskomponenter';
import { hentTekst } from '../../model/sporsmal';
import { fetcher } from '../../lib/api-utils';

import { SkjemaBox } from './skjema-box';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Din arbeidssøkersituasjon',
        heading: 'Din arbeidssøkersituasjon',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Din situasjon som arbeidssøkjar',
        heading: 'Din situasjon som arbeidssøkjar',
    },
    en: {
        sideTittel: 'Register as a Job Seeker: Your jobseeker situation',
        heading: 'Your jobseeker situation',
    },
};

const DinSituasjon = (props: SkjemaKomponentProps<Jobbsituasjon>) => {
    const { onChange, valgt, visFeilmelding } = props;
    const { toggles } = useFeatureToggles();
    const sprak = useSprak();
    const tekst = (key: string) => hentTekst(sprak, key);
    const sideTekst = lagHentTekstForSprak(TEKSTER, sprak);
    const brukPamOntologi = toggles['arbeidssokerregistrering.bruk-pam-ontologi'];

    const valg = [
        { tekst: tekst(Jobbsituasjon.MISTET_JOBBEN), value: Jobbsituasjon.MISTET_JOBBEN },
        { tekst: tekst(Jobbsituasjon.HAR_SAGT_OPP), value: Jobbsituasjon.HAR_SAGT_OPP },
        { tekst: tekst(Jobbsituasjon.DELTIDSJOBB_VIL_MER), value: Jobbsituasjon.DELTIDSJOBB_VIL_MER },
        { tekst: tekst(Jobbsituasjon.ALDRI_HATT_JOBB), value: Jobbsituasjon.ALDRI_HATT_JOBB },
        { tekst: tekst(Jobbsituasjon.VIL_BYTTE_JOBB), value: Jobbsituasjon.VIL_BYTTE_JOBB },
        { tekst: tekst(Jobbsituasjon.JOBB_OVER_2_AAR), value: Jobbsituasjon.JOBB_OVER_2_AAR },
        { tekst: tekst(Jobbsituasjon.ER_PERMITTERT), value: Jobbsituasjon.ER_PERMITTERT },
        {
            tekst: tekst(Jobbsituasjon.USIKKER_JOBBSITUASJON),
            value: Jobbsituasjon.USIKKER_JOBBSITUASJON,
        },
        {
            tekst: tekst(Jobbsituasjon.AKKURAT_FULLFORT_UTDANNING),
            value: Jobbsituasjon.AKKURAT_FULLFORT_UTDANNING,
        },
        { tekst: tekst(Jobbsituasjon.VIL_FORTSETTE_I_JOBB), value: Jobbsituasjon.VIL_FORTSETTE_I_JOBB },
    ];

    // initialiser / cache data for rask tilgang i <SisteJobb>
    const sisteArbeidsforholdUrl = brukPamOntologi
        ? 'api/sistearbeidsforhold-fra-aareg-v2'
        : 'api/sistearbeidsforhold-fra-aareg';
    preload(sisteArbeidsforholdUrl, fetcher);

    return (
        <>
            <Head>
                <title>{sideTekst('sideTittel')}</title>
            </Head>
            <SkjemaBox>
                <form>
                    <Heading size="medium" spacing level="1">
                        {sideTekst('heading')}
                    </Heading>
                    <RadioGruppe
                        legend={tekst(SporsmalId.dinSituasjon)}
                        valg={valg}
                        onSelect={(val) => onChange(val)}
                        valgt={valgt}
                        visFeilmelding={visFeilmelding!}
                    />
                </form>
            </SkjemaBox>
        </>
    );
};

export default DinSituasjon;
