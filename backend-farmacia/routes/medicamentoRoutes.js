const express = require('express');
const router = express.Router();
const medicamentoController = require('../controllers/medicamentoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Lectura pública
router.get('/', medicamentoController.obtenerMedicamentos);

// Creación protegida con Token JWT
router.post('/', verificarToken, medicamentoController.crearMedicamento);

// Actualización protegida
router.put('/:id', verificarToken, medicamentoController.actualizarMedicamento);

// Eliminación protegida
router.delete('/:id', verificarToken, medicamentoController.eliminarMedicamento);

module.exports = router;
