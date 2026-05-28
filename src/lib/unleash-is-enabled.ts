import { logger } from '@navikt/next-logger';
import { evaluateFlags, flagsClient, getDefinitions } from '@unleash/nextjs';
import { cookies } from 'next/headers';

const brukerMock = process.env.ENABLE_MOCK === 'enabled';

export const isEnabled = async (toggle: string) => {
    if (brukerMock) {
        return true;
    }

    try {
        const cookieStore = await cookies();
        const sessionId =
            cookieStore.get('unleash-session-id')?.value || `${Math.floor(Math.random() * 1_000_000_000)}`;

        const definitions = await getDefinitions({
            fetchOptions: {
                next: { revalidate: 15 }, // Cache layer like Unleash Proxy!
            },
        });

        const { toggles } = evaluateFlags(definitions, {
            sessionId,
        });

        const flags = flagsClient(toggles);

        return flags.isEnabled(toggle);
    } catch (error) {
        logger.error(error, `Feil ved henting av feature-toggle ${toggle}`);
        return false;
    }
};
