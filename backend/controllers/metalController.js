const db = require('../config/db');

// Listar todos los metales agrupados por familia
exports.listarMetales = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.id AS familia_id,
                f.nombre AS familia_nombre,
                json_agg(
                    json_build_object(
                        'id', m.id,
                        'nombre', m.nombre,
                        'valor_por_kilo', m.valor_por_kilo,
                        'updated_at', m.updated_at
                    ) ORDER BY m.nombre ASC
                ) AS metales
            FROM familias f
            LEFT JOIN metales m ON f.id = m.familia_id
            GROUP BY f.id, f.nombre
            ORDER BY f.nombre ASC;
        `;
        const result = await db.query(query);

        // También obtenemos los metales sin familia
        const metalesSinFamiliaQuery = `
            SELECT id, nombre, valor_por_kilo, updated_at 
            FROM metales 
            WHERE familia_id IS NULL 
            ORDER BY nombre ASC;
        `;
        const metalesSinFamiliaResult = await db.query(metalesSinFamiliaQuery);

        res.json({
            familias: result.rows,
            sinFamilia: metalesSinFamiliaResult.rows
        });
    } catch (error) {
        console.error('Error al listar metales:', error);
        res.status(500).json({ error: 'Error del servidor al obtener metales' });
    }
};


// Crear un nuevo metal
exports.crearMetal = async (req, res) => {
    const { nombre, valor_por_kilo, familia_id } = req.body;

    if (!nombre || valor_por_kilo === undefined) {
        return res.status(400).json({ error: 'Nombre y valor por kilo son obligatorios' });
    }

    try {
        const valorKiloFloat = Math.round(parseFloat(valor_por_kilo));
        const result = await db.query(
            'INSERT INTO metales (nombre, valor_por_kilo, familia_id) VALUES ($1, $2, $3) RETURNING *',
            [nombre, valorKiloFloat, familia_id || null]
        );
        res.status(201).json({
            mensaje: 'Metal creado exitosamente',
            metal: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear metal:', error);
        if (error.code === '23505') { // Código PostgreSQL para duplicados (unique constraint en (familia_id, nombre))
            return res.status(400).json({ error: 'Ya existe un metal con ese nombre dentro de la misma familia' });
        }
        res.status(500).json({ error: 'Error del servidor al crear metal' });
    }
};

// Actualizar un metal (Precio, nombre o familia)
exports.actualizarMetal = async (req, res) => {
    const { id } = req.params;
    const { nombre, valor_por_kilo, familia_id } = req.body;

    try {
        let query = 'UPDATE metales SET updated_at = CURRENT_TIMESTAMP';
        const values = [];
        let paramIndex = 1;

        if (nombre) {
            query += `, nombre = $${paramIndex++}`;
            values.push(nombre);
        }
        if (valor_por_kilo !== undefined) {
            const valorKiloFloat = Math.round(parseFloat(valor_por_kilo));
            query += `, valor_por_kilo = $${paramIndex++}`;
            values.push(valorKiloFloat);
        }
        if (familia_id !== undefined) {
            query += `, familia_id = $${paramIndex++}`;
            values.push(familia_id || null);
        }

        query += ` WHERE id = $${paramIndex} RETURNING *`;
        values.push(id);

        if (values.length === 1) { // No se enviaron datos para actualizar
            return res.status(400).json({ error: 'No se enviaron datos para actualizar' });
        }

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
         if (error.code === '23505') {
            return res.status(400).json({ error: 'Ya existe un metal con ese nombre dentro de la misma familia' });
        }
        res.status(500).json({ error: 'Error del servidor al actualizar metal' });
    }
};