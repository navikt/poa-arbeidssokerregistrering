import { useRouter } from 'next/router';
import { erStottetSprak, Sprak } from '@navikt/arbeidssokerregisteret-utils';

const useSprak = (): Sprak => {
    const { locale } = useRouter() || { locale: 'nb' };
    return erStottetSprak(locale) ? locale : 'nb';
};

export default useSprak;
