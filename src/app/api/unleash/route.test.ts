import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as unleashIsEnabled from '@/lib/unleash-is-enabled';

function createRequest(url: string): NextRequest {
    return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/unleash', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returnerer 400 hvis ingen toggles er gitt', async () => {
        const req = createRequest('/api/unleash');
        const res = await GET(req);

        expect(res.status).toBe(400);
    });

    it('returnerer alle toggles som true når brukerMock er aktiv', async () => {
        process.env.ENABLE_MOCK = 'enabled';

        const req = createRequest('/api/unleash?toggle=featureA&toggle=featureB');
        const res = await GET(req);
        const json = await res.json();

        expect(json).toEqual({
            featureA: true,
            featureB: true,
        });
    });

    it('bruker unleash.isEnabled når brukerMock er false', async () => {
        process.env.ENABLE_MOCK = 'disabled';

        vi.spyOn(unleashIsEnabled, 'isEnabled').mockResolvedValueOnce(true).mockResolvedValueOnce(false);

        const req = createRequest('/api/unleash?toggle=featureA&toggle=featureB');
        const res = await GET(req);
        const json = await res.json();

        expect(unleashIsEnabled.isEnabled).toHaveBeenCalledWith('featureA');
        expect(unleashIsEnabled.isEnabled).toHaveBeenCalledWith('featureB');

        expect(json).toEqual({
            featureA: true,
            featureB: false,
        });
    });
});
