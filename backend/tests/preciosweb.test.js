const request = require('supertest');
const app = require('../index');
const db = require('../config/db');

jest.mock('../config/db', () => ({
    query: jest.fn(),
    connect: jest.fn()
}));

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
    req.user = { id: 1, sucursal_id: 1, rol: 'ADMIN' };
    next();
});

describe('API Precios Web', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/preciosweb debería retornar los precios agrupados por familia', async () => {
        const mockRows = [
            { familia: 'Aluminios', material: 'Aluminio Fino', precio: '1200.00' },
            { familia: 'Aluminios', material: 'Aluminio Grueso', precio: '800.00' },
            { familia: 'Cobres', material: 'Cobre Limpio', precio: '8000.00' }
        ];

        db.query.mockResolvedValue({ rows: mockRows });

        const res = await request(app).get('/api/preciosweb');

        expect(res.statusCode).toBe(200);
        expect(res.body['Aluminios']).toHaveLength(2);
        expect(res.body['Cobres'][0]).toEqual({ nombre: 'Cobre Limpio', precio: 8000 });
    });

    test('GET /api/preciosweb/admin debería retornar los registros con id', async () => {
        const mockRows = [
            { id: 1, familia: 'Aluminios', material: 'Aluminio Fino', precio: '1200.00' }
        ];

        db.query.mockResolvedValue({ rows: mockRows });

        const res = await request(app).get('/api/preciosweb/admin');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(1);
    });

    test('POST /api/preciosweb debería crear un nuevo precio', async () => {
        const creado = { id: 1, familia: 'Aluminios', material: 'Aluminio Fino', precio: '1200.00' };
        db.query.mockResolvedValue({ rows: [creado] });

        const res = await request(app)
            .post('/api/preciosweb')
            .send({ familia: 'Aluminios', material: 'Aluminio Fino', precio: 1200 });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Precio web creado exitosamente');
        expect(res.body.precioWeb.id).toBe(1);
    });

    test('POST /api/preciosweb debería fallar si faltan datos', async () => {
        const res = await request(app)
            .post('/api/preciosweb')
            .send({ familia: 'Aluminios' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('obligatorios');
    });

    test('POST /api/preciosweb debería rechazar duplicados', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        db.query.mockRejectedValue({ code: '23505' });

        const res = await request(app)
            .post('/api/preciosweb')
            .send({ familia: 'Aluminios', material: 'Aluminio Fino', precio: 1200 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('Ya existe');
        errorSpy.mockRestore();
    });

    test('PUT /api/preciosweb/:id debería actualizar un precio', async () => {
        const actualizado = { id: 1, familia: 'Aluminios', material: 'Aluminio Fino', precio: '1500.00' };
        db.query.mockResolvedValue({ rows: [actualizado] });

        const res = await request(app)
            .put('/api/preciosweb/1')
            .send({ familia: 'Aluminios', material: 'Aluminio Fino', precio: 1500 });

        expect(res.statusCode).toBe(200);
        expect(res.body.precioWeb.precio).toBe('1500.00');
    });

    test('PUT /api/preciosweb/:id debería responder 404 si no existe', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        db.query.mockResolvedValue({ rows: [] });

        const res = await request(app)
            .put('/api/preciosweb/999')
            .send({ familia: 'X', material: 'Y', precio: 100 });

        expect(res.statusCode).toBe(404);
        errorSpy.mockRestore();
    });

    test('DELETE /api/preciosweb/:id debería eliminar un precio', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1 }] });

        const res = await request(app).delete('/api/preciosweb/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Precio web eliminado exitosamente');
    });

    test('DELETE /api/preciosweb/:id debería responder 404 si no existe', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        db.query.mockResolvedValue({ rows: [] });

        const res = await request(app).delete('/api/preciosweb/999');

        expect(res.statusCode).toBe(404);
        errorSpy.mockRestore();
    });
});
