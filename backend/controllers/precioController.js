const pool = require('../config/db');

const getPrecios = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.nombre AS familia_nombre,
                json_agg(
                    json_build_object(
                        'nombre', m.nombre,
                        'precio', m.valor_por_kilo
                    ) ORDER BY m.nombre ASC
                ) AS metales
            FROM familias f
            JOIN metales m ON f.id = m.familia_id
            WHERE m.familia_id IS NOT NULL
            GROUP BY f.id, f.nombre
            ORDER BY f.nombre ASC;
        `;
        const result = await pool.query(query);

        const preciosPorFamilia = result.rows.reduce((acc, familia) => {
            acc[familia.familia_nombre] = familia.metales;
            return acc;
        }, {});

        res.json(preciosPorFamilia);
    } catch (error) {
        console.error('Error al obtener precios:', error);
        res.status(500).json({ error: 'Error del servidor al obtener precios' });
    }
};

module.exports = {
    getPrecios,
};
