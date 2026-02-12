import { nanoid } from 'nanoid';
import { getHeaders, INNGANG_CLIENT_ID } from './next-api-handler';
import { logger } from '@navikt/next-logger';
import { NextRequest, NextResponse } from 'next/server';
import { getToken, parseIdportenToken, requestTokenxOboToken } from '@navikt/oasis';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

type Opts = {
    method: 'PUT' | 'POST' | 'GET' | 'DELETE';
    body?: Record<string, string>;
    mockResponse(): NextResponse;
};

const lagArbeidssokerApiKall = (url: string, opts: Opts) => async (req: NextRequest) => {
    const callId = nanoid();

    if (brukerMock) {
        return opts.mockResponse();
    }

    try {
        const idPortenToken = getToken(req)!;
        const tokenResult = await requestTokenxOboToken(idPortenToken, INNGANG_CLIENT_ID);
        if (!tokenResult.ok) {
            throw tokenResult.error;
        }

        const idporten = parseIdportenToken(idPortenToken);
        const identitetsnummer = idporten.ok ? idporten.pid : undefined;

        const incomingBody =
            opts.method !== 'GET' && opts.method !== 'DELETE' ? await req.json().catch(() => ({})) : {};

        const body = {
            identitetsnummer,
            ...(opts.body ?? {}),
            ...(incomingBody ?? {}),
        };

        logger.info(`Starter kall callId: ${callId} mot ${url}`);

        const response = await fetch(url, {
            method: opts.method,
            body: JSON.stringify(body),
            headers: getHeaders(tokenResult.token, callId),
        });

        const contentType = response.headers.get('content-type');
        const isJsonResponse = contentType && contentType.includes('application/json');

        if (!response.ok) {
            logger.warn(`apiResponse ikke ok (${response.status}), callId - ${callId}`);
            if (isJsonResponse) {
                const data = await response.json();
                return NextResponse.json({ ...data, status: response.status }, { status: response.status });
            } else {
                return new NextResponse(response.statusText, { status: response.status });
            }
        }

        logger.info(`Kall callId: ${callId} mot ${url} er ferdig (${response.status})`);

        if (isJsonResponse) {
            const data = await response.json();
            return NextResponse.json(data);
        } else if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        return new NextResponse(null, { status: response.status });
    } catch (error) {
        logger.error(`Kall mot ${url} (callId: ${callId}) feilet. Feilmelding: ${error}`);
        return new NextResponse(`Noe gikk galt (callId: ${callId})`, { status: 500 });
    }
};

export default lagArbeidssokerApiKall;
