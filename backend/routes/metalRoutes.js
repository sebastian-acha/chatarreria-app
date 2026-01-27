const express = require('express');
const router = express.Router();
const metalController = require('../controllers/metalController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/metales - Listar (Público o para cualquier usuario autenticado)
router.get('/', metalController.listarMetales);

// POST /api/metales - Crear (Protegido: Requiere Token)
router.post('/', authMiddleware, metalController.crearMetal);

// PUT /api/metales/:id - Actualizar (Protegido: Requiere Token)
router.put('/:id', authMiddleware, metalController.actualizarMetal);

module.exports = router;