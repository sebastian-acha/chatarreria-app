// /home/achax/chatarra-app/backend/tests/transacciones.test.js
const request = require('supertest');
const app = require('../index');
const db = require('../config/db');

jest.mock('../config/db');

// Mock de autenticación para simular un ejecutivo
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
    req.user = { id: 10, sucursal_id: 5, rol: 'EJECUTIVO' };
    next();
});

describe('API Transacciones (Crear Compra)', () => {
    let mockClient;

    beforeEach(() => {
        // Configuramos un cliente mock que simula ser la conexión de una transacción
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        db.connect.mockResolvedValue(mockClient);
        jest.clearAllMocks();
    });

    test('POST /api/transacciones debería registrar una compra exitosamente', async () => {
        const payload = {
            cliente_nombre: 'Juan Perez',
            cliente_rut_dni: '12345678-9',
            metales: [
                { metal_id: 1, peso_kilos: 10 } // 10kg de Metal ID 1
            ]
        };

        // Definimos la secuencia de respuestas que dará la base de datos simulada
        // El orden es CRÍTICO y debe coincidir con el orden de llamadas en transaccionController.js

        // 1. BEGIN
        mockClient.query.mockResolvedValueOnce({});

        // 2. SELECT logo_url FROM configuracion
        mockClient.query.mockResolvedValueOnce({ rows: [{ logo_url: 'http://logo.png' }] });

        // 3. SELECT ... FROM metales (Obtener precios)
        mockClient.query.mockResolvedValueOnce({
            rows: [{ id: 1, nombre: 'Cobre', valor_por_kilo: 1000 }]
        });

        // 4. INSERT INTO transacciones (Cabecera)
        mockClient.query.mockResolvedValueOnce({
            rows: [{ id: 100, fecha_hora: '2023-10-27T10:00:00Z' }]
        });

        // 5. INSERT INTO transaccion_detalles (Detalles)
        mockClient.query.mockResolvedValueOnce({});

        // 6. COMMIT
        mockClient.query.mockResolvedValueOnce({});

        const res = await request(app)
            .post('/api/transacciones')
            .send(payload);

        // Verificaciones
        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Compra registrada exitosamente');

        // Verificar cálculos del voucher
        const voucher = res.body.voucher;
        expect(voucher.correlativo).toBe(100);
        expect(voucher.total_pagado).toBe(10000); // 10kg * 1000 = 10000
        expect(voucher.ejecutivo_id).toBe(10); // Viene del mock de auth
        expect(voucher.sucursal_id).toBe(5);   // Viene del mock de auth

        // Verificar que se liberó la conexión
        expect(mockClient.release).toHaveBeenCalled();
    });

    test('POST /api/transacciones debería hacer ROLLBACK si falla algo', async () => {
        // Suprimimos temporalmente console.error para este test, ya que esperamos un error.
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const payload = {
            cliente_nombre: 'Error Man',
            metales: [{ metal_id: 1, peso_kilos: 5 }]
        };

        // 1. BEGIN
        mockClient.query.mockResolvedValueOnce({});

        // 2. SELECT logo
        mockClient.query.mockResolvedValueOnce({ rows: [] });

        // 3. SELECT metales -> Simulamos error aquí (ej: base de datos caída)
        mockClient.query.mockRejectedValueOnce(new Error('Error de conexión DB'));

        // 4. ROLLBACK (Debería llamarse en el catch)
        mockClient.query.mockResolvedValueOnce({});

        const res = await request(app)
            .post('/api/transacciones')
            .send(payload);

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toContain('Error del servidor');

        // Verificar que se llamó a ROLLBACK
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled();

        // Restauramos console.error para no afectar otros tests
        errorSpy.mockRestore();
    });
});
