import { defineConfig, devices } from '@playwright/test';

const storybookUrl = 'http://127.0.0.1:6006';

export default defineConfig({
    testDir: './e2e',
    testMatch: '**/uu-komponenter.storybook.ts',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    reporter: 'line',
    use: {
        baseURL: storybookUrl,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    webServer: {
        command: 'storybook dev --port 6006 --ci',
        url: storybookUrl,
        reuseExistingServer: false,
        timeout: 120_000,
    },
    projects: [
        {
            name: 'desktop',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'smalchromium320',
            use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 800 } },
        },
    ],
});
