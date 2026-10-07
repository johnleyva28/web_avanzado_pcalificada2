# Credenciales de acceso

> **Solo para evaluación académica (TECSUP · 2026-II).**  
> Estas cuentas se crean automáticamente al ejecutar `npm run seed` en `backend-farmacia/`.

## Usuarios sembrados por `seed.js`

| Rol            | Email                  | Contraseña   | Notas                                  |
|----------------|------------------------|--------------|----------------------------------------|
| Administrador  | `admin@farmacia.com`   | `admin123`   | Acceso completo a todos los módulos    |
| Moderador      | `mod@farmacia.com`     | `mod123`     | CRUD de medicamentos, lectura en tipos |
| Usuario        | `cliente@farmacia.com` | `cliente123` | Solo lectura de medicamentos           |

## Cómo se crean

```bash
cd backend-farmacia
npm install
npm run seed
```

El script usa `User.findOrCreate`, así que es **idempotente**: si corres `seed` varias veces no duplica usuarios.

## Cómo rotarlas

1. Edita el bloque "Insertar Usuario..." en `backend-farmacia/seed.js` con los nuevos emails/contraseñas.
2. Para producción, **elimina las contraseñas hardcodeadas** y crea los usuarios vía endpoint `POST /api/auth/register` o directamente en la base de datos.
3. No olvides actualizar este archivo si cambias credenciales públicas de prueba.

## Aviso de seguridad

Estas contraseñas son **públicas** y están pensadas solo para evaluación. En un entorno real:
- Usa contraseñas almenazas generadas con `crypto.randomBytes`.
- Nunca las commitees.
- Obliga al usuario a cambiar la contraseña en el primer login.
- Activa 2FA si el sistema lo soporta.