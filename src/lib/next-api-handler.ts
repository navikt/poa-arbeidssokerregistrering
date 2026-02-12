import { NextApiHandler, NextApiRequest } from 'next';
import { nanoid } from 'nanoid';
import { logger } from '@navikt/next-logger';
import { getToken, requestTokenxOboToken } from '@navikt/oasis';
import { NextRequest, NextResponse } from 'next/server';

export const getHeaders = (token: string, callId: string) => {
    return {
        'Nav-Consumer-Id': 'poa-arbeidssokerregistrering',
        'Nav-Call-Id': callId,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

export const lagApiPostHandlerMedAuthHeaders: (
    url: string,
    errorHandler: ((response: Response) => void) | undefined,
    clientId: ClientIds,
) => NextApiHandler = (url: string, errorHandler, clientId) => async (req, res) => {
    if (req.method === 'POST') {
        return lagApiHandlerMedAuthHeaders(url, errorHandler, clientId)(req, res);
    } else {
        res.status(405).end();
    }
};

export interface ApiError extends Error {
    status?: number;
}

export const AIA_BACKEND_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:aia-backend`;
export const INNGANG_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:paw-arbeidssokerregisteret-api-inngang`;
export const OPPSLAG_V2_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:paw-arbeidssoekerregisteret-api-oppslag-v2`;

const AAREG_CLIENT_ID = `${process.env.AAREG_CLUSTER}:arbeidsforhold:${process.env.AAREG_APPNAME}`;

export type ClientIds =
    | typeof AIA_BACKEND_CLIENT_ID
    | typeof AAREG_CLIENT_ID
    | typeof INNGANG_CLIENT_ID
    | typeof OPPSLAG_V2_CLIENT_ID;

const exchangeIDPortenToken = async (clientId: string, idPortenToken: string): Promise<string> => {
    const result = await requestTokenxOboToken(idPortenToken, clientId);
    if (!result.ok) {
        throw result.error;
    }

    return result.token;
};

export async function proxyRequestWithAuth(
    req: NextRequest,
    url: string,
    clientId: ClientIds,
    method: 'GET' | 'POST' = 'POST',
): Promise<NextResponse> {
    const callId = nanoid();
    const body = method === 'POST' ? await req.json() : null;

    try {
        const idPortenToken = getToken(req)!;
        const tokenResult = await requestTokenxOboToken(idPortenToken, clientId);

        if (!tokenResult.ok) {
            throw tokenResult.error;
        }

        logger.info(`Starter kall callId: ${callId} mot ${url}`);

        const response = await fetch(url, {
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: getHeaders(tokenResult.token, callId),
        });

        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            logger.error(`apiResponse ikke ok, contentType: ${contentType}, callId - ${callId}`);
            return new NextResponse(`Noe gikk galt (callId: ${callId})`, { status: response.status });
        }

        logger.info(`Kall callId: ${callId} mot ${url} er ferdig`);

        if (contentType?.includes('application/json')) {
            const json = await response.json();
            return NextResponse.json(json);
        } else {
            return new NextResponse(response.body);
        }
    } catch (error) {
        logger.error(`Kall mot ${url} (callId: ${callId}) feilet. Feilmelding: ${error}`);
        return new NextResponse(`Noe gikk galt (callId: ${callId})`, { status: 500 });
    }
}

export const getTokenFromRequest = getToken;

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

export const getAaregToken = async (req: NextRequest | NextApiRequest) => {
    return getTokenXToken(req, AAREG_CLIENT_ID);
};

export const getInngangClientId = async (req: NextApiRequest) => {
    return getTokenXToken(req, INNGANG_CLIENT_ID);
};

const getTokenXToken = async (req: NextApiRequest | NextRequest, clientId: ClientIds) => {
    return await exchangeIDPortenToken(clientId, getTokenFromRequest(req)!);
};

const lagApiHandlerMedAuthHeaders: (
    url: string,
    errorHandler: ((response: Response) => void) | undefined,
    clientId: ClientIds,
) => NextApiHandler = (url: string, errorHandler, clientId) => async (req, res) => {
    const callId = nanoid();
    let body = null;

    if (req.method === 'POST') {
        body = req.body;
    }

    try {
        logger.info(`Starter kall callId: ${callId} mot ${url}`);
        const response = await fetch(url, {
            method: req.method,
            body,
            headers: brukerMock ? getHeaders('token', callId) : getHeaders(await getTokenXToken(req, clientId), callId),
        }).then(async (apiResponse) => {
            const contentType = apiResponse.headers.get('content-type');

            if (!apiResponse.ok) {
                logger.error(`apiResponse ikke ok, contentType: ${contentType}, callId - ${callId}`);
                if (typeof errorHandler === 'function') {
                    return errorHandler(apiResponse);
                } else {
                    const error = new Error(apiResponse.statusText) as ApiError;
                    error.status = apiResponse.status;
                    throw error;
                }
            }

            if (contentType?.includes('application/json')) {
                return apiResponse.json();
            } else {
                return apiResponse;
            }
        });
        logger.info(`Kall callId: ${callId} mot ${url} er ferdig`);
        return res.json(response);
    } catch (error) {
        logger.error(`Kall mot ${url} (callId: ${callId}) feilet. Feilmelding: ${error}`);
        res.status((error as ApiError).status || 500).end(`Noe gikk galt (callId: ${callId})`);
    }
};
