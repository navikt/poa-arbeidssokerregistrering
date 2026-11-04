import { lagHentTekstForSprak, SisteStillingValg, type Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../../hooks/useSprak';
import { hentTekst } from '../../../model/sporsmal';
import RadioGruppe from '../../radio-gruppe/radio-gruppe';
import { SkjemaBox } from '../skjema-box';
import type { SkjemaKomponentProps } from '../skjema-felleskomponenter';

const TEKSTER: Tekster<string> = {
    nb: {
        legend: 'Har du hatt jobb?',
    },
    nn: {
        legend: 'Har du hatt jobb?',
    },
    en: {
        legend: 'Have you had a job?',
    },
};

const SisteStilling = (props: SkjemaKomponentProps<SisteStillingValg>) => {
    const { onChange, visFeilmelding } = props;
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    const valg = [
        { tekst: hentTekst(sprak, SisteStillingValg.HAR_HATT_JOBB), value: SisteStillingValg.HAR_HATT_JOBB },
        { tekst: hentTekst(sprak, SisteStillingValg.HAR_IKKE_HATT_JOBB), value: SisteStillingValg.HAR_IKKE_HATT_JOBB },
    ];

    return (
        <SkjemaBox>
            <RadioGruppe
                valg={valg}
                legend={tekst('legend')}
                valgt={props.valgt}
                onSelect={(val) => onChange(val)}
                visFeilmelding={visFeilmelding}
            />
        </SkjemaBox>
    );
};

export default SisteStilling;
