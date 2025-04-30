import type { NextApiRequest, NextApiResponse } from 'next';

const featureToggles = (req: NextApiRequest, res: NextApiResponse): void => {
    res.status(200).json(mockToggles);
};

export const mockToggles = {
    version: 1,
    features: [
        {
            name: 'arbeidssokerregistrering.bruk-ny-du-kan-ikke-registrere-deg-selv-melding',
            type: 'release',
            enabled: true,
            stale: false,
            strategies: [
                {
                    name: 'default',
                    parameters: {},
                },
            ],
            variants: [],
        },
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
        {
            name: 'arbeidssoekerregistrering.bruk-v2-inngang',
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
        {
            name: 'arbeidssoekerregistrering.vedlikehold',
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
        {
            name: 'arbeidssokerregistrering.bruk-nye-plikter',
            type: 'release',
            enabled: true,
            stale: false,
            strategies: [
                {
                    name: 'default',
                    parameters: {},
                },
            ],
            variants: [],
        },
        {
            name: 'arbeidssokerregistrering.bruk-ny-kvittering',
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
