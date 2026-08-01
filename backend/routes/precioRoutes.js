const express = require('express');
const router = express.Router();
const { getPrecios } = require('../controllers/precioController');

router.get('/', getPrecios);

module.exports = router;
