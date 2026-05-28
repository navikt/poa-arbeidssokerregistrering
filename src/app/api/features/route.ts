import { logger } from '@navikt/next-logger';
import { NextResponse } from 'next/server';
import { hentFeatures } from '@/app/api/features/hent-features';

export async function GET() {
    try {
        const definitions = await hentFeatures();
        return NextResponse.json(definitions.features || []);
    } catch (error) {
        logger.error(error);
        return NextResponse.json([]);
    }
}
