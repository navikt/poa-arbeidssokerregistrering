import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@navikt/next-logger';
import { getDefinitions } from '@unleash/nextjs';

import { mockToggles } from './mocks/features';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

export async function hentFeatures() {
    return brukerMock ? mockToggles : await getDefinitions();
}

async function features(req: NextApiRequest, res: NextApiResponse) {
    try {
        const definitions = await hentFeatures();
        return res.status(200).json(definitions.features || []);
    } catch (error) {
        logger.error(error);
        return res.status(200).json([]);
    }
}

export default features;
