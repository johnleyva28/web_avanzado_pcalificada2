const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

// Rutas
const authRoutes = require('./routes/authRoutes');
const tipoMedicRoutes = require('./routes/tipoMedicRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');

const app = express();

// Orígenes permitidos por CORS (leídos desde FRONTEND_URL en .env)
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Middlewares globales
app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin "origin" (curl, server-to-server, Postman)
    if (!origin) return callback(null, true);
    if (origenesPermitidos.includes(origin)) return callback(null, true);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Registro de endpoints
app.use('/api/auth', authRoutes);
app.use('/api/tipos-medicamento', tipoMedicRoutes);
app.use('/api/medicamentos', medicamentoRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'API REST Farmacia activa' });
});

const PORT = process.env.PORT || 4000;

sequelize.sync({ alter: true })
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
  