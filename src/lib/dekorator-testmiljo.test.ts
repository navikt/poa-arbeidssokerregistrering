// @vitest-environment node

import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

const stubPath = fileURLToPath(new URL('../../e2e/dekorator-stub.mjs', import.meta.url));
const playwrightConfigUrl = pathToFileURL(fileURLToPath(new URL('../../playwright.config.ts', import.meta.url))).href;
const guardMessage = 'Dekoratørstubben kan bare brukes i et eksplisitt lokalt UU-testmiljø, aldri i smoke eller Nais.';
const requiredEnvironment = {
    UU_TEST: '1',
    ENABLE_MOCK: 'enabled',
    NEXT_PUBLIC_ENABLE_MOCK: 'enabled',
    NODE_ENV: 'development',
};
const isolatedEnvironmentKeys = [
    'NODE_OPTIONS',
    'UU_TEST',
    'UU_DEKORATOR_SMOKE',
    'ENABLE_MOCK',
    'NEXT_PUBLIC_ENABLE_MOCK',
    'NAIS_CLUSTER_NAME',
    'NAIS_APP_NAME',
    'NAIS_NAMESPACE',
];

const environmentForChild = (overrides: Record<string, string | undefined> = {}) => {
    const env = { ...process.env };
    for (const key of isolatedEnvironmentKeys) {
        delete env[key];
    }
    Object.assign(env, requiredEnvironment);
    for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined) {
            delete env[key];
        } else {
            env[key] = value;
        }
    }
    return env;
};

const runWithStub = (script: string, env = environmentForChild()) =>
    spawnSync(process.execPath, ['--import', stubPath, '--input-type=module', '-e', script], {
        encoding: 'utf8',
        env,
        timeout: 10_000,
    });

const expectGuardFailure = (env: Record<string, string | undefined>) => {
    const result = runWithStub('', environmentForChild(env));
    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(guardMessage);
};

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('lokal dekoratørstub', () => {
    it('svarer bare på dekoratørens lokale testendepunkter og bidrar med CSP', () => {
        const result = runWithStub(`
            import assert from 'node:assert/strict';
            import { createRequire } from 'node:module';

            const cspResponse = await fetch('https://www.nav.no/dekoratoren/api/csp');
            assert.deepEqual(await cspResponse.json(), { 'script-src': ["'self'", "'unsafe-eval'"] });
            const ssrResponse = await fetch('https://www.nav.no/dekoratoren/ssr');
            assert.match((await ssrResponse.json()).headAssets, /uu-dekorator/);
            await assert.rejects(fetch('https://www.nav.no/dekoratoren/ukjent'), /ukjent URL/);
            await assert.rejects(fetch('https://example.org/'), /avviste ekstern fetch/);

            const { buildCspHeader } = createRequire(import.meta.url)('@navikt/nav-dekoratoren-moduler/ssr');
            const policy = {
                'default-src': ["'self'", '*.nav.no', '*.labs.nais.no'],
                'script-src-elem': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
                'style-src': ["'self'", "'unsafe-inline'", '*.nav.no', '*.labs.nais.no'],
                'style-src-elem': ["'self'", '*.nav.no', '*.labs.nais.no'],
                'img-src': ["'self'", 'data:', '*.difi.no'],
                'connect-src': ["'self'", '*.nav.no', '*.labs.nais.no'],
            };
            const header = await buildCspHeader(policy, { env: process.env.DEKORATOR_ENV });
            const directives = Object.fromEntries(header.split(';').map((part) => {
                const [name, ...values] = part.trim().split(/\\s+/);
                return [name, values];
            }));
            assert.deepEqual(directives['script-src'], ["'self'", "'unsafe-eval'"]);
            for (const [name, values] of Object.entries(policy)) {
                if (name !== 'script-src') assert.deepEqual(directives[name], values, name);
            }
            assert.ok(!directives['script-src'].some((value) => value === '*' || value === "'unsafe-inline'"));
        `);

        expect(result.error).toBeUndefined();
        expect(result.status, result.stderr).toBe(0);
    });

    it('rejects startup if any required local test flag is absent', () => {
        for (const key of Object.keys(requiredEnvironment)) {
            expectGuardFailure({ [key]: undefined });
        }
    });

    it('rejects startup when required flags have invalid values', () => {
        for (const [key, value] of Object.entries({
            UU_TEST: 'true',
            ENABLE_MOCK: '1',
            NEXT_PUBLIC_ENABLE_MOCK: '1',
            NODE_ENV: 'local',
        })) {
            expectGuardFailure({ [key]: value });
        }
    });

    it.each(['production', 'test'])('rejects NODE_ENV=%s', (nodeEnv) => {
        expectGuardFailure({ NODE_ENV: nodeEnv });
    });

    it.each(['NAIS_CLUSTER_NAME', 'NAIS_APP_NAME', 'NAIS_NAMESPACE'])('rejects startup when %s is present', (key) => {
        expectGuardFailure({ [key]: 'cluster-value' });
        expectGuardFailure({ [key]: '' });
    });

    it('rejects startup in smoke mode', () => {
        expectGuardFailure({ UU_DEKORATOR_SMOKE: '1' });
    });

    it.each([
        ['NODE_ENV', 'production'],
        ['UU_TEST', '0'],
    ])('rechecks %s before dekoratør and loopback fetches', async (key, value) => {
        const result = runWithStub(`
            import assert from 'node:assert/strict';
            process.env[${JSON.stringify(key)}] = ${JSON.stringify(value)};
            await assert.rejects(fetch('https://www.nav.no/dekoratoren/api/csp'), /${guardMessage}/);
            await assert.rejects(fetch('http://127.0.0.1:3000/'), /${guardMessage}/);
        `);
        expect(result.error).toBeUndefined();
        expect(result.status, result.stderr).toBe(0);
    });
});

describe('Playwright dekoratørstub-konfigurasjon', () => {
    it('setter preload-URL i vanlig testmodus og overstyrer arvede testflagg', async () => {
        vi.stubEnv('UU_DEKORATOR_SMOKE', '');
        vi.stubEnv('NODE_OPTIONS', 'arvet verdi');
        vi.stubEnv('UU_TEST', 'arvet verdi');
        vi.stubEnv('ENABLE_MOCK', 'arvet verdi');
        vi.stubEnv('NEXT_PUBLIC_ENABLE_MOCK', 'arvet verdi');
        vi.stubEnv('NODE_ENV', 'production');
        vi.resetModules();

        const { default: config } = await import(playwrightConfigUrl);
        expect(config.webServer?.env).toMatchObject({
            ENABLE_MOCK: 'enabled',
            NEXT_PUBLIC_ENABLE_MOCK: 'enabled',
            NODE_ENV: 'development',
            UU_TEST: '1',
        });
        expect(config.webServer?.env?.NODE_OPTIONS).toContain('--import=');
        expect(decodeURIComponent(config.webServer?.env?.NODE_OPTIONS ?? '')).toContain(stubPath);
    });

    it('fjerner preload og UU-flagg fra webserveren i smoke mode', async () => {
        vi.stubEnv('UU_DEKORATOR_SMOKE', '1');
        vi.stubEnv('NODE_OPTIONS', 'arvet verdi');
        vi.stubEnv('UU_TEST', 'arvet verdi');
        vi.stubEnv('ENABLE_MOCK', 'arvet verdi');
        vi.stubEnv('NEXT_PUBLIC_ENABLE_MOCK', 'arvet verdi');
        vi.stubEnv('NODE_ENV', 'production');
        vi.resetModules();

        const { default: config } = await import(playwrightConfigUrl);
        expect(config.testMatch).toBe('**/dekorator.smoke.spec.ts');
        expect(config.webServer?.env).toMatchObject({
            ENABLE_MOCK: 'enabled',
            NEXT_PUBLIC_ENABLE_MOCK: 'enabled',
            NODE_ENV: 'development',
            NODE_OPTIONS: '',
            UU_TEST: '',
            UU_DEKORATOR_SMOKE: '1',
        });
    });
});
