const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Crear un nuevo usuario (Ejecutivo o Admin)
exports.crearUsuario = async (req, res) => {
    const { nombres, apellido_paterno, email, password, rol, sucursal_id } = req.body;

    if (!nombres || !apellido_paterno || !email || !password || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto sucursal.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO usuarios (nombres, apellido_paterno, email, password_hash, rol, sucursal_id, activo)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            RETURNING id, email, rol;
        `;
        
        const values = [nombres, apellido_paterno, email, password_hash, rol, rol === 'EJECUTIVO' ? sucursal_id : null];
        const result = await db.query(query, values);

        res.status(201).json({
            mensaje: 'Usuario creado con éxito',
            usuario: result.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') { // Email duplicado
            return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
        }
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Listar todos los usuarios
exports.listarUsuarios = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id, u.nombres, u.apellido_paterno, u.email, u.rol, u.activo, s.nombre as sucursal_nombre 
            FROM usuarios u
            LEFT JOIN sucursales s ON u.sucursal_id = s.id
            ORDER BY u.id ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
