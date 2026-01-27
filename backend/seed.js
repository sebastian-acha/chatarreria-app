const db = require('./config/db');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    console.log('🌱 Iniciando proceso de seed (semilla)...');

    // Datos del Administrador por defecto
    const adminData = {
        nombres: 'Administrador',
        apellido_paterno: 'General',
        email: 'admin@chatarreria.com',
        password: 'admin123', // Contraseña inicial (cámbiala después)
        rol: 'ADMIN'
    };

    try {
        // 1. Verificar si ya existe el admin para no duplicarlo
        const checkUser = await db.query('SELECT * FROM usuarios WHERE email = $1', [adminData.email]);
        
        if (checkUser.rows.length > 0) {
            console.log('⚠️ El usuario administrador ya existe. No se realizaron cambios.');
            process.exit(0);
        }

        // 2. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminData.password, salt);

        // 3. Insertar usuario
        // Nota: sucursal_id es NULL para el admin general
        const query = `
            INSERT INTO usuarios (nombres, apellido_paterno, email, password_hash, rol, activo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email;
        `;

        const values = [
            adminData.nombres,
            adminData.apellido_paterno,
            adminData.email,
            passwordHash,
            adminData.rol,
            true
        ];

        const res = await db.query(query, values);
        console.log(`✅ Usuario Administrador creado con éxito: ${res.rows[0].email}`);
        console.log(`🔑 Contraseña temporal: ${adminData.password}`);

    } catch (error) {
        console.error('❌ Error al crear el usuario administrador:', error);
        process.exit(1);
    } finally {
        // Cerramos la conexión para que el script termine
        await db.pool.end();
    }
};

seedAdmin();