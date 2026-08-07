const express = require('express');
const router = express.Router();
const precioWebController = require('../controllers/precioWebController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// GET /api/preciosweb - Listar precios públicos (para web / plugin WP)
router.get('/', precioWebController.listarPreciosWeb);

// GET /api/preciosweb/admin - Listar todos los registros con id (solo admin)
router.get('/admin', [authMiddleware, adminMiddleware], precioWebController.listarAdmin);

// Rutas protegidas solo para ADMIN
router.post('/', [authMiddleware, adminMiddleware], precioWebController.crearPrecioWeb);
router.put('/:id', [authMiddleware, adminMiddleware], precioWebController.actualizarPrecioWeb);
router.delete('/:id', [authMiddleware, adminMiddleware], precioWebController.eliminarPrecioWeb);

module.exports = router;
