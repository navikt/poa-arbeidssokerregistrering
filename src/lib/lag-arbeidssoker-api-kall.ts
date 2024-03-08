import { nanoid } from 'nanoid';
import { ApiError, getHeaders, getInngangClientId, getTokenFromRequest } from './next-api-handler';
import { verifyToken } from '../auth/token-validation';
import { decodeJwt } from 'jose';
import { logger } from '@navikt/next-logger';
import { NextApiHandler } from 'next';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

type Opts = {
    method: 'PUT' | 'POST' | 'GET' | 'DELETE';
    body?: Record<string, string>;
};

type LagArbeidssokerApiKall = (url: string, opts: Opts) => NextApiHandler;
const lagArbeidssokerApiKall: LagArbeidssokerApiKall = (url, opts) => async (req, res) => {
    const callId = nanoid();
    try {
        const token = getTokenFromRequest(req)!;
        const result = await verifyToken(token, decodeJwt(token));
        const fnr = result.payload.pid as string;

        logger.info(`Starter kall callId: ${callId} mot ${url}`);

        let requestBody;
        try {
            requestBody = req.body ? JSON.parse(req.body) : {};
        } catch (e) {
            logger.warn({ e, x_callId: callId, msg: 'Feil ved json-parsing av innkommende request' });
            requestBody = {};
        }

        const body = {
            ...(opts.body ?? {}),
            ...requestBody,
        };

        const respons = await fetch(url, {
            method: opts.method,
            body: JSON.stringify({
                identitetsnummer: fnr,
                ...body,
            }),
            headers: brukerMock ? getHeaders('token', callId) : getHeaders(await getInngangClientId(req), callId),
        }).then(async (apiResponse) => {
            const contentType = apiResponse.headers.get('content-type');
            const isJsonResponse = contentType && contentType.includes('application/json');
            if (!apiResponse.ok) {
                logger.warn(`apiResponse ikke ok (${apiResponse.status}), callId - ${callId}`);
                if (isJsonResponse) {
                    const data = await apiResponse.json();
                    return {
                        ...data,
                        status: apiResponse.status,
                    };
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

        if (respons?.status === 204) {
            res.status(204).end();
        } else if (respons?.status && respons?.status !== 200) {
            res.status(respons.status).json(respons);
        } else {
            res.json(respons ?? {});
        }
    } catch (error) {
        logger.error(`Kall mot ${url} (callId: ${callId}) feilet. Feilmelding: ${error}`);
        res.status((error as ApiError).status || 500).end(`Noe gikk galt (callId: ${callId})`);
    }
};

export default lagArbeidssokerApiKall;
