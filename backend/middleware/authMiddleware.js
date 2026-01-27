const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Obtener el token del header (Authorization: Bearer <token>)
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        // 2. Limpiar el token (quitar el prefijo 'Bearer ' si existe)
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7, authHeader.length) 
            : authHeader;

        // 3. Verificar el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Adjuntar el usuario decodificado al request para usarlo en los controladores
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};