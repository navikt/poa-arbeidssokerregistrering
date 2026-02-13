import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { logger } from '@navikt/next-logger';

export async function GET(req: NextRequest) {
    const callId = nanoid();
    const yrke = req.nextUrl.searchParams.get('yrke');
    const url = `${process.env.PAM_ONTOLOGI_URL}/typeahead/stilling?stillingstittel=${yrke}`;

    const response = await fetch(url, {
        headers: {
            'Nav-Consumer-Id': 'poa-arbeidssokerregistrering',
            'Nav-Call-Id': callId,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        logger.error(`Respons fra PAM_ONTOLOGI typeahead ikke OK - [callId: ${callId}]`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const json = await response.json();
    return NextResponse.json(json);
}
