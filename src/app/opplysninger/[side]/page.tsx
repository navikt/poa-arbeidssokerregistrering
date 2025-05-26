import Skjema from '@/app/opplysninger/[side]/skjema';
import { NextPageProps } from '@/types/next';

export default async function SkjemaSide({ params }: NextPageProps) {
    const { side } = await params;
    return <Skjema side={side} />;
}
