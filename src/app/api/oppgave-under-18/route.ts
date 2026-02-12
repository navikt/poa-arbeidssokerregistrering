import { NextRequest, NextResponse } from 'next/server';
import { AIA_BACKEND_CLIENT_ID, proxyRequestWithAuth } from '@/lib/next-api-handler';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';
const opprettOppgaveUrl = `${process.env.OPPGAVE_API_URL}/under-18`;

export async function POST(req: NextRequest) {
    if (brukerMock) {
        return NextResponse.json({
            id: 0,
            tildeltEnhetsnr: 'string',
            oppgaveType: 'UNDER_18',
        });
    }

    return proxyRequestWithAuth(req, opprettOppgaveUrl, AIA_BACKEND_CLIENT_ID, 'POST');
}
