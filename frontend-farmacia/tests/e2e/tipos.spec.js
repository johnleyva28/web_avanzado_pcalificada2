// E2E: CRUD de tipos + verificar que tipos con medicamentos asociados no se eliminan
// Reusa storage state de tests/e2e/.auth/ para no consumir rate limit.
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE = process.env.FRONTEND_URL || 'https://web-avanzado-pcalificada2-1.onrender.com';
const AUTH_DIR = path.join(__dirname, '.auth');
const adminState = path.join(AUTH_DIR, 'admin.json');

const adminTest = !fs.existsSync(adminState) ? test.skip : test.use({ storageState: adminState });

test.describe('Tipos de Medicamento', () => {
  adminTest('Admin: crear tipo, aparece en tabla', async ({ page }) => {
    await page.goto(`${BASE}/tipos.html`);
    const nombre = `QA Tipo ${Date.now()}`;
    await page.click('#btn-nuevo-tipo');
    await expect(page.locator('#modal-tipo')).toBeVisible();
    await page.fill('#tipo-nombre', nombre);
    await page.fill('#tipo-descripcion', 'Tipo de prueba QA');
    await page.click('#modal-tipo button[type="submit"]');
    await expect(page.locator('.toast-item.toast-success')).toContainText(/creado/i, { timeout: 5_000 });
    await expect(page.locator(`#tbody-tipos tr:has-text("${nombre}")`)).toBeVisible();
  });

  adminTest('Admin: editar tipo actualiza la fila', async ({ page }) => {
    await page.goto(`${BASE}/tipos.html`);
    const original = `QA Original ${Date.now()}`;
    const actualizado = `QA Editado ${Date.now()}`;
    await page.click('#btn-nuevo-tipo');
    await page.fill('#tipo-nombre', original);
    await page.click('#modal-tipo button[type="submit"]');
    await expect(page.locator(`#tbody-tipos tr:has-text("${original}")`)).toBeVisible();
    const fila = page.locator(`#tbody-tipos tr:has-text("${original}")`);
    await fila.locator('button[data-action="editar"]').click();
    await expect(page.locator('#modal-tipo')).toBeVisible();
    await expect(page.locator('#tipo-nombre')).toHaveValue(original);
    await page.fill('#tipo-nombre', actualizado);
    await page.click('#modal-tipo button[type="submit"]');
    await expect(page.locator('.toast-item.toast-success')).toContainText(/actualizado/i, { timeout: 5_000 });
    await expect(page.locator(`#tbody-tipos tr:has-text("${actualizado}")`)).toBeVisible();
    await expect(page.locator(`#tbody-tipos tr:has-text("${original}")`)).toHaveCount(0);
  });

  adminTest('Admin: intentar eliminar tipo con medicamentos asociados da error', async ({ page }) => {
    await page.goto(`${BASE}/tipos.html`);
    const analgesicos = page.locator('#tbody-tipos tr:has-text("Analgésicos")');
    await expect(analgesicos).toBeVisible();
    page.on('dialog', (d) => d.accept());
    await analgesicos.locator('button[data-action="eliminar"]').click();
    await expect(page.locator('.toast-item.toast-danger')).toContainText(/medicamentos asociados|asociado/i, { timeout: 5_000 });
  });
});
