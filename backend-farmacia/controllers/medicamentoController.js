const { Medicamento, TipoMedic } = require('../models');

exports.obtenerMedicamentos = async (req, res) => {
  try {
    const medicamentos = await Medicamento.findAll({
      include: [{ model: TipoMedic, as: 'tipo' }]
    });
    res.json(medicamentos);
  } catch (error) {
    console.error('[obtenerMedicamentos]', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
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
    console.error('[crearMedicamento]', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.actualizarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    // Whitelist explicita: solo los campos del modelo son aceptados.
    // (CN-005 mass assignment)
    const { nombre, descripcion, precio, stock, tipoMedicId } = req.body;
    const camposPermitidos = { nombre, descripcion, precio, stock, tipoMedicId };
    Object.keys(camposPermitidos).forEach(
      (k) => camposPermitidos[k] === undefined && delete camposPermitidos[k]
    );
    const [actualizado] = await Medicamento.update(camposPermitidos, { where: { id } });
    if (!actualizado) {
      return res.status(404).json({ message: 'Medicamento no encontrado.' });
    }
    res.json({ message: 'Medicamento actualizado correctamente.' });
  } catch (error) {
    console.error('[actualizarMedicamento]', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
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
    console.error('[eliminarMedicamento]', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
