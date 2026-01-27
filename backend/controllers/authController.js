const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
        return res.status(400).json({ error: 'Por favor ingrese email y contraseña' });
    }

    try {
        // 1. Buscar usuario por email
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = result.rows[0];

        // 2. Verificar si el usuario está activo
        if (!usuario.activo) {
            return res.status(403).json({ error: 'Usuario inactivo. Contacte al administrador.' });
        }

        // 3. Comparar la contraseña ingresada con el hash guardado
        const isMatch = await bcrypt.compare(password, usuario.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 4. Generar Token JWT
        // Guardamos datos útiles en el token para no tener que consultar la BD a cada rato
        const payload = {
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
            sucursal_id: usuario.sucursal_id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        // 5. Responder con el token y datos del usuario (sin el password)
        res.json({
            mensaje: 'Autenticación exitosa',
            token,
            usuario: {
                id: usuario.id,
                nombres: usuario.nombres,
                apellido_paterno: usuario.apellido_paterno,
                email: usuario.email,
                rol: usuario.rol,
                sucursal_id: usuario.sucursal_id
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error del servidor al iniciar sesión' });
    }
};