const express = require('express');
const router = express.Router();
const tipoMedicController = require('../controllers/tipoMedicController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Lectura pública
router.get('/', tipoMedicController.obtenerTipos);

// Creación protegida con Token JWT
router.post('/', verificarToken, tipoMedicController.crearTipo);

module.exports = router;
