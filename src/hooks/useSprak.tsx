import { useRouter } from 'next/navigation';
import { erStottetSprak, Sprak } from '@navikt/arbeidssokerregisteret-utils';

const useSprak = (): Sprak => {
    // const { locale } = useRouter() || { locale: 'nb' }; // TODO
    const locale = 'nb';
    return erStottetSprak(locale) ? locale : 'nb';
};

export default useSprak;
