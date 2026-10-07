// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Habilitar verificación de certificado TLS. Para entornos con CA
// privada (Render Postgres), se debe pasar NODE_EXTRA_CA_CERTS o
// configurar `dialectOptions.ssl.ca` con el bundle del proveedor.
// (CN-011)
const sslOptions = {
  require: true,
  rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false',
};
if (process.env.DB_CA_CERT) {
  sslOptions.ca = process.env.DB_CA_CERT;
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: sslOptions }
});

module.exports = sequelize;
