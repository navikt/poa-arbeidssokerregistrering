import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { logger } from '@navikt/next-logger';

import { getAaregToken, getHeaders } from '../../../lib/next-api-handler';
import { hentSisteArbeidsForhold } from '../../../lib/hent-siste-arbeidsforhold';
import { getToken, parseIdportenToken } from '@navikt/oasis';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

const url = `${process.env.AAREG_REST_API}/v2/arbeidstaker/arbeidsforholdoversikt`;

const getAaregHeaders = async (req: NextRequest, callId: string) => {
    return getHeaders(await getAaregToken(req), callId);
};

async function hentFraAareg(req: NextRequest, callId: string) {
    const result = parseIdportenToken(getToken(req)!);
    const fnr = result.ok ? result.pid : null;
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

export async function GET(req: NextRequest) {
    if (brukerMock) {
        return new NextResponse(null, { status: 204 });
    }

    const callId = nanoid();

    try {
        const { styrk } = hentSisteArbeidsForhold(await hentFraAareg(req, callId));

        if (!styrk) {
            logger.info(`Ingen styrk-kode å slå opp [callId: ${callId}]`);
            return new NextResponse(null, { status: 204 });
        }

        logger.info(`Slår opp styrk-kode [callId: ${callId}]`);

        const konseptMedStyrk08List = await fetch(
            `${process.env.PAM_ONTOLOGI_URL}/ontologi/styrk98/konverter/${styrk}`,
            {
                headers: getHeaders('token', callId),
            },
        ).then((res) => res.json());

        logger.info(`Oppslag mot styrk-kode ferdig [callId: ${callId}]`);

        return NextResponse.json(konseptMedStyrk08List[0]);
    } catch (e: any) {
        logger.error(`Feil ved oppslag av styrk mot PAM_ONTOLOGI [callId: ${callId}]`, e);
        return new NextResponse(`${e}`, { status: 500 });
    }
}
