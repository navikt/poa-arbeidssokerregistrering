import { NextResponse } from 'next/server';
import { logger } from '@navikt/next-logger';
import { getDefinitions } from '@unleash/nextjs';

const mockToggles = {
    version: 1,
    features: [
        {
            name: 'arbeidssoekerregistrering.redirect-forside',
            type: 'release',
            enabled: false,
            stale: false,
            strategies: [
                {
                    name: 'default',
                    parameters: {},
                },
            ],
            variants: [],
        },
    ],
};

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

export async function hentFeatures() {
    return brukerMock ? Promise.resolve(mockToggles) : await getDefinitions();
}

export async function GET() {
    try {
        const definitions = await hentFeatures();
        return NextResponse.json(definitions.features || []);
    } catch (error) {
        logger.error(error);
        return NextResponse.json([]);
    }
}
