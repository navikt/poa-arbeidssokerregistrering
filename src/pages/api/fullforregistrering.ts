import { NextApiHandler } from 'next';
import { decodeJwt } from 'jose';
import { logger } from '@navikt/next-logger';
import { getDefinitions } from '@unleash/nextjs';

import { withAuthenticatedApi } from '../../auth/withAuthentication';

import { ApiError, getTokenFromRequest, lagApiPostHandlerMedAuthHeaders } from '../../lib/next-api-handler';
import { verifyToken } from '../../auth/token-validation';
import { personidentTilAlder } from '../../lib/personident-til-alder';
import { ErrorTypes } from '../../model/error';

const fullforRegistreringUrl = `${process.env.FULLFOR_REGISTRERING_URL}`;

const errorHandler = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    const error = new Error(response.statusText) as ApiError;
    error.status = response.status;
    if (contentType && contentType.includes('application/json')) {
        error.body = await response.json();
    } else {
        try {
            error.body = { type: await response.text() };
        } catch (e) {
            // ignore
        }
    }
    throw error;
};

const fullforHandler = lagApiPostHandlerMedAuthHeaders(fullforRegistreringUrl, errorHandler);

function withAgeCheck(handler: NextApiHandler): NextApiHandler {
    return async (req, res, ...rest) => {
        try {
            const definitions = await getDefinitions();
            const toggle = definitions?.features.find(
                (f) => f.name === 'arbeidssokerregistrering.bruk-under-18-sperre',
            );
            if (toggle?.enabled) {
                const token = getTokenFromRequest(req)!;
                const result = await verifyToken(token, decodeJwt(token));
                const fnr = result.payload.pid as string;
                const alder = personidentTilAlder(fnr);
                if (alder < 18) {
                    return res.status(403).json({ type: ErrorTypes.BRUKER_ER_UNDER_18 });
                }
            }
            return handler(req, res, ...rest);
        } catch (e) {
            logger.error({ e, msg: 'Feil i alder-sjekk ved fullfør-registrering' });
            return handler(req, res, ...rest);
        }
    };
}
export default withAuthenticatedApi(withAgeCheck(fullforHandler));
