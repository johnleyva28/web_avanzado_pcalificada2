const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoMedic = sequelize.define('TipoMedic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'tipos_medicamento',
  timestamps: true
});

module.exports = TipoMedic;
