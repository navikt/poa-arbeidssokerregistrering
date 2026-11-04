import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { hentUnder18Sidetittel } from '@/lib/skjema-sidetitler';

type Props = {
    children: ReactNode;
    params: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return { title: hentUnder18Sidetittel(lang ?? 'nb') };
}

export default function Layout({ children }: Props) {
    return <>{children}</>;
}
