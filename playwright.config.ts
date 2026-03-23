import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: [['html', { open: 'never' }], ['line']],
    use: {
        baseURL: 'http://127.0.0.1:3000/arbeid/registrering/',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    webServer: {
        command: 'NEXT_PUBLIC_ENABLE_MOCK=enabled ENABLE_MOCK=enabled next dev --webpack',
        url: 'http://127.0.0.1:3000/arbeid/registrering/',
        reuseExistingServer: !isCI,
        timeout: 120000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
