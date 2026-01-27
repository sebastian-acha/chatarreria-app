const db = require('../config/db');

// Listar todas las sucursales
exports.listarSucursales = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sucursales ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar sucursales:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Crear nueva sucursal
exports.crearSucursal = async (req, res) => {
    const { nombre, direccion } = req.body;

    if (!nombre || !direccion) {
        return res.status(400).json({ error: 'Nombre y dirección son obligatorios' });
    }

    try {
        const result = await db.query(
            'INSERT INTO sucursales (nombre, direccion) VALUES ($1, $2) RETURNING *',
            [nombre, direccion]
        );
        res.status(201).json({ mensaje: 'Sucursal creada', sucursal: result.rows[0] });
    } catch (error) {
        console.error('Error al crear sucursal:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Actualizar sucursal
exports.actualizarSucursal = async (req, res) => {
    const { id } = req.params;
    const { nombre, direccion } = req.body;

    try {
        const result = await db.query(
            'UPDATE sucursales SET nombre = $1, direccion = $2 WHERE id = $3 RETURNING *',
            [nombre, direccion, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sucursal no encontrada' });
        }

        res.json({ mensaje: 'Sucursal actualizada', sucursal: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar sucursal:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};