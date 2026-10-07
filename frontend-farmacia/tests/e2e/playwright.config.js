// playwright.config.js — E2E contra el deploy de produccion en Render.
//
// Las credenciales se leen de variables de entorno para NUNCA
// commitearlas al repo. Ver tests/e2e/.env.test.example.
//
// Uso:
//   cp tests/e2e/.env.test.example tests/e2e/.env.test
//   editar .env.test con valores reales (NO commitear)
//   npm run test:e2e
//
// Para QA contra produccion:
//   FRONTEND_URL=https://web-avanzado-pcalificada2-1.onrender.com \
//   API_URL=https://web-avanzado-pcalificada2.onrender.com/api \
//   TEST_ADMIN_EMAIL=... \
//   TEST_ADMIN_PASSWORD=... \
//   npm run test:e2e

const { defineConfig, devices } = require('@playwright/test');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';
const API_URL = process.env.API_URL || 'http://localhost:4000/api';

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  globalSetup: require.resolve('./global-setup.js'),
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      // Usar el Chrome del sistema si esta instalado (no requiere
      // descargar ~150MB de chromium bundled). Si no hay Chrome,
      // correr 'npx playwright install' una vez y quitar channel.
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  metadata: {
    frontend_url: FRONTEND_URL,
    api_url: API_URL,
  },
});
