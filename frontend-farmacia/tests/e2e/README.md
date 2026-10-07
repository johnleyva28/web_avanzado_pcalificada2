# Tests E2E con Playwright

Tests end-to-end contra el deploy de produccion en Render.

## Setup

```bash
cd frontend-farmacia
npm install
npx playwright install chromium
cp tests/e2e/.env.test.example tests/e2e/.env.test
# Editar .env.test con credenciales reales
```

## Ejecutar

```bash
# Con .env.test presente
npm run test:e2e

# Con variables de entorno inline
FRONTEND_URL=https://web-avanzado-pcalificada2-1.onrender.com \
API_URL=https://web-avanzado-pcalificada2.onrender.com/api \
TEST_ADMIN_EMAIL=admin@farmacia.com \
TEST_ADMIN_PASSWORD=admin123 \
TEST_MOD_EMAIL=mod@farmacia.com \
TEST_MOD_PASSWORD=mod123 \
TEST_CLIENT_EMAIL=cliente@farmacia.com \
TEST_CLIENT_PASSWORD=cliente123 \
npm run test:e2e
```

## Suites

- `auth.spec.js` — login, logout, navbar, dashboard, cookie httpOnly
- `medicamentos.spec.js` — CRUD por rol, búsqueda, debounce, validaciones
- `tipos.spec.js` — CRUD, FK constraint (no eliminar tipo con medicamentos)

## Configuracion

- Workers: 1 (serial, para no saturar el rate limit de 10/15min del backend)
- Timeout por test: 30s
- Screenshots: solo en fallo
- Traces: en primer retry

## Seguridad

- **Nunca** commitear `tests/e2e/.env.test` — contiene credenciales
- `.env.test` esta en el `.gitignore` (raiz del repo)
- Las credenciales viven solo en runtime, no en el codigo
