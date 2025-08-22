import { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';
import { decodeJwt } from 'jose';
import { logger } from '@navikt/next-logger';

import { getAaregToken, getHeaders, getTokenFromRequest } from '../../lib/next-api-handler';
import { withAuthenticatedApi } from '../../auth/withAuthentication';
import { verifyToken } from '../../auth/token-validation';
import { hentSisteArbeidsForhold } from '../../lib/hent-siste-arbeidsforhold';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

const url = brukerMock
    ? `${process.env.SISTEARBEIDSFORHOLD_FRA_AAREG_URL}`
    : `${process.env.AAREG_REST_API}/v2/arbeidstaker/arbeidsforholdoversikt`;

const getAaregHeaders = async (req: NextApiRequest, callId: string) => {
    if (brukerMock) {
        return {
            ...getHeaders('token', callId),
        };
    }

    const headers = getHeaders(await getAaregToken(req), callId);

    return {
        ...headers,
    };
};

async function hentFraAareg(req: NextApiRequest, callId: string) {
    let fnr = '1234';

    if (!brukerMock) {
        const token = getTokenFromRequest(req)!;
        const result = await verifyToken(token, decodeJwt(token));
        fnr = result.payload.pid as string;
    }

    const payload = {
        arbeidstakerId: fnr,
        arbeidsforholdstatuser: ['AKTIV', 'AVSLUTTET'],
    };

    logger.info(`Starter kall callId: ${callId} mot ${url}`);

    const arbeidsforholdoversikt = await fetch(url, {
        method: 'POST',
        headers: await getAaregHeaders(req, callId),
        body: JSON.stringify(payload),
    }).then(async (res) => {
        if (!res.ok) {
            logger.error(`Respons fra aareg ikke OK - [callId: ${callId}] ${res.status} ${res.statusText}`);
            throw new Error('Feil ved henting av siste arbeidsforhold');
        }
        return res.json();
    });
    logger.info(`Kall callId: ${callId} mot ${url} er ferdig`);
    return arbeidsforholdoversikt;
}

const sisteArbeidsforhold = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    const callId = nanoid();

    try {
        const { styrk } = hentSisteArbeidsForhold(await hentFraAareg(req, callId));

        if (!styrk) {
            logger.info(`Ingen styrk-kode å slå opp [callId: ${callId}]`);
            return res.status(204).end();
        }

        logger.info(`Slår opp styrk-kode [callId: ${callId}]`);

        const konseptMedStyrk08List = await fetch(
            `${process.env.PAM_ONTOLOGI_URL}/ontologi/styrk98/konverter/${styrk}`,
            {
                headers: getHeaders('token', callId),
            },
        ).then((res) => res.json());

        logger.info(`Oppslag mot styrk-kode ferdig [callId: ${callId}]`);

        res.json(konseptMedStyrk08List[0]);
    } catch (e: any) {
        logger.error(`Feil ved oppslag av styrk mot PAM_ONTOLOGI [callId: ${callId}]`, e);
        res.status(500).end(`${e}`);
    }
};

export default withAuthenticatedApi(sisteArbeidsforhold);
