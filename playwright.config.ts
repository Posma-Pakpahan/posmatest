import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) loadEnvFile('.env');

const manualVerification = process.env.MANUAL_VERIFICATION === '1';

export default defineConfig({
  testDir: './tests',
  timeout: manualVerification ? 300_000 : 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    // Situs produksi dapat menampilkan verifikasi keamanan pada browser otomatis.
    headless: Boolean(process.env.CI),
    baseURL: process.env.BASE_URL || 'https://www.klikindomaret.com',
    locale: 'id-ID',
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'guest', testMatch: 'madu.spec.ts' },
    {
      name: 'auth',
      testMatch: 'auth.setup.ts',
      timeout: 360_000,
      // Login melibatkan kredensial dan OTP, jadi jangan merekam artefaknya.
      use: { headless: false, trace: 'off', screenshot: 'off', video: 'off' },
    },
    {
      name: 'session',
      testMatch: 'keranjang.spec.ts',
      use: {
        storageState: existsSync('playwright/.auth/user.json')
          ? 'playwright/.auth/user.json'
          : undefined,
        trace: 'off',
        screenshot: 'off',
      },
    },
  ],
});
