const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');

// Configuración de Multer para subida de logos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', configuracionController.getConfiguracion);
router.put('/', [authMiddleware, adminMiddleware, upload.single('logo')], configuracionController.updateConfiguracion);

// Rutas para estilos personalizados
router.get('/estilos', configuracionController.getEstilos);
router.put('/estilos', [authMiddleware, adminMiddleware], configuracionController.updateEstilos);

module.exports = router;