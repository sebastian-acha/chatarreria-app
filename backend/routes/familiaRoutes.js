const express = require('express');
const router = express.Router();
const { getFamilias, createFamilia, updateFamilia, deleteFamilia } = require('../controllers/familiaController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Las operaciones de familias son solo para administradores
router.get('/', authMiddleware, getFamilias);
router.post('/', authMiddleware, adminMiddleware, createFamilia);
router.put('/:id', authMiddleware, adminMiddleware, updateFamilia);
router.delete('/:id', authMiddleware, adminMiddleware, deleteFamilia);

module.exports = router;
