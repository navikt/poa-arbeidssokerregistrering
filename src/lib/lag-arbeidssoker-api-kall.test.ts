// @vitest-environment node
import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const oasis = vi.hoisted(() => ({
    getToken: vi.fn(),
    requestTokenxOboToken: vi.fn(),
    parseIdportenToken: vi.fn(),
}));

vi.mock('@navikt/oasis', () => oasis);
vi.mock('@navikt/next-logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const INNGANG = 'https://inngang.test';
const PID = '12345678910';

const lagRequest = (body?: unknown) =>
    ({
        json: () => (body === undefined ? Promise.reject(new Error('ingen kropp')) : Promise.resolve(body)),
    }) as unknown as NextRequest;

const fetchMock = vi.fn();

async function lastRuter() {
    vi.resetModules();
    vi.stubEnv('INNGANG_API_URL', INNGANG);
    vi.stubEnv('NEXT_PUBLIC_ENABLE_MOCK', 'disabled');
    const start = await import('@/app/api/start-arbeidssokerperiode-v2/route');
    const opplysninger = await import('@/app/api/opplysninger/route');
    return { startPeriode: start.PUT, sendOpplysninger: opplysninger.POST };
}

function sendtKall() {
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    return { url, method: init.method, body: JSON.parse(init.body), headers: init.headers };
}

function loggInnSom(pid: string | undefined) {
    oasis.getToken.mockReturnValue('idporten-token');
    oasis.requestTokenxOboToken.mockResolvedValue({ ok: true, token: 'tokenx-token' });
    oasis.parseIdportenToken.mockReturnValue(pid ? { ok: true, pid } : { ok: false, error: new Error('ugyldig') });
}

beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    loggInnSom(PID);
});

afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('integritet: start av arbeidssøkerperiode', () => {
    it('sender PUT til inngang med periodeTilstand STARTET og identitet fra token', async () => {
        const { startPeriode } = await lastRuter();
        const res = await startPeriode(lagRequest());

        expect(res.status).toBe(204);
        const kall = sendtKall();
        expect(kall.url).toBe(`${INNGANG}/api/v2/arbeidssoker/periode`);
        expect(kall.method).toBe('PUT');
        expect(kall.body).toEqual({ identitetsnummer: PID, periodeTilstand: 'STARTET' });
        expect(kall.headers.Authorization).toBe('Bearer tokenx-token');
    });

    it('klienten kan ikke overstyre identitetsnummer eller periodeTilstand', async () => {
        const { startPeriode } = await lastRuter();
        await startPeriode(lagRequest({ identitetsnummer: '01987654321', periodeTilstand: 'AVSLUTTET' }));

        expect(sendtKall().body).toEqual({ identitetsnummer: PID, periodeTilstand: 'STARTET' });
    });

    it('avviser med 401 og sender ingenting når token mangler identitet', async () => {
        loggInnSom(undefined);
        const { startPeriode } = await lastRuter();
        const res = await startPeriode(lagRequest());

        expect(res.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
        ['fødselsnummer', '12345678910'],
        ['d-nummer', '52345678910'],
        ['syntetisk nummer fra Dolly', '12845678910'],
        ['person under 18 år', '01011099999'],
        ['person over 67 år', '01015099999'],
    ])('gir likt kall for alle personer: %s', async (_beskrivelse, pid) => {
        loggInnSom(pid);
        const { startPeriode } = await lastRuter();
        await startPeriode(lagRequest());

        const kall = sendtKall();
        expect(kall.url).toBe(`${INNGANG}/api/v2/arbeidssoker/periode`);
        expect(kall.method).toBe('PUT');
        expect(kall.body).toEqual({ identitetsnummer: pid, periodeTilstand: 'STARTET' });
    });

    it('melder ikke suksess når backend avviser', async () => {
        fetchMock.mockResolvedValue(new Response('feil', { status: 403, statusText: 'Forbidden' }));
        const { startPeriode } = await lastRuter();
        const res = await startPeriode(lagRequest());

        expect(res.status).toBe(403);
    });

    it('melder ikke suksess når TokenX-veksling feiler', async () => {
        oasis.requestTokenxOboToken.mockResolvedValue({ ok: false, error: new Error('tokenx nede') });
        const { startPeriode } = await lastRuter();
        const res = await startPeriode(lagRequest());

        expect(res.status).toBe(500);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('integritet: innsending av opplysninger', () => {
    const opplysninger = {
        opplysningerOmArbeidssoeker: {
            utdanning: { nus: '6', bestaatt: 'JA', godkjent: 'JA' },
            helse: { helsetilstandHindrerArbeid: 'NEI' },
            jobbsituasjon: {
                beskrivelser: [
                    {
                        beskrivelse: 'HAR_SAGT_OPP',
                        detaljer: { stilling: 'Kokk', stilling_styrk08: '5120' },
                    },
                ],
            },
            annet: { andreForholdHindrerArbeid: 'NEI' },
        },
    };

    it('videresender brukerens opplysninger uendret med identitet fra token', async () => {
        fetchMock.mockResolvedValue(Response.json({}));
        const { sendOpplysninger } = await lastRuter();
        const res = await sendOpplysninger(lagRequest(opplysninger));

        expect(res.status).toBe(200);
        const kall = sendtKall();
        expect(kall.url).toBe(`${INNGANG}/api/v1/arbeidssoker/opplysninger`);
        expect(kall.method).toBe('POST');
        expect(kall.body).toEqual({ ...opplysninger, identitetsnummer: PID });
    });

    it('klienten kan ikke overstyre identitetsnummer', async () => {
        const { sendOpplysninger } = await lastRuter();
        await sendOpplysninger(lagRequest({ ...opplysninger, identitetsnummer: '01987654321' }));

        expect(sendtKall().body.identitetsnummer).toBe(PID);
    });

    it('ignorerer kropp som ikke er et objekt', async () => {
        const { sendOpplysninger } = await lastRuter();
        await sendOpplysninger(lagRequest(['a', 'b']));

        expect(sendtKall().body).toEqual({ identitetsnummer: PID });
    });
});
