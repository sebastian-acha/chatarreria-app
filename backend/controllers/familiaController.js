const pool = require('../config/db');

const getFamilias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM familias ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const createFamilia = async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ message: 'El nombre de la familia es requerido' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO familias (nombre) VALUES ($1) RETURNING *',
            [nombre]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ message: 'La familia ya existe' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const updateFamilia = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ message: 'El nombre de la familia es requerido' });
    }
    try {
        const result = await pool.query(
            'UPDATE familias SET nombre = $1 WHERE id = $2 RETURNING *',
            [nombre, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Familia no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ message: 'La familia ya existe' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const deleteFamilia = async (req, res) => {
    const { id } = req.params;
    try {
        // Desasociar metales de la familia antes de eliminarla
        await pool.query('UPDATE metales SET familia_id = NULL WHERE familia_id = $1', [id]);
        
        const result = await pool.query('DELETE FROM familias WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Familia no encontrada' });
        }

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


module.exports = {
    getFamilias,
    createFamilia,
    updateFamilia,
    deleteFamilia,
};
