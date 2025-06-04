'use server';

import { headers } from 'next/headers';
import { stripBearer } from '@navikt/oasis/dist/strip-bearer';
import { logger } from '@navikt/next-logger';
import { requestTokenxOboToken } from '@navikt/oasis';
import { nanoid } from 'nanoid';
import { verifyToken } from '../auth/token-validation';
import { decodeJwt } from 'jose';
import { ApiError, getHeaders, INNGANG_CLIENT_ID } from './next-api-handler';

async function getTokenXToken(idPortenToken: string) {
    const oboToken = await requestTokenxOboToken(idPortenToken, INNGANG_CLIENT_ID);

    if (!oboToken.ok) {
        logger.warn(oboToken.error);
        throw oboToken.error;
    }

    return oboToken.token;
}

export async function arbeidssokerApiKall(url: string) {
    const callId = nanoid();
    try {
        const reqHeaders = await headers();
        let bearerToken = stripBearer(reqHeaders.get('authorization')!);
        const result = await verifyToken(bearerToken, decodeJwt(bearerToken));
        const fnr = result.payload.pid as string;

        const tokenXToken = await getTokenXToken(bearerToken);

        const respons = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({
                identitetsnummer: fnr,
                //...body,
            }),
            headers: getHeaders(tokenXToken, callId),
        }).then(async (apiResponse) => {
            const contentType = apiResponse.headers.get('content-type');
            const isJsonResponse = contentType && contentType.includes('application/json');
            if (!apiResponse.ok) {
                logger.warn(`apiResponse ikke ok (${apiResponse.status}), callId - ${callId}`);
                if (isJsonResponse) {
                    return await apiResponse.json();
                } else {
                    const error = new Error(apiResponse.statusText) as ApiError;
                    error.status = apiResponse.status;
                    throw error;
                }
            }

            if (isJsonResponse) {
                return apiResponse.json();
            } else if (apiResponse.status === 204) {
                return {
                    status: 204,
                };
            }
        });

        logger.info(`Kall callId: ${callId} mot ${url} er ferdig (${respons?.status || 200})`);
        return { data: respons, error: null };
    } catch (err) {
        logger.error(`Kall mot ${url} (callId: ${callId}) feilet. Feilmelding: ${err}`);
        return { error: err, data: null };
    }
}
