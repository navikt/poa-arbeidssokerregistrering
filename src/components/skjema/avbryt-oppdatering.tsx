import { XMarkIcon } from '@navikt/aksel-icons';
import { lagHentTekstForSprak, type Sprak } from '@navikt/arbeidssokerregisteret-utils';
import { Link } from '@navikt/ds-react';
import { useConfig } from '@/contexts/config-context';
import type { Config } from '@/model/config';

interface Props {
    sprak: Sprak;
}

export const tilSprakSensitivUrl = (url: string, sprak: Sprak) => {
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
    return `${url}${sprakUrl}`;
};

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
        <Link href={tilSprakSensitivUrl(arbeidssoekerregisteretUrl, props.sprak)}>
            {' '}
            {tekst('avbryt')}
            <XMarkIcon title="a11y-title" fontSize="1.5rem" />
        </Link>
    );
}

export default AvbrytOppdatering;
