'use client';
import { useParams } from 'next/navigation';
import { erStottetSprak, Sprak } from '@navikt/arbeidssokerregisteret-utils';

const useSprak = (): Sprak => {
    const lang = useParams<any>()?.lang;
    return erStottetSprak(lang) ? lang : 'nb';
};

export default useSprak;
