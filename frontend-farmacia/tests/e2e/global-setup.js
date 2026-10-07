// Global setup: hace login una sola vez por rol y guarda las cookies
// en tests/e2e/.auth/. Cada test reusa el storage state via `storageState`,
// evitando golpear el rate limit del backend (10/15min por IP).
//
// Si las credenciales no estan configuradas, los tests que dependen
// de login se saltan automaticamente.

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = process.env.FRONTEND_URL || 'https://web-avanzado-pcalificada2-1.onrender.com';

const ROLES = [
  { name: 'admin',   email: process.env.TEST_ADMIN_EMAIL,   password: process.env.TEST_ADMIN_PASSWORD },
  { name: 'mod',     email: process.env.TEST_MOD_EMAIL,     password: process.env.TEST_MOD_PASSWORD },
  { name: 'client',  email: process.env.TEST_CLIENT_EMAIL,  password: process.env.TEST_CLIENT_PASSWORD },
];

const STATE_DIR = path.join(__dirname, '.auth');
fs.mkdirSync(STATE_DIR, { recursive: true });

module.exports = async () => {
  const browser = await chromium.launch();
  for (const role of ROLES) {
    if (!role.email || !role.password) {
      console.log(`[setup] Sin credenciales para ${role.name}, saltando.`);
      continue;
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}/`);
      await page.fill('#login-email', role.email);
      await page.fill('#login-password', role.password);
      await page.click('#btn-login');
      await page.waitForURL(/home\.html/, { timeout: 15_000 });
      await context.storageState({ path: path.join(STATE_DIR, `${role.name}.json`) });
      console.log(`[setup] OK: ${role.name}`);
    } catch (e) {
      console.warn(`[setup] Fallo login ${role.name}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
};
