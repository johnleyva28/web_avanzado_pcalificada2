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

| Servicio  | Plataforma | URL                                                                       |
|-----------|------------|---------------------------------------------------------------------------|
| Backend   | Render     | https://web-avanzado-pcalificada2.onrender.com/api                        |
| Frontend  | Render     | https://web-avanzado-pcalificada2-1.onrender.com/                         |

> El frontend en `:5500` y el backend en `:4000` también se pueden levantar en local siguiendo la sección [Quick start](#-quick-start).

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
├── CREDENCIALES.md                  ← credenciales de prueba (solo evaluación)
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
    ├── server.js                    (servidor estático que sirve public/ en :5500)
    └── public/
        ├── index.html               (Login con split layout)
        ├── register.html              (Registro con selector de rol)
        ├── home.html                 (Menú con tarjetas + stats reales)
        ├── tipos.html                (CRUD TipoMedic — solo admin)
        ├── medicamentos.html         (CRUD Medicamento — admin + moderador)
        ├── favicon.svg               (icono del sitio)
        ├── apple-touch-icon.svg
        ├── css/
        │   └── styles.css            (paleta azul + orangered, animaciones, glassmorphism)
        └── js/
            ├── config.js             (resuelve la URL del backend según entorno)
            ├── api.js                (fetch + Sesion en sessionStorage)
            ├── validators.js         (validación frontend reutilizable)
            ├── toast.js              (sistema de notificaciones)
            ├── nav.js                (navbar dinámico por rol + buscador)
            ├── auth.js               (login / register)
            ├── home.js               (render del menú + stats)
            ├── tipos.js              (CRUD TipoMedic)
            └── medicamentos.js       (CRUD Medicamento)
```

---

## ⚡ Quick start

### 1) Backend

```bash
cd backend-farmacia
npm install
cp .env.example .env       # editar DATABASE_URL, JWT_SECRET y FRONTEND_URL (incluir http://localhost:5500)
npm run seed               # opcional: crea admin, mod, cliente y 2 tipos con meds demo
npm start                  # levanta el servidor en http://localhost:4000
```

### 2) Frontend

```bash
cd frontend-farmacia
node server.js             # levanta el servidor estático en http://localhost:5500
# Abrir http://localhost:5500
```

> El frontend está pensado como **sitio estático** (HTML/CSS/JS sin build). El `node server.js` solo sirve los archivos de `public/`.

### 3) Probar la app

Las credenciales de los usuarios sembrados están en [`CREDENCIALES.md`](./CREDENCIALES.md).

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
- **Credenciales de prueba** documentadas en [`CREDENCIALES.md`](./CREDENCIALES.md) — son públicas y solo válidas para evaluación académica.

---

## 🪪 Licencia

Material académico del curso *Desarrollo de Aplicaciones Web Avanzado* de TECSUP. Uso educativo.
