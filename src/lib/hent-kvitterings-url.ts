import { Sprak } from '@navikt/arbeidssokerregisteret-utils';

export default function hentKvitteringsUrl(sprak: Sprak) {
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
    return `${sprakUrl}/kvittering/`;
}
