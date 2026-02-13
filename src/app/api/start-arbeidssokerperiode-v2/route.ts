import lagArbeidssokerApiKall from '@/lib/lag-arbeidssoker-api-kall';
import { NextResponse } from 'next/server';

const url = `${process.env.INNGANG_API_URL}/api/v2/arbeidssoker/periode`;

export const PUT = lagArbeidssokerApiKall(url, {
    method: 'PUT',
    body: { periodeTilstand: 'STARTET' },
    mockResponse: () => new NextResponse(null, { status: 204 }),
});
