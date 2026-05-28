'use client';
import { erStottetSprak, type Sprak } from '@navikt/arbeidssokerregisteret-utils';
import { useParams } from 'next/navigation';

const useSprak = (): Sprak => {
    const lang = useParams<any>()?.lang;
    return erStottetSprak(lang) ? lang : 'nb';
};

export default useSprak;
