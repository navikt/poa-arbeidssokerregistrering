import { NextApiHandler } from 'next';
import { ApiError, getHeaders, getInngangClientId, getTokenFromRequest } from '../../lib/next-api-handler';
import { verifyToken } from '../../auth/token-validation';
import { decodeJwt } from 'jose';
import { nanoid } from 'nanoid';
import { logger } from '@navikt/next-logger';
import { withAuthenticatedApi } from '../../auth/withAuthentication';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';
const url = `${process.env.INNGANG_API_URL}/api/v1/arbeidssoker/perioder/kan-starte`;
const apiHandler: NextApiHandler = async (req, res) => {
    const callId = nanoid();
    try {
        const token = getTokenFromRequest(req)!;
        const result = await verifyToken(token, decodeJwt(token));
        const fnr = result.payload.pid as string;

        logger.info(`Starter kall callId: ${callId} mot ${url}`);
        const respons = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({
                identitetsnummer: fnr,
            }),
            headers: brukerMock ? getHeaders('token', callId) : getHeaders(await getInngangClientId(req), callId),
        }).then(async (apiResponse) => {
            if (!apiResponse.ok) {
                logger.error(`apiResponse ikke ok, callId - ${callId}`);
                const contentType = apiResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
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

            return apiResponse.json();
        });

        logger.info(`Kall callId: ${callId} mot ${url} er ferdig`);

        if (respons.status && respons.status !== 200) {
            res.status(respons.status).json(respons);
        } else {
            res.json(respons);
        }
    } catch (error) {
        logger.error(`Kall mot ${url} (callId: ${callId}) feilet. Feilmelding: ${error}`);
        res.status((error as ApiError).status || 500).end(`Noe gikk galt (callId: ${callId})`);
    }
};
export default withAuthenticatedApi(apiHandler);
