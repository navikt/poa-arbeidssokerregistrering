import { NextResponse } from 'next/server';
import { AIA_BACKEND_CLIENT_ID, proxyRequestWithAuth } from '@/lib/next-api-handler';

const opprettOppgaveUrl = `${process.env.OPPGAVE_API_URL}/under-18`;

export const POST = proxyRequestWithAuth(opprettOppgaveUrl, AIA_BACKEND_CLIENT_ID, 'POST', () =>
    NextResponse.json({
        id: 0,
        tildeltEnhetsnr: 'string',
        oppgaveType: 'UNDER_18',
    }),
);
