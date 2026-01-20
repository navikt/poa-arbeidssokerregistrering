import type { NextApiRequest, NextApiResponse } from 'next';

const featureToggles = (req: NextApiRequest, res: NextApiResponse): void => {
    res.status(200).json(mockToggles);
};

export const mockToggles = {
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

export default featureToggles;
