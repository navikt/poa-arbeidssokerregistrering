import { NextApiHandler, NextApiRequest } from 'next';
import { nanoid } from 'nanoid';
import createTokenDings, { Auth } from '../auth/tokenDings';
import { logger } from '@navikt/next-logger';
import { TokenSet } from 'openid-client';

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
    errorHandler?: (response: Response) => void,
    clientId?: ClientIds,
) => NextApiHandler =
    (url: string, errorHandler, clientId = VEILARBREGISTRERING_CLIENT_ID) =>
    async (req, res) => {
        if (req.method === 'POST') {
            return lagApiHandlerMedAuthHeaders(url, errorHandler, clientId)(req, res);
        } else {
            res.status(405).end();
        }
    };

export interface ApiError extends Error {
    status?: number;
    body?: any;
}

let _tokenDings: Auth | undefined;
const getTokenDings = async (): Promise<Auth> => {
    if (!_tokenDings) {
        _tokenDings = await createTokenDings({
            tokenXWellKnownUrl: process.env.TOKEN_X_WELL_KNOWN_URL!,
            tokenXClientId: process.env.TOKEN_X_CLIENT_ID!,
            tokenXTokenEndpoint: process.env.TOKEN_X_TOKEN_ENDPOINT!,
            tokenXPrivateJwk: process.env.TOKEN_X_PRIVATE_JWK!,
        });
    }

    return _tokenDings;
};

export const VEILARBREGISTRERING_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:veilarbregistrering`;
export const AIA_BACKEND_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:aia-backend`;

type ClientIds = typeof VEILARBREGISTRERING_CLIENT_ID | typeof AIA_BACKEND_CLIENT_ID;

const exchangeIDPortenToken = async (clientId: string, idPortenToken: string): Promise<TokenSet> => {
    return (await getTokenDings()).exchangeIDPortenToken(idPortenToken, VEILARBREGISTRERING_CLIENT_ID);
};

export const getTokenFromRequest = (req: NextApiRequest) => {
    const bearerToken = req.headers['authorization'];
    return bearerToken?.replace('Bearer ', '');
};

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

export const getVeilarbregistreringToken = async (req: NextApiRequest) => {
    return getTokenXToken(req, VEILARBREGISTRERING_CLIENT_ID);
};

const getTokenXToken = async (req: NextApiRequest, clientId: ClientIds) => {
    const tokenSet = await exchangeIDPortenToken(clientId, getTokenFromRequest(req)!);
    return tokenSet.access_token!;
};

const lagApiHandlerMedAuthHeaders: (
    url: string,
    errorHandler?: (response: Response) => void,
    clientId?: ClientIds,
) => NextApiHandler =
    (url: string, errorHandler, clientId = VEILARBREGISTRERING_CLIENT_ID) =>
    async (req, res) => {
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
                headers: brukerMock
                    ? getHeaders('token', callId)
                    : getHeaders(await getTokenXToken(req, clientId), callId),
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
            const apiError = error as ApiError;
            res.status(apiError.status || 500).send(apiError.body ?? `Noe gikk galt (callId: ${callId})`);
        }
    };

export default lagApiHandlerMedAuthHeaders;
