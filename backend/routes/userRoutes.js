const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Proteger todas las rutas de usuarios para que solo los admins puedan acceder
router.use(authMiddleware, adminMiddleware);

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', userController.crearUsuario);

// GET /api/usuarios - Listar todos los usuarios
router.get('/', userController.listarUsuarios);

module.exports = router;
