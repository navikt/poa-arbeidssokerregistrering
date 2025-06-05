import { NextPageProps } from '@/types/next';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';

export default async function Page({ params }: NextPageProps) {
    const { lang } = await params;
    return (
        <>
            <SettSprakIDekorator sprak={lang ?? 'nb'} />
            <FeilmeldingGenerell />
        </>
    );
}
