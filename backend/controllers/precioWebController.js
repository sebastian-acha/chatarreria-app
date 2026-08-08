const db = require('../config/db');

exports.listarPreciosWeb = async (req, res) => {
    try {
        const query = `
            SELECT familia, material, precio
            FROM preciosweb
            ORDER BY familia ASC, material ASC;
        `;
        const result = await db.query(query);

        const preciosPorFamilia = {};
        result.rows.forEach(row => {
            if (!preciosPorFamilia[row.familia]) {
                preciosPorFamilia[row.familia] = [];
            }
            preciosPorFamilia[row.familia].push({
                nombre: row.material,
                precio: parseFloat(row.precio)
            });
        });

        res.json(preciosPorFamilia);
    } catch (error) {
        console.error('Error al listar precios web:', error);
        res.status(500).json({ error: 'Error del servidor al obtener precios web' });
    }
};

exports.listarAdmin = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM preciosweb ORDER BY familia ASC, material ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar precios web (admin):', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.crearPrecioWeb = async (req, res) => {
    const { familia, material, precio } = req.body;

    if (!familia || !material || precio === undefined || precio === '') {
        return res.status(400).json({ error: 'Familia, material y precio son obligatorios' });
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
        return res.status(400).json({ error: 'El precio debe ser un número mayor que 0' });
    }

    try {
        const result = await db.query(
            'INSERT INTO preciosweb (familia, material, precio) VALUES ($1, $2, $3) RETURNING *',
            [familia.trim(), material.trim(), precioNum]
        );
        res.status(201).json({
            mensaje: 'Precio web creado exitosamente',
            precioWeb: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear precio web:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Ya existe un material con ese nombre en la misma familia' });
        }
        res.status(500).json({ error: 'Error del servidor al crear precio web' });
    }
};

exports.actualizarPrecioWeb = async (req, res) => {
    const { id } = req.params;
    const { familia, material, precio } = req.body;

    if (!familia || !material || precio === undefined || precio === '') {
        return res.status(400).json({ error: 'Familia, material y precio son obligatorios' });
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
        return res.status(400).json({ error: 'El precio debe ser un número mayor que 0' });
    }

    try {
        const result = await db.query(
            'UPDATE preciosweb SET familia = $1, material = $2, precio = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [familia.trim(), material.trim(), precioNum, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Precio web no encontrado' });
        }

        res.json({
            mensaje: 'Precio web actualizado exitosamente',
            precioWeb: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar precio web:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Ya existe un material con ese nombre en la misma familia' });
        }
        res.status(500).json({ error: 'Error del servidor al actualizar precio web' });
    }
};

exports.eliminarFamilia = async (req, res) => {
    const { familia } = req.params;

    try {
        const result = await db.query('DELETE FROM preciosweb WHERE familia = $1 RETURNING *', [familia]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Familia no encontrada' });
        }

        res.json({ mensaje: `Familia "${familia}" eliminada exitosamente`, eliminados: result.rows.length });
    } catch (error) {
        console.error('Error al eliminar familia:', error);
        res.status(500).json({ error: 'Error del servidor al eliminar familia' });
    }
};

exports.eliminarPrecioWeb = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM preciosweb WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Precio web no encontrado' });
        }

        res.json({ mensaje: 'Precio web eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar precio web:', error);
        res.status(500).json({ error: 'Error del servidor al eliminar precio web' });
    }
};
