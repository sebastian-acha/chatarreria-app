const { exportarHistorialExcel } = require('./controllers/transaccionController');

const req = {
    query: {
        fecha_inicio: '2026-05-01',
        fecha_fin: '2026-06-03'
    }
};

const res = {
    setHeader: () => {},
    send: () => console.log('Success'),
    status: (code) => {
        return {
            json: (data) => console.log('Error', code, data)
        }
    }
};

exportarHistorialExcel(req, res).catch(console.error);
