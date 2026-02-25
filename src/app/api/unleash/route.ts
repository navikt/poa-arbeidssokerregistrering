import { isEnabled } from '@/lib/unleash-is-enabled';
import { NextRequest } from 'next/server';
import { HttpResponse } from 'msw';

function brukerMock() {
    return process.env.ENABLE_MOCK === 'enabled';
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const toggles = searchParams.getAll('toggle');

    if (!toggles || toggles.length === 0) {
        return new HttpResponse(null, { status: 400 });
    }

    if (brukerMock()) {
        const mockResponse = toggles.reduce((acc, key) => {
            return { ...acc, [key]: true };
        }, {});
        return HttpResponse.json(mockResponse);
    }

    const results = await Promise.all(toggles.map(async (key) => [key, await isEnabled(key)]));
    const response = Object.fromEntries(results);
    return HttpResponse.json(response);
}
