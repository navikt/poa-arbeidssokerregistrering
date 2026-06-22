import type { Sprak } from '@navikt/arbeidssokerregisteret-utils';

export const tilSprakUrlEkstern = (url: string, sprak: Sprak) => {
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
    return `${url}${sprakUrl}`;
};

export const tilSprakUrlIntern = (path: string, sprak: Sprak) => {
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
    return `${sprakUrl}${path}`;
};
