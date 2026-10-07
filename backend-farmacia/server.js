const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

// Rutas
const authRoutes = require('./routes/authRoutes');
const tipoMedicRoutes = require('./routes/tipoMedicRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');

const app = express();

// Detrás de Render el servicio corre tras un proxy; necesario para
// que req.ip refleje la IP del cliente (no del load balancer) y
// para que cualquier rate limiter futuro funcione. (CN-024)
app.set('trust proxy', 1);

// Orígenes permitidos por CORS (leídos desde FRONTEND_URL en .env)
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Middlewares globales
app.use(cors({
  origin: (origin, callback) => {
    // Solo se permiten orígenes explícitamente en la whitelist. Las
    // herramientas sin origin (curl, server-to-server) también pasan
    // por la whitelist via '' === '' si el operador lo incluye;
    // por defecto, sin Origin no se permite. (CN-016)
    if (origenesPermitidos.includes(origin || '')) return callback(null, true);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: false, // El API usa Bearer auth, no cookies. (CN-016)
}));
app.use(express.json({ limit: '100kb' })); // (CN-023) cap defensivo
app.disable('x-powered-by'); // (CN-013) no leak del framework

// Registro de endpoints
app.use('/api/auth', authRoutes);
app.use('/api/tipos-medicamento', tipoMedicRoutes);
app.use('/api/medicamentos', medicamentoRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'API REST Farmacia activa' });
});

const PORT = process.env.PORT || 4000;

// En producción se recomienda usar migraciones explícitas (umzug/
// sequelize-cli) y NO auto-alter. (CN-022)
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
  