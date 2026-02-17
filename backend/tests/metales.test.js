// /home/achax/chatarra-app/backend/tests/metales.test.js
const request = require('supertest');
const app = require('../index');
const db = require('../config/db');

// Mock de la base de datos y del middleware de autenticación
jest.mock('../config/db', () => ({
    query: jest.fn(),
    connect: jest.fn() // Necesario si algún controller usa connect
}));

// Mock para saltarnos la autenticación y simular un usuario admin
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
    req.user = { id: 1, sucursal_id: 1, rol: 'ADMIN' };
    next();
});

describe('API Metales', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/metales debería retornar la lista de metales', async () => {
        const mockMetales = [
            { id: 1, nombre: 'Cobre', valor_por_kilo: 8000 },
            { id: 2, nombre: 'Aluminio', valor_por_kilo: 1500 }
        ];

        // Simulamos que la BD responde con estos datos
        db.query.mockResolvedValue({ rows: mockMetales });

        const res = await request(app).get('/api/metales');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].nombre).toBe('Cobre');
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM metales'));
    });

    test('POST /api/metales debería crear un nuevo metal', async () => {
        const nuevoMetal = { nombre: 'Bronce', valor_por_kilo: 4500 };
        const metalCreado = { id: 3, ...nuevoMetal, created_at: new Date() };

        // Simulamos la respuesta del INSERT ... RETURNING *
        db.query.mockResolvedValue({ rows: [metalCreado] });

        const res = await request(app)
            .post('/api/metales')
            .send(nuevoMetal);

        expect(res.statusCode).toBe(201);
        expect(res.body.metal.nombre).toBe('Bronce');
        expect(res.body.metal.valor_por_kilo).toBe(4500);
    });

    test('POST /api/metales debería fallar si faltan datos', async () => {
        const res = await request(app)
            .post('/api/metales')
            .send({ nombre: 'Solo Nombre' }); // Falta valor_por_kilo

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});
