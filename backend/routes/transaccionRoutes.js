const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/transacciones - Registrar compra (Protegido)
router.post('/', authMiddleware, transaccionController.crearTransaccion);

// GET /api/transacciones - Listar historial con filtros y paginación (Protegido)
router.get('/', authMiddleware, transaccionController.listarTransacciones);

// GET /api/transacciones/reporte-diario - Reporte del día (Protegido)
router.get('/reporte-diario', authMiddleware, transaccionController.obtenerReporteDiario);

// GET /api/transacciones/reporte-diario/excel - Exportar Excel (Protegido)
router.get('/reporte-diario/excel', authMiddleware, transaccionController.exportarReporteDiarioExcel);

// GET /api/transacciones/:id - Obtener detalles por ID (Protegido)
router.get('/:id', authMiddleware, transaccionController.obtenerTransaccion);

module.exports = router;