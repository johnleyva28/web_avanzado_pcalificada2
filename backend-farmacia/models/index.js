const sequelize = require('../config/database');
const User = require('./User');
const TipoMedic = require('./TipoMedic');
const Medicamento = require('./Medicamento');

// Relación: Un tipo de medicamento tiene muchos medicamentos
TipoMedic.hasMany(Medicamento, { foreignKey: 'tipoMedicId', as: 'medicamentos' });
Medicamento.belongsTo(TipoMedic, { foreignKey: 'tipoMedicId', as: 'tipo' });

module.exports = {
  sequelize,
  User,
  TipoMedic,
  Medicamento
};
