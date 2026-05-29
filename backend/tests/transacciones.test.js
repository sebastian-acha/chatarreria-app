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

    test('POST /api/transacciones debería registrar una compra tipo Romana correctamente', async () => {
        const payload = {
            cliente_nombre: 'Romano',
            cliente_rut_dni: '11111111-1',
            metales: [ { metal_id: 2, peso_kilos: 0.5 } ],
            tipo_compra: 'romana',
            peso_entrada: 2.5,
            peso_salida: 2.0
        };

        // 1. BEGIN
        mockClient.query.mockResolvedValueOnce({});

        // 2. SELECT logo_url
        mockClient.query.mockResolvedValueOnce({ rows: [{ logo_url: null }] });

        // 3. SELECT metales
        mockClient.query.mockResolvedValueOnce({ rows: [{ id: 2, nombre: 'Plata', valor_por_kilo: 2000 }] });

        // 4. INSERT transacciones
        mockClient.query.mockResolvedValueOnce({ rows: [{ id: 200, fecha_hora: '2024-01-01T12:00:00Z', tipo_compra: 'romana', peso_entrada: 2.5, peso_salida: 2.0 }] });

        // 5. INSERT detalles
        mockClient.query.mockResolvedValueOnce({});

        // 6. COMMIT
        mockClient.query.mockResolvedValueOnce({});

        const res = await request(app)
            .post('/api/transacciones')
            .send(payload);

        expect(res.statusCode).toBe(201);
        expect(res.body.voucher.tipo_compra).toBe('romana');
        expect(res.body.voucher.peso_entrada).toBe(2.5);
        expect(res.body.voucher.peso_salida).toBe(2.0);
        expect(res.body.voucher.correlativo).toBe(200);
    });

    test('POST /api/transacciones debería rechazar Romana si el peso no coincide con entrada - salida', async () => {
        const payload = {
            cliente_nombre: 'Romano Mal',
            cliente_rut_dni: '22222222-2',
            metales: [ { metal_id: 2, peso_kilos: 0.6 } ],
            tipo_compra: 'romana',
            peso_entrada: 2.5,
            peso_salida: 2.0
        };

        const res = await request(app).post('/api/transacciones').send(payload);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/no coincide con la diferencia/i);
    });

    test('POST /api/transacciones debería rechazar Romana con más de un metal', async () => {
        const payload = {
            cliente_nombre: 'Bad Romano',
            metales: [ { metal_id: 1, peso_kilos: 1 }, { metal_id: 2, peso_kilos: 1 } ],
            tipo_compra: 'romana',
            peso_entrada: 2,
            peso_salida: 1.8
        };

        const res = await request(app).post('/api/transacciones').send(payload);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/exactamente un metal/i);
    });

    test('POST /api/transacciones debería rechazar Romana sin pesos válidos', async () => {
        const payload = {
            cliente_nombre: 'No Pesos',
            metales: [ { metal_id: 1, peso_kilos: 1 } ],
            tipo_compra: 'romana'
            // faltan peso_entrada/peso_salida
        };

        const res = await request(app).post('/api/transacciones').send(payload);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/peso_entrada y peso_salida válidos/i);
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
