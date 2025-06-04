import { Sprak } from '@navikt/arbeidssokerregisteret-utils';

export interface NextPageProps {
    params: Promise<{
        lang?: Sprak;
        side?: string;
    }>;
    searchParams: Promise<{
        [key: string]: string;
    }>;
}
