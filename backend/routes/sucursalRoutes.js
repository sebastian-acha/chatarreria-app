const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursalController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// GET /api/sucursales - Listar (Cualquier usuario autenticado)
router.get('/', authMiddleware, sucursalController.listarSucursales);

// Rutas protegidas solo para ADMIN
router.post('/', [authMiddleware, adminMiddleware], sucursalController.crearSucursal);
router.put('/:id', [authMiddleware, adminMiddleware], sucursalController.actualizarSucursal);

module.exports = router;