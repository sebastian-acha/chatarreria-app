const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', authMiddleware, configuracionController.getConfiguracion);
router.put('/', authMiddleware, adminMiddleware, configuracionController.updateConfiguracion);

module.exports = router;