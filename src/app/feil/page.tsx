import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import type { NextPageProps } from '@/types/next';

export default async function Page({ params }: NextPageProps) {
    const { lang } = await params;
    return (
        <>
            <SettSprakIDekorator sprak={lang ?? 'nb'} />
            <FeilmeldingGenerell />
        </>
    );
}
