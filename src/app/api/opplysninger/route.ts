import lagArbeidssokerApiKall from '@/lib/lag-arbeidssoker-api-kall';
import { NextResponse } from 'next/server';

const url = `${process.env.INNGANG_API_URL}/api/v1/arbeidssoker/opplysninger`;

export const POST = lagArbeidssokerApiKall(url, { method: 'POST', mockResponse: () => NextResponse.json({}) });
