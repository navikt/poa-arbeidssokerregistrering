import LoggVisning from '@/app/veiledning/oppholdstillatelse/logg-visning';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import type { NextPageProps } from '@/types/next';
import { GenerellVeiledningInnhold } from './innhold';

export default async function Page({ params }: NextPageProps) {
    const { lang } = await params;
    const sprak = lang ?? 'nb';

    return (
        <>
            <LoggVisning />
            <SettSprakIDekorator sprak={sprak} />
            <GenerellVeiledningInnhold sprak={sprak} />
        </>
    );
}
