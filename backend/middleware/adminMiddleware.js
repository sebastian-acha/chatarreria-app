module.exports = (req, res, next) => {
    if (req.user && req.user.rol === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
};
