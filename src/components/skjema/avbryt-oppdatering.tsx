import { XMarkIcon } from '@navikt/aksel-icons';
import { lagHentTekstForSprak, type Sprak } from '@navikt/arbeidssokerregisteret-utils';
import { Link } from '@navikt/ds-react';
import { useConfig } from '@/contexts/config-context';
import { tilSprakUrl } from '@/lib/til-sprak-url';
import type { Config } from '@/model/config';

interface Props {
    sprak: Sprak;
}

const TEKSTER = {
    nb: {
        avbryt: 'Avbryt oppdatering',
    },
    nn: {
        avbryt: 'Avbryt oppdatering',
    },
    en: {
        avbryt: 'Cancel update',
    },
};

function AvbrytOppdatering(props: Props) {
    const tekst = lagHentTekstForSprak(TEKSTER, props.sprak);
    const { arbeidssoekerregisteretUrl } = useConfig() as Config;
    return (
        <Link href={tilSprakUrl(arbeidssoekerregisteretUrl, props.sprak)}>
            {' '}
            {tekst('avbryt')}
            <XMarkIcon title="a11y-title" fontSize="1.5rem" />
        </Link>
    );
}

export default AvbrytOppdatering;
