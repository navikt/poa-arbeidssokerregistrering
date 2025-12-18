import { NextApiRequest, NextApiResponse } from 'next';
import { validateIdportenToken } from '@navikt/oasis';
import { logger } from '@navikt/next-logger';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | unknown;

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

export function withAuthenticatedApi(handler: ApiHandler): ApiHandler {
    return async function withBearerTokenHandler(req, res, ...rest) {
        if (brukerMock) {
            return handler(req, res, ...rest);
        }

        const bearerToken: string | null | undefined = req.headers['authorization'];
        const validatedToken = bearerToken ? await validateIdportenToken(bearerToken) : null;
        if (!bearerToken || !validatedToken?.ok) {
            if (validatedToken && !validatedToken.ok) {
                logger.error(`Invalid JWT token found (cause: ${validatedToken.errorType} for API ${req.url}`);
            }

            res.status(401).json({ message: 'Access denied' });
            return;
        }

        return handler(req, res, ...rest);
    };
}
