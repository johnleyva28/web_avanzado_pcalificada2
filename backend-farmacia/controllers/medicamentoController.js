const { Medicamento, TipoMedic } = require('../models');

exports.obtenerMedicamentos = async (req, res) => {
  try {
    const medicamentos = await Medicamento.findAll({
      include: [{ model: TipoMedic, as: 'tipo' }]
    });
    res.json(medicamentos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener medicamentos.', error: error.message });
  }
};

exports.crearMedicamento = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, tipoMedicId } = req.body;
    const nuevoMedicamento = await Medicamento.create({
      nombre,
      descripcion,
      precio,
      stock,
      tipoMedicId
    });
    res.status(201).json(nuevoMedicamento);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear medicamento.', error: error.message });
  }
};

exports.actualizarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const [actualizado] = await Medicamento.update(req.body, { where: { id } });
    if (!actualizado) {
      return res.status(404).json({ message: 'Medicamento no encontrado.' });
    }
    res.json({ message: 'Medicamento actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar medicamento.', error: error.message });
  }
};

exports.eliminarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Medicamento.destroy({ where: { id } });
    if (!eliminado) {
      return res.status(404).json({ message: 'Medicamento no encontrado.' });
    }
    res.json({ message: 'Medicamento eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar medicamento.', error: error.message });
  }
};
