// E2E: CRUD de medicamentos + busqueda + validaciones
// Reusa storage state de tests/e2e/.auth/ para no consumir rate limit.
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE = process.env.FRONTEND_URL || 'https://web-avanzado-pcalificada2-1.onrender.com';

const AUTH_DIR = path.join(__dirname, '.auth');
const adminState = path.join(AUTH_DIR, 'admin.json');
const modState = path.join(AUTH_DIR, 'mod.json');
const clientState = path.join(AUTH_DIR, 'client.json');

const adminTest = !fs.existsSync(adminState) ? test.skip : test.use({ storageState: adminState });
const modTest = !fs.existsSync(modState) ? test.skip : test.use({ storageState: modState });
const clientTest = !fs.existsSync(clientState) ? test.skip : test.use({ storageState: clientState });

test.describe('Medicamentos - permisos y CRUD', () => {
  adminTest('Admin: ve tabla, boton Nuevo visible, y botones Editar/Eliminar activos', async ({ page }) => {
    await page.goto(`${BASE}/medicamentos.html`);
    await expect(page.locator('#tbody-medicamentos tr').first()).toBeVisible();
    await expect(page.locator('#btn-nuevo-medicamento')).toBeVisible();
    const editarBtns = page.locator('#tbody-medicamentos button[data-action="editar"]');
    const eliminarBtns = page.locator('#tbody-medicamentos button[data-action="eliminar"]');
    await expect(editarBtns.first()).toBeEnabled();
    await expect(eliminarBtns.first()).toBeEnabled();
  });

  adminTest('Admin: crear medicamento desde modal, aparece en tabla, toast exito', async ({ page }) => {
    await page.goto(`${BASE}/medicamentos.html`);
    const nombre = `QA Test ${Date.now()}`;
    await page.click('#btn-nuevo-medicamento');
    await expect(page.locator('#modal-medicamento')).toBeVisible();
    await page.fill('#med-nombre', nombre);
    await page.fill('#med-descripcion', 'Creado por Playwright QA');
    await page.fill('#med-precio', '99.99');
    await page.fill('#med-stock', '42');
    const opciones = page.locator('#med-tipo option');
    await expect(opciones.nth(1)).toBeAttached();
    await page.selectOption('#med-tipo', { index: 1 });
    await page.click('#modal-medicamento button[type="submit"]');
    await expect(page.locator('.toast-item.toast-success')).toContainText(/creado/i, { timeout: 5_000 });
    await expect(page.locator(`#tbody-medicamentos tr:has-text("${nombre}")`)).toBeVisible();
  });

  adminTest('Admin: busqueda por nombre filtra la tabla', async ({ page }) => {
    await page.goto(`${BASE}/medicamentos.html`);
    const totalAntes = await page.locator('#tbody-medicamentos tr:visible').count();
    expect(totalAntes).toBeGreaterThan(0);
    await page.fill('#input-buscar-nav', 'QA Test');
    await expect(page.locator('#btn-limpiar-buscar-nav')).toBeVisible();
    await page.waitForTimeout(400);
    const totalDespues = await page.locator('#tbody-medicamentos tr:visible').count();
    expect(totalDespues).toBeLessThan(totalAntes);
  });

  adminTest('Admin: boton X limpia la busqueda y muestra todas las filas', async ({ page }) => {
    await page.goto(`${BASE}/medicamentos.html`);
    await page.fill('#input-buscar-nav', 'xyz_no_existe');
    await page.waitForTimeout(400);
    await expect(page.locator('.sin-resultados-busqueda')).toBeVisible();
    await page.click('#btn-limpiar-buscar-nav');
    await expect(page.locator('.sin-resultados-busqueda')).toHaveCount(0);
  });

  modTest('Moderador: ve boton Nuevo y puede crear, pero NO puede eliminar', async ({ page }) => {
    await page.goto(`${BASE}/medicamentos.html`);
    await expect(page.locator('#btn-nuevo-medicamento')).toBeVisible();
    const eliminarBtns = page.locator('#tbody-medicamentos button[data-action="eliminar"]');
    await expect(eliminarBtns.first()).toBeDisabled();
  });

  clientTest('Cliente: ve tabla pero NO ve boton Nuevo ni puede eliminar', async ({ page }) => {
    await page.goto(`${BASE}/medicamentos.html`);
    await expect(page.locator('#btn-nuevo-medicamento')).toBeHidden();
    const editarBtns = page.locator('#tbody-medicamentos button[data-action="editar"]');
    const eliminarBtns = page.locator('#tbody-medicamentos button[data-action="eliminar"]');
    await expect(editarBtns.first()).toBeDisabled();
    await expect(eliminarBtns.first()).toBeDisabled();
  });

  clientTest('Cliente: tipos.html redirige a home (no tiene acceso)', async ({ page }) => {
    await page.goto(`${BASE}/tipos.html`);
    await page.waitForURL(/home\.html/, { timeout: 5_000 });
  });
});
