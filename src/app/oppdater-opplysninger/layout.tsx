'use client';

import { ConfigProvider } from '@/contexts/config-context';
import { SkjemaStateProvider } from '@/contexts/skjema-state-context';

export default function OppdaterOpplysningerLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ConfigProvider>
            <SkjemaStateProvider>{children}</SkjemaStateProvider>
        </ConfigProvider>
    );
}
