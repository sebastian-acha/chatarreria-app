const db = require('../config/db');

exports.getConfiguracion = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM configuracion WHERE id = 1');
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la configuración:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.updateConfiguracion = async (req, res) => {
    const { nombre_empresa, direccion, telefono, email } = req.body;
    let logo_url = null;

    if (req.file) {
        logo_url = `/uploads/${req.file.filename}`;
    }

    try {
        let query;
        let params;

        if (logo_url) {
            query = 'UPDATE configuracion SET nombre_empresa = $1, direccion = $2, telefono = $3, email = $4, logo_url = $5 WHERE id = 1 RETURNING *';
            params = [nombre_empresa, direccion, telefono, email, logo_url];
        } else {
            query = 'UPDATE configuracion SET nombre_empresa = $1, direccion = $2, telefono = $3, email = $4 WHERE id = 1 RETURNING *';
            params = [nombre_empresa, direccion, telefono, email];
        }

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar la configuración:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};