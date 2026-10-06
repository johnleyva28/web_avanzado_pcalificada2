const { TipoMedic } = require('../models');

exports.obtenerTipos = async (req, res) => {
  try {
    const tipos = await TipoMedic.findAll();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tipos de medicamento.', error: error.message });
  }
};

exports.crearTipo = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const nuevoTipo = await TipoMedic.create({ nombre, descripcion });
    res.status(201).json(nuevoTipo);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear tipo de medicamento.', error: error.message });
  }
};
