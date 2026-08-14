import LoggVisning from '@/app/veiledning/registerdata/logg-visning';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import type { NextPageProps } from '@/types/next';
import { RegisteerdataVeiledningInnhold } from './innhold';

export default async function Registerdata({ params }: NextPageProps) {
    const { lang } = await params;
    const sprak = lang ?? 'nb';

    return (
        <>
            <SettSprakIDekorator sprak={sprak} />
            <LoggVisning />
            <RegisteerdataVeiledningInnhold sprak={sprak} />
        </>
    );
}
