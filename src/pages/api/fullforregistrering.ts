import { ApiError, getTokenFromRequest, lagApiPostHandlerMedAuthHeaders } from '../../lib/next-api-handler';
import { withAuthenticatedApi } from '../../auth/withAuthentication';
import { NextApiHandler } from 'next';
import { verifyToken } from '../../auth/token-validation';
import { decodeJwt } from 'jose';
import { FnrOgDnrTilAlder } from '../../lib/fnr-og-dnr-til-alder';
import { getDefinitions } from '@unleash/nextjs';
import { logger } from '@navikt/next-logger';

const fullforRegistreringUrl = `${process.env.FULLFOR_REGISTRERING_URL}`;

const errorHandler = (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        const error = new Error(response.statusText) as ApiError;
        error.status = response.status;
        throw error;
    }
};

const fullforHandler = lagApiPostHandlerMedAuthHeaders(fullforRegistreringUrl, errorHandler);

function withAgeCheck(handler: NextApiHandler): NextApiHandler {
    return async (req, res, ...rest) => {
        try {
            const definitions = await getDefinitions();
            const toggle = definitions.features.find((f) => f.name === 'arbeidssokerregistrering.bruk-under-18-sperre');
            if (toggle?.enabled) {
                const token = getTokenFromRequest(req)!;
                const result = await verifyToken(token, decodeJwt(token));
                const fnr = result.payload.pid as string;
                const alder = FnrOgDnrTilAlder(fnr);
                if (alder < 18) {
                    return res.status(403).end();
                }
            }
            return handler(req, res, ...rest);
        } catch (e) {
            logger.error({ e, msg: 'Feil i withAgeCheck' });
            return handler(req, res, ...rest);
        }
    };
}
export default withAuthenticatedApi(withAgeCheck(fullforHandler));
