const express = require('express');
const router = express.Router();
const medicamentoController = require('../controllers/medicamentoController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarRol } = require('../middlewares/roleMiddleware');

// Lectura pública
router.get('/', medicamentoController.obtenerMedicamentos);

// Creación y edición: admin o moderador
router.post('/', verificarToken, verificarRol('admin', 'moderador'), medicamentoController.crearMedicamento);
router.put('/:id', verificarToken, verificarRol('admin', 'moderador'), medicamentoController.actualizarMedicamento);

// Eliminación: solo admin
router.delete('/:id', verificarToken, verificarRol('admin'), medicamentoController.eliminarMedicamento);

module.exports = router;
