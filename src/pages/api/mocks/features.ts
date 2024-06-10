import type { NextApiRequest, NextApiResponse } from 'next';

const featureToggles = (req: NextApiRequest, res: NextApiResponse): void => {
    res.status(200).json(mockToggles);
};

export const mockToggles = {
    version: 1,
    features: [
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
            name: 'arbeidssokerregistrering.bruk-direkte-kobling-mot-aareg',
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
            name: 'arbeidssokerregistrering.bruk-under-18-sperre',
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
            name: 'arbeidssokerregistrering.ingen_kvittering',
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
            name: 'arbeidssokerregistrering.kontaktopplysninger',
            type: 'release',
            enabled: true,
            stale: false,
            strategies: [
                {
                    name: 'default',
                },
            ],
            variants: null,
        },
        {
            name: 'arbeidssokerregistrering.kunngjoring',
            type: 'release',
            enabled: false,
            stale: false,
            strategies: [
                {
                    name: 'default',
                    parameters: {},
                },
            ],
            variants: null,
        },
        {
            name: 'arbeidssokerregistrering.nedetid',
            type: 'release',
            enabled: false,
            stale: false,
            strategies: [
                {
                    name: 'default',
                    parameters: {},
                },
            ],
            variants: null,
        },
        {
            name: 'arbeidssokerregistrering.mer-oppfolging',
            type: 'release',
            enabled: false,
            stale: false,
            strategies: [
                {
                    name: 'default',
                    parameters: {},
                },
            ],
            variants: null,
        },
        {
            name: 'arbeidssokerregistrering.ny-ingress',
            type: 'release',
            enabled: false,
            stale: false,
            strategies: [
                {
                    name: 'byCluster',
                    parameters: {
                        cluster: 'dev-gcp,dev-sbs,prod-gcp,prod-sbs',
                    },
                    constraints: [],
                },
            ],
            variants: [],
        },
    ],
};

export default featureToggles;
