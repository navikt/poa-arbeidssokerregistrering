import { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';
import { decodeJwt } from 'jose';

import { getAaregToken, getHeaders, getTokenFromRequest } from '../../lib/next-api-handler';
import { withAuthenticatedApi } from '../../auth/withAuthentication';
import { verifyToken } from '../../auth/token-validation';
import { hentSisteArbeidsForhold } from '../../lib/hent-siste-arbeidsforhold';
import { logger } from '@navikt/next-logger';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';
const url = brukerMock
    ? `${process.env.SISTEARBEIDSFORHOLD_FRA_AAREG_URL}`
    : `${process.env.AAREG_REST_API}/v2/arbeidstaker/arbeidsforholdoversikt`;

const getAaregHeaders = async (req: NextApiRequest, callId: string) => {
    if (brukerMock) {
        return {
            ...getHeaders('token', callId),
            'Nav-Personident': '123456789',
        };
    }

    const headers = getHeaders(await getAaregToken(req), callId);

    const token = getTokenFromRequest(req)!;
    const result = await verifyToken(token, decodeJwt(token));
    const fnr = result.payload.pid as string;

    return {
        ...headers,
        'Nav-Personident': fnr,
    };
};
async function hentFraAareg(req: NextApiRequest, callId: string) {
    logger.info(`Starter kall callId: ${callId} mot ${url}`);
    const arbeidsforholdoversikt = await fetch(url, { headers: await getAaregHeaders(req, callId) }).then(
        async (res) => {
            if (!res.ok) {
                logger.error(`Respons fra aareg ikke OK - [callId: ${callId}] ${res.status} ${res.statusText}`);
                logger.error(`[callId: ${callId}] ${await res.json()}`, await res.json());
                throw new Error('Feil ved henting av siste arbeidsforhold');
            }
            return res.json();
        },
    );
    logger.info(`Kall callId: ${callId} mot ${url} er ferdig`);
    logger.info(arbeidsforholdoversikt, 'Arbeidsforholdoversikt');
    logger.info({ arbeidsforholdoversikt, msg: 'Arbeidsforholdoversikt' });
    return hentSisteArbeidsForhold(arbeidsforholdoversikt);
}

const sisteArbeidsforhold = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    const callId = nanoid();

    try {
        const { styrk } = await hentFraAareg(req, callId);
        const { konseptMedStyrk08List } = await fetch(
            `${process.env.PAM_JANZZ_URL}/kryssklassifiserMedKonsept?kodeForOversetting=${styrk}`,
            {
                headers: getHeaders('token', callId),
            },
        ).then((res) => res.json());

        res.json(konseptMedStyrk08List[0]);
    } catch (e) {
        logger.error(`Feil ved henting av siste arbeidsforhold fra aareg [callId: ${callId}]`, e);
        res.status(500).end(`${e}`);
    }
};

export default withAuthenticatedApi(sisteArbeidsforhold);
