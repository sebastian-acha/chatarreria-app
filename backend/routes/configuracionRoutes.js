const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');

// Configuración de Multer para subida de logos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', authMiddleware, configuracionController.getConfiguracion);
router.put('/', [authMiddleware, adminMiddleware, upload.single('logo')], configuracionController.updateConfiguracion);

module.exports = router;