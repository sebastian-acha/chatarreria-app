const { Pool } = require('pg');
const path = require('path');

// Cargar .env especificando la ruta absoluta (un nivel arriba de /config)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Verificación de seguridad para depurar el error
if (process.env.DB_PASSWORD === undefined) {
    console.error("❌ ERROR CRÍTICO: DB_PASSWORD no se ha cargado. Verifica que el archivo .env exista en la carpeta backend y tenga la variable definida.");
}

// Configuración del Pool de conexiones
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    // Opcional: configuraciones de timeout y límites
    max: 20, // Máximo de conexiones simultáneas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Evento para monitorear cuando se conecta un cliente nuevo (opcional, para debug)
pool.on('connect', () => {
    console.log('Base de datos conectada exitosamente');
});

pool.on('error', (err) => {
    console.error('Error inesperado en el cliente inactivo', err);
    process.exit(-1);
});

// Asegúrate de que esto diga 'module.exports' (con 's' al final)
module.exports = {
    // Exportamos una función query que envuelve al pool
    // Esto nos permite ejecutar consultas desde cualquier parte de la app:
    // await db.query('SELECT * FROM usuarios WHERE id = $1', [id])
    query: (text, params) => pool.query(text, params),
    pool, // Exportamos el pool por si necesitamos transacciones complejas
};
