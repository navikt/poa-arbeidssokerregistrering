import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { hentSkjemaSidetittel } from '@/lib/skjema-sidetitler';

type Props = {
    children: ReactNode;
    params: Promise<{ side: string; lang?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { side, lang } = await params;
    return { title: hentSkjemaSidetittel(side, lang ?? 'nb', '/opplysninger/') };
}

export default function Layout({ children }: Props) {
    return <>{children}</>;
}
