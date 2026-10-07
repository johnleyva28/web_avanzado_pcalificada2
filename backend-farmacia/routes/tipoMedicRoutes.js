const express = require('express');
const router = express.Router();
const tipoMedicController = require('../controllers/tipoMedicController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarRol } = require('../middlewares/roleMiddleware');

// Lectura pública
router.get('/', tipoMedicController.obtenerTipos);

// Creación solo para admin
router.post('/', verificarToken, verificarRol('admin'), tipoMedicController.crearTipo);

module.exports = router;
