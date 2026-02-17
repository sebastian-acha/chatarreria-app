const db = require('../config/db');

// Listar todos los metales (Para llenar el select en el frontend)
exports.listarMetales = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM metales ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar metales:', error);
        res.status(500).json({ error: 'Error del servidor al obtener metales' });
    }
};

// Crear un nuevo metal
exports.crearMetal = async (req, res) => {
    const { nombre } = req.body;
    let { valor_por_kilo } = req.body;

    if (!nombre || valor_por_kilo === undefined) {
        return res.status(400).json({ error: 'Nombre y valor por kilo son obligatorios' });
    }

    try {
        valor_por_kilo = Math.round(parseFloat(valor_por_kilo));
        const result = await db.query(
            'INSERT INTO metales (nombre, valor_por_kilo) VALUES ($1, $2) RETURNING *',
            [nombre, valor_por_kilo]
        );
        res.status(201).json({
            mensaje: 'Metal creado exitosamente',
            metal: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear metal:', error);
        if (error.code === '23505') { // Código PostgreSQL para duplicados
            return res.status(400).json({ error: 'Ya existe un metal con ese nombre' });
        }
        res.status(500).json({ error: 'Error del servidor al crear metal' });
    }
};

// Actualizar un metal (Principalmente para cambiar el precio)
exports.actualizarMetal = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    let { valor_por_kilo } = req.body;

    try {
        // Construcción dinámica de la consulta según qué datos lleguen
        let query = 'UPDATE metales SET updated_at = CURRENT_TIMESTAMP';
        const values = [];
        let paramIndex = 1;

        if (nombre) {
            query += `, nombre = $${paramIndex++}`;
            values.push(nombre);
        }
        if (valor_por_kilo !== undefined) {
            valor_por_kilo = Math.round(parseFloat(valor_por_kilo));
            query += `, valor_por_kilo = $${paramIndex++}`;
            values.push(valor_por_kilo);
        }

        query += ` WHERE id = $${paramIndex} RETURNING *`;
        values.push(id);

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Metal no encontrado' });
        }

        res.json({
            mensaje: 'Metal actualizado exitosamente',
            metal: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar metal:', error);
        res.status(500).json({ error: 'Error del servidor al actualizar metal' });
    }
};