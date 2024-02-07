import { GetServerSidePropsContext, GetServerSidePropsResult, NextApiRequest, NextApiResponse } from 'next';
import { validateIdportenToken } from '@navikt/next-auth-wonderwall';
import { logger } from '@navikt/next-logger';
import localeTilUrl from '../lib/locale-til-url';

type PageHandler = (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<unknown>>;
type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | unknown;

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

/**
 * Used to authenticate Next.JS pages. Assumes application is behind
 * Wonderwall (https://doc.nais.io/security/auth/idporten/sidecar/). Will automatically redirect to login if
 * Wonderwall-cookie is missing.
 *
 */
export function withAuthenticatedPage(handler: PageHandler = async () => ({ props: {} })) {
    return async function withBearerTokenHandler(
        context: GetServerSidePropsContext,
    ): Promise<ReturnType<NonNullable<typeof handler>>> {
        if (brukerMock) {
            return handler(context);
        }

        const request = context.req;
        const locale = localeTilUrl(context.locale as any);
        const REDIRECT_URL = `${process.env.NEXT_PUBLIC_SELF_URL}/${locale ? `${locale}/` : ''}start`;
        const bearerToken: string | null | undefined = request.headers['authorization'];
        if (!bearerToken) {
            return {
                redirect: {
                    destination: `/oauth2/login?redirect=${REDIRECT_URL}`,
                    permanent: false,
                },
            };
        }

        const validationResult = await validateIdportenToken(bearerToken);
        if (validationResult !== 'valid') {
            logger.error(
                new Error(
                    `Invalid JWT token found (cause: ${validationResult.errorType} ${validationResult.message}, redirecting to login.`,
                    { cause: validationResult.error },
                ),
            );
            return {
                redirect: {
                    destination: `/oauth2/login?redirect=${REDIRECT_URL}`,
                    permanent: false,
                },
            };
        }

        return handler(context);
    };
}

export function withAuthenticatedApi(handler: ApiHandler): ApiHandler {
    return async function withBearerTokenHandler(req, res, ...rest) {
        if (brukerMock) {
            return handler(req, res, ...rest);
        }

        const bearerToken: string | null | undefined = req.headers['authorization'];
        const validatedToken = bearerToken ? await validateIdportenToken(bearerToken) : null;
        if (!bearerToken || validatedToken !== 'valid') {
            if (validatedToken && validatedToken !== 'valid') {
                logger.error(`Invalid JWT token found (cause: ${validatedToken.message} for API ${req.url}`);
            }

            res.status(401).json({ message: 'Access denied' });
            return;
        }

        return handler(req, res, ...rest);
    };
}
