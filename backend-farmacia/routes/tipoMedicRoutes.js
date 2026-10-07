const express = require('express');
const router = express.Router();
const tipoMedicController = require('../controllers/tipoMedicController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarRol } = require('../middlewares/roleMiddleware');

// Lectura pública
router.get('/', tipoMedicController.obtenerTipos);
router.get('/:id', tipoMedicController.obtenerTipo);

// Creación y edición: admin o moderador
router.post('/', verificarToken, verificarRol('admin', 'moderador'), tipoMedicController.crearTipo);
router.put('/:id', verificarToken, verificarRol('admin', 'moderador'), tipoMedicController.actualizarTipo);

// Eliminación: solo admin
router.delete('/:id', verificarToken, verificarRol('admin'), tipoMedicController.eliminarTipo);

module.exports = router;
