import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const isDekoratorSmoke = process.env.UU_DEKORATOR_SMOKE === '1';
const dekoratorStub = resolve(process.cwd(), 'e2e/dekorator-stub.mjs');
const dekoratorPreload = `--import=${JSON.stringify(pathToFileURL(dekoratorStub).href)}`;

export default defineConfig({
    testDir: './e2e',
    testMatch: isDekoratorSmoke ? '**/dekorator.smoke.spec.ts' : undefined,
    testIgnore: isDekoratorSmoke ? undefined : '**/dekorator.smoke.spec.ts',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : 2,
    reporter: [['html', { open: 'never' }], ['line']],
    use: {
        baseURL: 'http://127.0.0.1:3000/arbeid/registrering/',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    webServer: {
        command: 'next dev --webpack',
        env: {
            NEXT_PUBLIC_ENABLE_MOCK: 'enabled',
            ENABLE_MOCK: 'enabled',
            NODE_ENV: 'development',
            UU_TEST: isDekoratorSmoke ? '' : '1',
            UU_DEKORATOR_SMOKE: isDekoratorSmoke ? '1' : '',
            // Ikke la smoke-serveren arve testpreload eller andre NODE_OPTIONS fra skallet.
            NODE_OPTIONS: isDekoratorSmoke ? '' : dekoratorPreload,
        },
        url: 'http://127.0.0.1:3000/arbeid/registrering/',
        reuseExistingServer: false,
        timeout: 120000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'chromium-narrow',
            use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 800 } },
        },
    ],
});
