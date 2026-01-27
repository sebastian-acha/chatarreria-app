const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definir endpoint POST /login
router.post('/login', authController.login);

module.exports = router;