import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from local .env if present
dotenv.config({ path: path.resolve(__dirname, '.env') });

const UI_BASE_URL = process.env.UI_BASE_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
      },
    },
    {
      name: 'integration',
      testDir: './tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
      },
    },
  ],
});
