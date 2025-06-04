import { redirect } from 'next/navigation';
import { NextPageProps } from '@/types/next';

export default async function Page({ params }: NextPageProps) {
    const lang = (await params).lang;
    const sprak = lang ?? 'nb';
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
    redirect(`${sprakUrl}/start`);
}
