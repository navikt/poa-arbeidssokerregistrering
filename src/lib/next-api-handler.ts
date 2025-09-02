import { NextApiHandler, NextApiRequest } from 'next';
import { nanoid } from 'nanoid';
import { logger } from '@navikt/next-logger';
import { requestTokenxOboToken } from '@navikt/oasis';

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
}

export const VEILARBREGISTRERING_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:veilarbregistrering`;
export const AIA_BACKEND_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:aia-backend`;
export const INNGANG_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:paw-arbeidssokerregisteret-api-inngang`;
export const OPPSLAG_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:paw-arbeidssoekerregisteret-api-oppslag`;
export const OPPSLAG_V2_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:paw:paw-arbeidssoekerregisteret-api-oppslag-v2`;
export const PAM_ONTOLOGI_CLIENT_ID = `${process.env.NAIS_CLUSTER_NAME}:teampam:pam-ontologi`;

const AAREG_CLIENT_ID = `${process.env.AAREG_CLUSTER}:arbeidsforhold:${process.env.AAREG_APPNAME}`;

type ClientIds =
    | typeof VEILARBREGISTRERING_CLIENT_ID
    | typeof AIA_BACKEND_CLIENT_ID
    | typeof AAREG_CLIENT_ID
    | typeof INNGANG_CLIENT_ID
    | typeof OPPSLAG_CLIENT_ID
    | typeof OPPSLAG_V2_CLIENT_ID
    | typeof PAM_ONTOLOGI_CLIENT_ID;

const exchangeIDPortenToken = async (clientId: string, idPortenToken: string): Promise<string> => {
    const result = await requestTokenxOboToken(idPortenToken, clientId);
    if (!result.ok) {
        throw result.error;
    }

    return result.token;
};

export const getTokenFromRequest = (req: NextApiRequest) => {
    const bearerToken = req.headers['authorization'];
    return bearerToken?.replace('Bearer ', '');
};

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

export const getAaregToken = async (req: NextApiRequest) => {
    return getTokenXToken(req, AAREG_CLIENT_ID);
};

export const getInngangClientId = async (req: NextApiRequest) => {
    return getTokenXToken(req, INNGANG_CLIENT_ID);
};

export const getOppslagApiToken = async (req: NextApiRequest) => {
    return getTokenXToken(req, OPPSLAG_CLIENT_ID);
};

export const getOppslagApiV2Token = async (req: NextApiRequest) => {
    return getTokenXToken(req, OPPSLAG_V2_CLIENT_ID);
};

export const getPamOntologiToken = async (req: NextApiRequest) => {
    return getTokenXToken(req, PAM_ONTOLOGI_CLIENT_ID);
};

const getTokenXToken = async (req: NextApiRequest, clientId: ClientIds) => {
    return await exchangeIDPortenToken(clientId, getTokenFromRequest(req)!);
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
            res.status((error as ApiError).status || 500).end(`Noe gikk galt (callId: ${callId})`);
        }
    };

export default lagApiHandlerMedAuthHeaders;
