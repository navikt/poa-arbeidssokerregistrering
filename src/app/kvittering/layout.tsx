import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { hentKvitteringSidetittel } from '@/lib/skjema-sidetitler';

type Props = {
    children: ReactNode;
    params: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return { title: hentKvitteringSidetittel(lang ?? 'nb') };
}

export default function Layout({ children }: Props) {
    return <>{children}</>;
}
