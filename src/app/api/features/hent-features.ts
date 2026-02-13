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
