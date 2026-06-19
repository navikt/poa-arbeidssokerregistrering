import type { Sprak } from '@navikt/arbeidssokerregisteret-utils';

export const tilSprakUrl = (url: string, sprak: Sprak) => {
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
    return `${url}${sprakUrl}`;
};
