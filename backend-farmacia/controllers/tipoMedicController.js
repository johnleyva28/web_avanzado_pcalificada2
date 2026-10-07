const { TipoMedic } = require('../models');

exports.obtenerTipos = async (req, res) => {
  try {
    const tipos = await TipoMedic.findAll();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tipos de medicamento.', error: error.message });
  }
};

exports.obtenerTipo = async (req, res) => {
  try {
    const tipo = await TipoMedic.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de medicamento no encontrado.' });
    }
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el tipo de medicamento.', error: error.message });
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

exports.actualizarTipo = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const tipo = await TipoMedic.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de medicamento no encontrado.' });
    }
    await tipo.update({ nombre, descripcion });
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar tipo de medicamento.', error: error.message });
  }
};

exports.eliminarTipo = async (req, res) => {
  try {
    const tipo = await TipoMedic.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de medicamento no encontrado.' });
    }
    await tipo.destroy();
    res.json({ message: 'Tipo de medicamento eliminado correctamente.' });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        message: 'No se puede eliminar: hay medicamentos asociados a este tipo.',
      });
    }
    res.status(500).json({ message: 'Error al eliminar tipo de medicamento.', error: error.message });
  }
};
