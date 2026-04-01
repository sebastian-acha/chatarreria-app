require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Importamos nuestra conexión
const authRoutes = require('./routes/authRoutes'); // Importamos rutas de auth
const metalRoutes = require('./routes/metalRoutes'); // Importamos rutas de metales
const familiaRoutes = require('./routes/familiaRoutes'); // Importamos rutas de familias
const sucursalRoutes = require('./routes/sucursalRoutes'); // Importar rutas de sucursales
const userRoutes = require('./routes/userRoutes'); // Importar rutas de usuarios
const transaccionRoutes = require('./routes/transaccionRoutes'); // Importamos rutas de transacciones
const configuracionRoutes = require('./routes/configuracionRoutes'); // Importamos rutas de configuración

// Verificación de seguridad: Validar que db.query existe
if (!db || typeof db.query !== 'function') {
    console.error("❌ ERROR FATAL: El módulo de base de datos no exportó la función 'query'. Revisa backend/config/db.js y asegúrate de usar module.exports");
}

const app = express();

// Configuración de CORS más segura para producción
app.use(cors({
  origin: ['https://cromat.cl', 'https://www.cromat.cl', 'https://chatarreria-app.vercel.app', 'http://localhost:5173', 'https://chatarreria-app-git-visuales-achaxs-projects.vercel.app' ] // Lista de orígenes permitidos
}));
app.use(express.json()); // Permite recibir datos en formato JSON (req.body)
app.use('/uploads', express.static('uploads')); // Servir archivos estáticos

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/metales', metalRoutes);
app.use('/api/familias', familiaRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/transacciones', transaccionRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Ruta de prueba para verificar la base de datos
app.get('/test-db', async (req, res) => {
    try {
        // Hacemos una consulta simple para ver la fecha del servidor SQL
        const resultado = await db.query('SELECT NOW()');
        res.json({
            mensaje: 'Conexión exitosa a PostgreSQL 🚀',
            fecha_servidor: resultado.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});

// Ruta base
app.get('/', (req, res) => {
    res.send('API de Chatarrería funcionando v1.0');
});

// Iniciar servidor
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
