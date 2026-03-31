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

    // Si el usuario subió una imagen, la procesamos desde el buffer
    if (req.file) {
        const base64Image = req.file.buffer.toString('base64');
        // Creamos un Data URI que el navegador pueda interpretar directamente como imagen
        logo_url = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    try {
        let query;
        let params;

        if (logo_url) {
            // Guardamos la cadena de texto larga en la columna logo_url
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

// Obtiene los estilos personalizados
exports.getEstilos = async (req, res) => {
    try {
        const result = await db.query('SELECT custom_css FROM configuracion WHERE id = 1');
        if (result.rows.length > 0) {
            res.json({ custom_css: result.rows[0].custom_css || '' });
        } else {
            res.json({ custom_css: '' });
        }
    } catch (error) {
        console.error('Error al obtener los estilos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualiza los estilos personalizados
exports.updateEstilos = async (req, res) => {
    const { custom_css } = req.body;

    try {
        // Primero, asegurar que la fila de configuración exista (UPSERT)
        await db.query(
            'INSERT INTO configuracion (id, nombre_empresa) VALUES (1, \'Mi Chatarrería\') ON CONFLICT (id) DO NOTHING;'
        );

        // Luego, actualizar la columna custom_css
        const query = 'UPDATE configuracion SET custom_css = $1 WHERE id = 1 RETURNING custom_css';
        const params = [custom_css];
        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar los estilos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};