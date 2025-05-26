'use client';

import { ConfigProvider } from '@/contexts/config-context';
import { SkjemaStateProvider } from '@/app/opplysninger/provider';

export default function Layout({
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
