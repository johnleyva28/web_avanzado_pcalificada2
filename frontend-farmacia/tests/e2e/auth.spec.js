// E2E: flujo de autenticacion + dashboard + busqueda + permisos por rol
// Ejecuta contra el deploy de produccion (configurable via FRONTEND_URL).
//
// Estrategia para evitar el rate limit del backend (10/15min por IP):
//   1. global-setup.js hace login una sola vez por rol via browser
//      y guarda el storage state (cookies) en tests/e2e/.auth/
//   2. Los tests usan el storage state correspondiente via `storageState`
//      para NO volver a llamar /api/auth/login
//   3. El unico test que SI hace login (credenciales invalidas)
//      consume un slot del rate limit, pero esta aislado.

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE = process.env.FRONTEND_URL || 'https://web-avanzado-pcalificada2-1.onrender.com';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

const AUTH_DIR = path.join(__dirname, '.auth');
const adminState = path.join(AUTH_DIR, 'admin.json');
const hasAdminState = fs.existsSync(adminState);

const skipIfNoAdminState = !hasAdminState || !ADMIN_EMAIL;
const adminTest = skipIfNoAdminState ? test.skip : test.use({ storageState: adminState });

test.describe('Auth + dashboard', () => {
  test('Login page renderiza con split layout', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page).toHaveTitle(/Iniciar sesi/i);
    await expect(page.locator('.auth-brand')).toBeVisible();
    await expect(page.locator('.tarjeta-auth')).toBeVisible();
  });

  test('Login con credenciales invalidas muestra error', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.fill('#login-email', 'noexiste@x.com');
    await page.fill('#login-password', 'wrongpass');
    await page.click('#btn-login');
    await expect(page.locator('#mensaje-global')).toContainText(
      /credenciales|inválid|usuario/i
    );
    await expect(page.locator('#navbar-farmacia')).toBeHidden();
  });

  adminTest('Login admin exitoso redirige a home y muestra navbar', async ({ page, context }) => {
    await page.goto(`${BASE}/home.html`);
    await expect(page.locator('.tarjeta-bienvenida')).toBeVisible();
    await expect(page.locator('#navbar-farmacia .user-chip')).toBeVisible();
    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name === 'farmacia_token');
    expect(session, 'cookie de sesion').toBeTruthy();
    expect(session.httpOnly, 'cookie httpOnly').toBe(true);
  });

  adminTest('Home admin: ve tipos + medicamentos con badges correctos', async ({ page }) => {
    await page.goto(`${BASE}/home.html`);
    const medModulo = page.locator('.tarjeta-modulo').filter({ hasText: 'Medicamentos' });
    await expect(medModulo).toBeVisible();
    await expect(medModulo.locator('small')).toContainText(/escritura/i);
    const tiposModulo = page.locator('.tarjeta-modulo').filter({ hasText: 'Tipos' });
    await expect(tiposModulo).toBeVisible();
    await expect(tiposModulo.locator('small')).toContainText(/escritura/i);
  });

  adminTest('Logout limpia cookie y vuelve a login', async ({ page, context }) => {
    await page.goto(`${BASE}/home.html`);
    await expect(page.locator('#btn-cerrar-sesion')).toBeVisible();
    await page.click('#btn-cerrar-sesion');
    await page.waitForURL(/index\.html/, { timeout: 10_000 });
    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name === 'farmacia_token');
    expect(session, 'cookie de sesion tras logout').toBeFalsy();
  });
});
