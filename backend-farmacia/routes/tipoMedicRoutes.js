const express = require('express');
const router = express.Router();
const tipoMedicController = require('../controllers/tipoMedicController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarRol } = require('../middlewares/roleMiddleware');

// Lectura pública
router.get('/', tipoMedicController.obtenerTipos);
router.get('/:id', tipoMedicController.obtenerTipo);

// Escritura solo para admin
router.post('/', verificarToken, verificarRol('admin'), tipoMedicController.crearTipo);
router.put('/:id', verificarToken, verificarRol('admin'), tipoMedicController.actualizarTipo);
router.delete('/:id', verificarToken, verificarRol('admin'), tipoMedicController.eliminarTipo);

module.exports = router;
