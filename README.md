# `web_avanzado_pcalificada2`

**Evaluación 02** — Desarrollo de Aplicaciones Web Avanzado · TECSUP · Ciclo V · 2026-II

[![Repo](https://img.shields.io/badge/GitHub-repo-181717?logo=github&logoColor=white)](https://github.com/johnleyva28/web_avanzado_pcalificada2) [![Node](https://img.shields.io/badge/Node-%E2%89%A5%2018-339933?logo=node.js&logoColor=white)](https://nodejs.org) [![License](https://img.shields.io/badge/License-Academic-blue)](#licencia)

---

## 📋 Sobre este repositorio

Este repositorio contiene la solución completa de la **Evaluación 02** del curso *Desarrollo de Aplicaciones Web Avanzado* de TECSUP. La evaluación propone **dos ejercicios independientes** que suman 20 puntos: un backend con autenticación JWT y ORM Sequelize para una farmacia, y un frontend HTML/CSS/JS con navbar adaptativo por rol y CRUD sobre dos tablas relacionadas.

| # | Ejercicio | Tema                                              | Puntaje | Carpeta                                                              |
|---|-----------|--------------------------------------------------|--------:|----------------------------------------------------------------------|
| 1 | Backend   | API REST Farmacia (JWT + Sequelize + PostgreSQL) | 10 pts  | [`backend-farmacia/`](./backend-farmacia)                            |
| 2 | Frontend  | SPA estática con login/registro, navbar por rol y CRUD | 10 pts  | [`frontend-farmacia/`](./frontend-farmacia)                          |

---

## 👤 Autor

- **John Marco Leyva Nuñez** — `john.leyva@tecsup.edu.pe`

**Carrera:** Diseño y Desarrollo de Software · **Ciclo:** V · **Grupo:** 01 · **Periodo:** 2026-II

---

## 🚀 Demo en vivo

| Servicio   | Plataforma | URL                                                                  |
|------------|------------|---------------------------------------------------------------------|
| Backend    | Render     | *(configurar tras desplegar — ver sección [Deploy](#-desplegar-en-render))* |
| Frontend   | Render     | *(configurar tras desplegar)*                                       |

---

## 🛠️ Stack tecnológico

- **Node.js** 18+ (probado con v22.x)
- **Express** 4.x — servidor HTTP del backend
- **Sequelize** 6.x — ORM para PostgreSQL
- **PostgreSQL** — base de datos (compatible con Supabase, Render, Neon, etc.)
- **bcryptjs** — hash de contraseñas
- **jsonwebtoken** — emisión/verificación de JWT
- **dotenv** — variables de entorno
- **HTML5 + CSS3 + JavaScript ES6+** — frontend sin frameworks pesados
- **Bootstrap 5.3** — sistema de rejilla y modales
- **Bootstrap Icons** — iconografía

---

## 📂 Estructura del repositorio

```
web_avanzado_pcalificada2/
├── README.md                       ← este archivo
├── .gitignore
│
├── backend-farmacia/               ← Ejercicio 1 (API REST)
│   ├── .env.example                 (plantilla de variables — NO commitear .env)
│   ├── package.json
│   ├── server.js                    (Express + JWT + CORS whitelist)
│   ├── seed.js                      (inserta admin, moderador, cliente y datos demo)
│   ├── config/
│   │   └── database.js              (Sequelize contra DATABASE_URL)
│   ├── models/
│   │   ├── index.js                 (relaciones TipoMedic 1—* Medicamento)
│   │   ├── User.js                  (rol: admin | moderador | cliente)
│   │   ├── TipoMedic.js             (categorías)
│   │   └── Medicamento.js           (productos con FK tipoMedicId)
│   ├── controllers/
│   │   ├── authController.js        (register / login → JWT)
│   │   ├── tipoMedicController.js   (GET / POST)
│   │   └── medicamentoController.js (GET / POST / PUT / DELETE)
│   ├── middlewares/
│   │   └── authMiddleware.js        (verificarToken)
│   └── routes/
│       ├── authRoutes.js            (POST /api/auth/register, /login)
│       ├── tipoMedicRoutes.js       (GET/POST /api/tipos-medicamento)
│       └── medicamentoRoutes.js     (GET/POST/PUT/DELETE /api/medicamentos)
│
└── frontend-farmacia/              ← Ejercicio 2 (UI)
    ├── package.json
    ├── server.js                    (servidor estático que sirve la carpeta public/)
    └── public/
        ├── index.html               (Login)
        ├── register.html              (Registro con selector de rol)
        ├── home.html                 (Menú principal con tarjetas por módulo)
        ├── tipos.html                (CRUD TipoMedic — solo admin)
        ├── medicamentos.html         (CRUD Medicamento — admin + moderador)
        ├── css/
        │   └── styles.css            (paleta azul marino + orangered + animaciones)
        └── js/
            ├── api.js                (fetch + Sesion en sessionStorage)
            ├── validators.js         (validación frontend reutilizable)
            ├── nav.js                (navbar dinámico por rol + buscador)
            ├── auth.js               (login / register)
            ├── home.js               (render del menú principal)
            ├── tipos.js              (CRUD TipoMedic)
            └── medicamentos.js       (CRUD Medicamento)
```

---

## ⚡ Quick start

### 1) Backend

```bash
cd backend-farmacia
npm install
cp .env.example .env       # editar DATABASE_URL y JWT_SECRET
npm run seed               # opcional: crea admin, mod, cliente y 2 tipos con meds demo
npm start                  # levanta el servidor en http://localhost:4000
```

### 2) Frontend

```bash
cd frontend-farmacia
node server.js             # levanta el servidor estático en http://localhost:3000
# Abrir http://localhost:3000
```

> El frontend está pensado como **sitio estático** (HTML/CSS/JS sin build). El `node server.js` solo sirve los archivos de `public/`. En producción, Render lo detecta automáticamente como *Static Site*.

### Usuarios de prueba (creados por `npm run seed`)

| Rol          | Email                  | Contraseña   |
|--------------|------------------------|--------------|
| Administrador | `admin@farmacia.com`   | `admin123`   |
| Moderador    | `mod@farmacia.com`     | `mod123`     |
| Usuario       | `cliente@farmacia.com` | `cliente123` |

---

## 🔐 Endpoints del backend

| Método | Ruta                              | Auth | Descripción                              |
|--------|-----------------------------------|------|------------------------------------------|
| POST   | `/api/auth/register`              | ❌   | Registrar usuario nuevo (con `rol`)      |
| POST   | `/api/auth/login`                 | ❌   | Iniciar sesión → devuelve `{ token, usuario }` |
| GET    | `/api/tipos-medicamento`          | ❌   | Listar tipos de medicamento              |
| POST   | `/api/tipos-medicamento`          | ✅   | Crear tipo (solo admin recomendado)      |
| GET    | `/api/medicamentos`               | ❌   | Listar medicamentos (incluye `tipo`)     |
| POST   | `/api/medicamentos`               | ✅   | Crear medicamento                        |
| PUT    | `/api/medicamentos/:id`           | ✅   | Actualizar medicamento                   |
| DELETE | `/api/medicamentos/:id`           | ✅   | Eliminar medicamento                     |

> `Auth = ✅` requiere header `Authorization: Bearer <token>`.

---

## 👥 Roles y permisos (frontend)

| Rol              | Navbar                                       | Tipos de Medicamento | Medicamentos |
|------------------|----------------------------------------------|----------------------|--------------|
| **Administrador** (`admin`) | Inicio · Tipos de Medicamento · Medicamentos | CRUD completo        | CRUD completo |
| **Moderador**    (`moderador`) | Inicio · Tipos de Medicamento · Medicamentos | Solo lectura         | Crear + Editar (no eliminar) |
| **Usuario**       (`cliente`)    | Inicio · Medicamentos                         | Sin acceso           | Solo lectura |

La barra de navegación y la visibilidad de los botones cambian automáticamente según el rol del usuario autenticado.

---

## ✅ Cumplimiento de la rúbrica

### Ejercicio 1 — Backend Farmacia (10 pts)

| Criterio                                                       | Estado |
|----------------------------------------------------------------|:------:|
| JWT Authentication implementado con `jsonwebtoken` y `bcryptjs` | ✅    |
| Base de datos `bd_Farmacia` con Sequelize (PostgreSQL)         | ✅    |
| 2 tablas relacionadas (`tipos_medicamento` ↔ `medicamentos`)    | ✅    |
| Relación FK `tipoMedicId` declarada con Sequelize                | ✅    |
| CRUD completo con Sequelize                                     | ✅    |
| `seed.js` inserta registros de prueba                           | ✅    |

### Ejercicio 2 — Frontend (10 pts)

| Criterio                                                                       | Estado |
|------------------------------------------------------------------------------|:------:|
| Páginas de inicio/cierre de sesión y registro                                | ✅    |
| Validación de formularios en el frontend antes de enviar al backend         | ✅    |
| Navbar cambia según rol (admin / moderador / usuario)                        | ✅    |
| Menú principal post-login con tarjetas por módulo                           | ✅    |
| CRUD de las dos tablas relacionadas (`TipoMedic` + `Medicamento`)             | ✅    |
| UI construida con Bootstrap 5 + CSS personalizado (paleta azul + orangered)    | ✅    |

---

## 🔐 Seguridad

- **`.env` ignorado por git** — tanto en `backend-farmacia/` como en `frontend-farmacia/`. El `.env.example` documenta las claves necesarias, pero los valores reales nunca se suben al repositorio.
- **CORS whitelist por origen** — el frontend debe estar declarado en la variable `FRONTEND_URL` del `.env` del backend. Peticiones desde otros orígenes son rechazadas.
- **JWT firmado con `JWT_SECRET`** — generar uno nuevo para producción:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- **Contraseñas hasheadas con bcrypt** (10 rondas). Nunca se devuelven al frontend.
- **Nunca compartir claves en issues, PRs o capturas.** Si la `JWT_SECRET` o la `DATABASE_URL` se filtran, rotarlas de inmediato.

---

## 📦 Desplegar en Render

### Backend (Web Service)

1. Sube el repo a GitHub (ver instrucciones más abajo).
2. En Render → **New** → **Web Service** → conecta el repo.
3. Configuración:
   - **Root Directory:** `backend-farmacia`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
4. Variables de entorno (`Environment → Add Secret`):
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<cadena_postgres_remota>
   JWT_SECRET=<cadena_aleatoria_larga>
   JWT_EXPIRES_IN=8h
   FRONTEND_URL=https://<tu-frontend>.onrender.com
   ```
5. Tras desplegar, anota la URL del backend, por ejemplo `https://farmacia-api-xxxx.onrender.com`.

### Frontend (Static Site)

1. Render → **New** → **Static Site** → conecta el mismo repo.
2. Configuración:
   - **Root Directory:** `frontend-farmacia`
   - **Build Command:** *(vacío)*
   - **Publish Directory:** `public`
3. Variables: ninguna necesaria.
4. Una vez desplegado, vuelve al **Web Service** del backend y actualiza `FRONTEND_URL` con la URL del frontend (ej. `https://farmacia-ui-xxxx.onrender.com`).

### Verificación post-despliegue

```bash
curl https://<tu-backend>.onrender.com/
# {"message":"API REST Farmacia activa"}

curl -X POST https://<tu-backend>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farmacia.com","password":"admin123"}'
```

Y abrir `https://<tu-frontend>.onrender.com/` para usar la UI.

---

## 🪪 Licencia

Material académico del curso *Desarrollo de Aplicaciones Web Avanzado* de TECSUP. Uso educativo.