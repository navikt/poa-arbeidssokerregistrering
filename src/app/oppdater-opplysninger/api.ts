import { headers } from 'next/headers';
import { getToken, parseIdportenToken, requestOboToken } from '@navikt/oasis';
import { logger } from '@navikt/next-logger';
import { snapshotMock } from '@/app/oppdater-opplysninger/mock-data';
import { Snapshot } from '@navikt/arbeidssokerregisteret-utils/oppslag/v3';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

async function getTokenXToken(idPortenToken: string | null, audience: string) {
    if (!idPortenToken) {
        throw new Error('Missing bearer token');
    }

    const oboToken = await requestOboToken(idPortenToken, audience);

    if (!oboToken.ok) {
        logger.warn(oboToken.error);
        throw oboToken.error;
    }

    return oboToken.token;
}

export async function fetchArbeidssoekerregisteretSnapshot(): Promise<{ data?: Snapshot; error?: any }> {
    if (brukerMock) {
        return Promise.resolve({
            data: snapshotMock,
        });
    }

    const PERIODER_SNAPSHOT_URL = `${process.env.ARBEIDSSOKERREGISTERET_OPPSLAG_API_V2_URL}/api/v3/snapshot`;
    const audience = `${process.env.NAIS_CLUSTER_NAME}:paw:paw-arbeidssoekerregisteret-api-oppslag-v2`;

    try {
        const idportenToken = getToken(await headers());
        const tokenXToken = await getTokenXToken(idportenToken, audience);
        const parsedToken = parseIdportenToken(idportenToken!);
        const identitetsnummer = parsedToken.ok ? parsedToken.pid : '';

        logger.info(`Starter POST ${PERIODER_SNAPSHOT_URL}`);
        const response = await fetch(PERIODER_SNAPSHOT_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${tokenXToken}`,
            },
            body: JSON.stringify({ type: 'IDENTITETSNUMMER', identitetsnummer }),
        });
        logger.info(`Ferdig POST ${PERIODER_SNAPSHOT_URL} ${response.status} ${response.statusText}`);

        if (!response.ok) {
            if (response.status === 404) {
                return { data: undefined };
            }

            const error: any = new Error(`${response.status} ${response.statusText}`);
            try {
                error.data = await response.json();
            } catch (e) {}
            logger.error(error, `Feil fra POST ${PERIODER_SNAPSHOT_URL}`);
            return { error };
        }

        return { data: (await response.json()) as Snapshot };
    } catch (error: any) {
        logger.error(error, `Feil fra POST ${PERIODER_SNAPSHOT_URL}`);
        return { error };
    }
}
