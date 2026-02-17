import { NextResponse } from 'next/server';
import { Config } from '@/model/config';

export async function GET() {
    const config: Config = {
        dittNavUrl: process.env.NEXT_PUBLIC_DITTNAV_URL!,
        arbeidssoekerregisteretUrl: process.env.NEXT_PUBLIC_ARBEIDSSOEKERREGISTERET_URL!,
        dagpengesoknadUrl: process.env.NEXT_PUBLIC_DAGPENGESOKNAD_URL!,
        brukerdialogDagpengerUrl: process.env.NEXT_PUBLIC_BRUKERDIALOG_DAGPENGER_URL!,
        enableMock: process.env.NEXT_PUBLIC_ENABLE_MOCK!,
    };

    return NextResponse.json(config);
}
