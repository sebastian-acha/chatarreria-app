require('dotenv').config();
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 1, sucursal_id: 1, rol: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log(token);
