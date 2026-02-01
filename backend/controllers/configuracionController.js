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