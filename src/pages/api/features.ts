import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@navikt/next-logger';
import { getDefinitions } from '@unleash/nextjs';

async function features(req: NextApiRequest, res: NextApiResponse) {
    try {
        const definitions = await getDefinitions();
        return res.status(200).json(definitions.features || []);
    } catch (error) {
        logger.error(error);
        return res.status(200).json([]);
    }
}

export default features;
