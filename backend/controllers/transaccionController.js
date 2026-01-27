const db = require('../config/db');
const XLSX = require('xlsx');

exports.crearTransaccion = async (req, res) => {
    const { metal_id, peso_gramos, cliente_nombre, cliente_rut_dni } = req.body;
    
    // Estos datos vienen del token JWT (authMiddleware)
    const ejecutivo_id = req.user.id;
    const sucursal_id = req.user.sucursal_id;

    // Validaciones básicas
    if (!metal_id || !peso_gramos || !cliente_nombre) {
        return res.status(400).json({ error: 'Faltan datos obligatorios (metal, peso, cliente)' });
    }

    if (peso_gramos <= 0) {
        return res.status(400).json({ error: 'El peso debe ser mayor a 0' });
    }

    try {
        // 1. Obtener precio actual del metal desde la BD (Seguridad)
        const metalResult = await db.query('SELECT * FROM metales WHERE id = $1', [metal_id]);
        
        if (metalResult.rows.length === 0) {
            return res.status(404).json({ error: 'Metal no encontrado' });
        }

        const metal = metalResult.rows[0];
        const valor_gramo_aplicado = parseFloat(metal.valor_por_gramo);
        const peso = parseFloat(peso_gramos);
        
        // 2. Calcular total
        const total_pagar = peso * valor_gramo_aplicado;

        // 3. Insertar transacción
        const query = `
            INSERT INTO transacciones 
            (sucursal_id, ejecutivo_id, metal_id, cliente_nombre, cliente_rut_dni, peso_gramos, valor_gramo_aplicado, total_pagar)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, fecha_hora
        `;
        
        const values = [
            sucursal_id, 
            ejecutivo_id, 
            metal_id, 
            cliente_nombre, 
            cliente_rut_dni, 
            peso, 
            valor_gramo_aplicado, 
            total_pagar
        ];

        const transaccionResult = await db.query(query, values);
        const nuevaTransaccion = transaccionResult.rows[0];

        // 4. Responder con datos listos para imprimir el voucher
        res.status(201).json({
            mensaje: 'Compra registrada exitosamente',
            voucher: {
                correlativo: nuevaTransaccion.id,
                fecha: nuevaTransaccion.fecha_hora,
                sucursal_id,
                ejecutivo_id,
                cliente: {
                    nombre: cliente_nombre,
                    rut: cliente_rut_dni
                },
                detalle: {
                    metal: metal.nombre,
                    peso_gramos: peso,
                    precio_unitario: valor_gramo_aplicado,
                    total: total_pagar
                }
            }
        });

    } catch (error) {
        console.error('Error al crear transacción:', error);
        res.status(500).json({ error: 'Error del servidor al procesar la compra' });
    }
};

// Listar historial de transacciones con paginación y filtros
exports.listarTransacciones = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = 'id', order = 'DESC', metal_id, fecha_inicio, fecha_fin } = req.query;

        const offset = (page - 1) * limit;
        
        // Whitelist para evitar SQL Injection en el ORDER BY
        const validSortFields = ['id', 'fecha_hora', 'peso_gramos', 'total_pagar', 'metal_nombre'];
        const sortBy = validSortFields.includes(sort) ? sort : 'id';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Construcción dinámica de filtros
        let whereClause = '';
        const values = [];
        let paramIndex = 1;

        if (metal_id) {
            whereClause += ` AND t.metal_id = $${paramIndex++}`;
            values.push(metal_id);
        }

        if (fecha_inicio) {
            whereClause += ` AND t.fecha_hora >= $${paramIndex++}`;
            values.push(fecha_inicio);
        }

        if (fecha_fin) {
            whereClause += ` AND t.fecha_hora <= $${paramIndex++}`;
            values.push(fecha_fin);
        }

        // Consulta con Window Function para obtener total y datos en una sola ejecución
        const query = `
            SELECT 
                t.id,
                t.fecha_hora,
                t.cliente_nombre,
                t.cliente_rut_dni,
                t.peso_gramos,
                t.valor_gramo_aplicado,
                t.total_pagar,
                m.nombre as metal_nombre,
                u.nombres as ejecutivo_nombre,
                s.nombre as sucursal_nombre,
                COUNT(*) OVER() as total_count
            FROM transacciones t
            JOIN metales m ON t.metal_id = m.id
            LEFT JOIN usuarios u ON t.ejecutivo_id = u.id
            LEFT JOIN sucursales s ON t.sucursal_id = s.id
            WHERE 1=1 ${whereClause}
            ORDER BY ${sortBy === 'metal_nombre' ? 'm.nombre' : 't.' + sortBy} ${sortOrder}
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        values.push(limit, offset);

        const result = await db.query(query, values);

        const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
        
        // Limpiar el campo total_count de los resultados individuales
        const data = result.rows.map(row => {
            const { total_count, ...rest } = row;
            return rest;
        });

        res.json({
            data,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error al listar transacciones:', error);
        res.status(500).json({ error: 'Error del servidor al obtener el historial' });
    }
};

// Obtener detalles de una transacción específica (para reimprimir voucher)
exports.obtenerTransaccion = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                t.id,
                t.fecha_hora,
                t.cliente_nombre,
                t.cliente_rut_dni,
                t.peso_gramos,
                t.valor_gramo_aplicado,
                t.total_pagar,
                m.nombre as metal_nombre,
                u.nombres as ejecutivo_nombre,
                s.nombre as sucursal_nombre
            FROM transacciones t
            JOIN metales m ON t.metal_id = m.id
            LEFT JOIN usuarios u ON t.ejecutivo_id = u.id
            LEFT JOIN sucursales s ON t.sucursal_id = s.id
            WHERE t.id = $1
        `;

        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transacción no encontrada' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error al obtener transacción:', error);
        res.status(500).json({ error: 'Error del servidor al obtener la transacción' });
    }
};

// Reporte diario de compras por metal
exports.obtenerReporteDiario = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.nombre as metal, 
                SUM(t.peso_gramos) as total_gramos, 
                SUM(t.total_pagar) as total_pagado,
                COUNT(t.id) as cantidad_transacciones
            FROM transacciones t
            JOIN metales m ON t.metal_id = m.id
            WHERE t.fecha_hora::date = CURRENT_DATE
            GROUP BY m.nombre
            ORDER BY total_gramos DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener reporte diario:', error);
        res.status(500).json({ error: 'Error del servidor al generar el reporte' });
    }
};

// Exportar reporte diario a Excel
exports.exportarReporteDiarioExcel = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.nombre as metal, 
                SUM(t.peso_gramos) as total_gramos, 
                SUM(t.total_pagar) as total_pagado,
                COUNT(t.id) as cantidad_transacciones
            FROM transacciones t
            JOIN metales m ON t.metal_id = m.id
            WHERE t.fecha_hora::date = CURRENT_DATE
            GROUP BY m.nombre
            ORDER BY total_gramos DESC
        `;
        const result = await db.query(query);

        // Formatear datos para Excel
        const data = result.rows.map(row => ({
            'Metal': row.metal,
            'Transacciones': parseInt(row.cantidad_transacciones),
            'Peso Total (kg)': (parseFloat(row.total_gramos) / 1000).toFixed(2),
            'Total Pagado ($)': parseFloat(row.total_pagado).toFixed(2)
        }));

        // Crear libro y hoja
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Ajustar ancho de columnas
        ws['!cols'] = [{wch: 20}, {wch: 15}, {wch: 15}, {wch: 20}];

        XLSX.utils.book_append_sheet(wb, ws, "Reporte Diario");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Diario.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Error al exportar Excel:', error);
        res.status(500).json({ error: 'Error al generar el archivo Excel' });
    }
};