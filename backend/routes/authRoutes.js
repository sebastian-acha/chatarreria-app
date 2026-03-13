const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Definir endpoint POST /login
router.post('/login', authController.login);

// Definir endpoint GET /verify para validar token
router.get('/verify', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Token válido' });
});

module.exports = router;