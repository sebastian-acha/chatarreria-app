const db = require('../config/db');

exports.getConfi_guracion = async (req, res) => {
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
    let logo_url = req.body.logo_url;

    if (req.file) {
        // Aquí se manejaría la subida del logo a un servicio de almacenamiento
        // y se obtendría la URL. Por ahora, simulamos una URL.
        logo_url = `/uploads/${req.file.filename}`;
    }

    try {
        const result = await db.query(
            'UPDATE configuracion SET nombre_empresa = $1, direccion = $2, telefono = $3, email = $4, logo_url = $5 WHERE id = 1 RETURNING *',
            [nombre_empresa, direccion, telefono, email, logo_url]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar la configuración:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};