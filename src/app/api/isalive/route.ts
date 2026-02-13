import { NextResponse } from 'next/server';

export async function GET() {
    return new NextResponse('Alive', { status: 200 });
}
