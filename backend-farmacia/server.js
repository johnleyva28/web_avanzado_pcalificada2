const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { sequelize } = require('./models');

// Rutas
const authRoutes = require('./routes/authRoutes');
const tipoMedicRoutes = require('./routes/tipoMedicRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');

const app = express();

// Detrás de Render el servicio corre tras un proxy; necesario para
// que req.ip refleje la IP del cliente (no del load balancer) y
app.set('trust proxy', 1);

// Helmet con CSP custom: 'unsafe-inline' en style-src es necesario
// porque Bootstrap inyecta estilos inline; los CDNs están pinned en
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'data:'],
        connectSrc: ["'self'", 'https://*.onrender.com'],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // requerido para fuentes externas
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

// Login: 10 intentos / 15 min por IP. Register: 5 / 15 min.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Intenta en 15 minutos.' },
});
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiados registros desde esta IP. Intenta en 15 minutos.' },
});

// Orígenes permitidos por CORS (leídos desde FRONTEND_URL en .env)
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Middlewares globales
app.use(cors({
  origin: (origin, callback) => {
    // Requests sin Origin (curl, Postman, server-to-server) se permiten;
    // los browsers SIEMPRE envian Origin en requests CORS, asi que esta
    if (!origin) return callback(null, true);
    if (origenesPermitidos.includes(origin)) return callback(null, true);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: false,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.disable('x-powered-by');

// Rate limit aplicado por endpoint (más granular que a toda la ruta /api/auth)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);

// Registro de endpoints
app.use('/api/auth', authRoutes);
app.use('/api/tipos-medicamento', tipoMedicRoutes);
app.use('/api/medicamentos', medicamentoRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'API REST Farmacia activa' });
});

const PORT = process.env.PORT || 4000;

const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };

sequelize.sync(syncOptions)
  .then(() => {
    console.log('Base de datos e índices sincronizados correctamente.');
    console.log(`CORS habilitado para: ${origenesPermitidos.join(', ') || '(ninguno)'}`);
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
  });
