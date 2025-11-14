import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  use: {
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
    headless: false,                 // <-- LIVE browser
    launchOptions: { devtools: true }, // <-- DevTools visible
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
