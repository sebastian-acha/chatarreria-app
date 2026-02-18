const db = require('../config/db');
const XLSX = require('xlsx');

exports.crearTransaccion = async (req, res) => {
    // El cuerpo ahora espera un array de metales
    const { cliente_nombre, cliente_rut_dni, metales } = req.body;

    // Datos del token JWT
    const ejecutivo_id = req.user.id;
    const sucursal_id = req.user.sucursal_id;

    // --- Validaciones ---
    if (!cliente_nombre || !metales || !Array.isArray(metales) || metales.length === 0) {
        return res.status(400).json({ error: 'Faltan datos obligatorios: cliente o lista de metales.' });
    }

    // Validar cada item en el array de metales
    for (const metal of metales) {
        if (!metal.metal_id || !metal.peso_kilos || parseFloat(metal.peso_kilos) <= 0) {
            return res.status(400).json({ error: `Datos de metal inválidos: ${JSON.stringify(metal)}` });
        }
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN');
        const configuracionResult = await client.query('SELECT logo_url FROM configuracion WHERE id = 1');
        const logoUrl = configuracionResult.rows.length > 0 ? configuracionResult.rows[0].logo_url : null;
        // 1. Obtener precios de TODOS los metales implicados en una sola consulta
        const metalIds = metales.map(m => parseInt(m.metal_id, 10));
        const preciosResult = await client.query('SELECT id, nombre, valor_por_kilo FROM metales WHERE id = ANY($1::int[])', [metalIds]);

        if (preciosResult.rows.length !== metalIds.length) {
            throw new Error('Uno o más de los metales especificados no existen.');
        }

        const preciosMap = new Map(preciosResult.rows.map(p => [p.id, { nombre: p.nombre, valor: parseFloat(p.valor_por_kilo) }]));

        // 2. Calcular subtotales y total general
        let total_pagar = 0;
        const detallesParaInsertar = metales.map(m => {
            const metalIdInt = parseInt(m.metal_id, 10);
            const precioInfo = preciosMap.get(metalIdInt);
            if (!precioInfo) {
                // Esta validación ahora es más robusta.
                throw new Error(`No se encontró el precio para el metal con ID ${metalIdInt}.`);
            }
            const peso = parseFloat(m.peso_kilos);
            const subtotal = peso * precioInfo.valor;
            total_pagar += subtotal;

            return {
                metal_id: metalIdInt,
                peso_kilos: peso,
                valor_kilo_aplicado: precioInfo.valor,
                subtotal
            };
        });

        // 3. Insertar la transacción principal
        const transaccionQuery = `
            INSERT INTO transacciones (sucursal_id, ejecutivo_id, cliente_nombre, cliente_rut_dni, total_pagar)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, fecha_hora
        `;
        const transaccionValues = [sucursal_id, ejecutivo_id, cliente_nombre, cliente_rut_dni, total_pagar];
        const transaccionResult = await client.query(transaccionQuery, transaccionValues);
        const nuevaTransaccion = transaccionResult.rows[0];

        // 4. Insertar los detalles de la transacción
        const transaccionId = nuevaTransaccion.id;
        const detallesQuery = `
            INSERT INTO transaccion_detalles (transaccion_id, metal_id, peso_kilos, valor_kilo_aplicado, subtotal)
            SELECT $1, unnest($2::int[]), unnest($3::decimal[]), unnest($4::decimal[]), unnest($5::decimal[])
        `;
        const detallesValues = [
            transaccionId,
            detallesParaInsertar.map(d => d.metal_id),
            detallesParaInsertar.map(d => d.peso_kilos),
            detallesParaInsertar.map(d => d.valor_kilo_aplicado),
            detallesParaInsertar.map(d => d.subtotal),
        ];
        await client.query(detallesQuery, detallesValues);

        await client.query('COMMIT');

        // 5. Responder con datos para el voucher
        res.status(201).json({
            mensaje: 'Compra registrada exitosamente',
            voucher: {
                logo_url: logoUrl,
                correlativo: transaccionId,
                fecha: nuevaTransaccion.fecha_hora,
                sucursal_id,
                ejecutivo_id,
                cliente: { nombre: cliente_nombre, rut: cliente_rut_dni },
                total_pagado: total_pagar,
                detalles: detallesParaInsertar.map(d => ({
                    metal: preciosMap.get(d.metal_id).nombre,
                    peso_kilos: d.peso_kilos,
                    precio_unitario: d.valor_kilo_aplicado,
                    subtotal: d.subtotal
                }))
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear transacción:', error);
        res.status(500).json({ error: 'Error del servidor al procesar la compra', detalle: error.message });
    } finally {
        client.release();
    }
};

exports.listarTransacciones = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = 'id', order = 'DESC', metal_id, fecha_inicio, fecha_fin } = req.query;
        const offset = (page - 1) * limit;

        const validSortFields = ['id', 'fecha_hora', 'cliente_nombre', 'total_pagar'];
        const sortBy = validSortFields.includes(sort) ? `t.${sort}` : 't.id';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const values = [];
        let paramIndex = 1;

        // Cláusula WHERE para filtros
        let whereClauses = ["1=1"];
        if (fecha_inicio) {
            whereClauses.push(`t.fecha_hora >= $${paramIndex++}`);
            values.push(fecha_inicio);
        }
        if (fecha_fin) {
            whereClauses.push(`t.fecha_hora <= $${paramIndex++}`);
            values.push(fecha_fin);
        }
        if (metal_id) {
            whereClauses.push(`EXISTS (SELECT 1 FROM transaccion_detalles td WHERE td.transaccion_id = t.id AND td.metal_id = $${paramIndex++})`);
            values.push(metal_id);
        }

        const query = `
            SELECT 
                t.id, t.fecha_hora, t.cliente_nombre, t.cliente_rut_dni, t.total_pagar,
                u.nombres as ejecutivo_nombre,
                s.nombre as sucursal_nombre,
                (SELECT json_agg(json_build_object(
                    'metal_nombre', m.nombre,
                    'peso_kilos', td.peso_kilos,
                    'valor_kilo_aplicado', td.valor_kilo_aplicado,
                    'subtotal', td.subtotal
                ))
                FROM transaccion_detalles td
                JOIN metales m ON td.metal_id = m.id
                WHERE td.transaccion_id = t.id
                ) as detalles,
                COUNT(*) OVER() as total_count
            FROM transacciones t
            LEFT JOIN usuarios u ON t.ejecutivo_id = u.id
            LEFT JOIN sucursales s ON t.sucursal_id = s.id
            WHERE ${whereClauses.join(' AND ')}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        values.push(limit, offset);
        const result = await db.query(query, values);

        const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
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

exports.obtenerTransaccion = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                t.id, t.fecha_hora, t.cliente_nombre, t.cliente_rut_dni, t.total_pagar,
                u.nombres as ejecutivo_nombre,
                s.nombre as sucursal_nombre,
                (SELECT json_agg(json_build_object(
                    'metal_nombre', m.nombre,
                    'peso_kilos', td.peso_kilos,
                    'valor_kilo_aplicado', td.valor_kilo_aplicado,
                    'subtotal', td.subtotal
                ))
                FROM transaccion_detalles td
                JOIN metales m ON td.metal_id = m.id
                WHERE td.transaccion_id = t.id
                ) as detalles
            FROM transacciones t
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
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.obtenerReporteDiario = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.nombre as metal, 
                SUM(td.peso_kilos) as total_kilos, 
                SUM(td.subtotal) as total_pagado,
                COUNT(DISTINCT td.transaccion_id) as cantidad_transacciones
            FROM transaccion_detalles td
            JOIN metales m ON td.metal_id = m.id
            JOIN transacciones t ON td.transaccion_id = t.id
            WHERE t.fecha_hora::date = CURRENT_DATE
            GROUP BY m.nombre
            ORDER BY total_kilos DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener reporte diario:', error);
        res.status(500).json({ error: 'Error del servidor al generar el reporte' });
    }
};

exports.exportarReporteDiarioExcel = async (req, res) => {
    try {
        // La misma consulta que obtenerReporteDiario
        const query = `
            SELECT 
                m.nombre as metal, 
                SUM(td.peso_kilos) as total_kilos, 
                SUM(td.subtotal) as total_pagado,
                COUNT(DISTINCT td.transaccion_id) as cantidad_transacciones
            FROM transaccion_detalles td
            JOIN metales m ON td.metal_id = m.id
            JOIN transacciones t ON td.transaccion_id = t.id
            WHERE t.fecha_hora::date = CURRENT_DATE
            GROUP BY m.nombre
            ORDER BY total_kilos DESC
        `;
        const result = await db.query(query);

        const data = result.rows.map(row => ({
            'Metal': row.metal,
            'Transacciones': parseInt(row.cantidad_transacciones),
            'Peso Total (kg)': parseFloat(row.total_kilos),
            'Total Pagado ($)': Math.round(parseFloat(row.total_pagado))
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Aplicar formato de número con separador de miles a las celdas correspondientes
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Iniciar en 1 para saltar la cabecera
            // Columna C: Peso Total (kg)
            const pesoCell = ws[XLSX.utils.encode_cell({ c: 2, r: R })];
            if (pesoCell) pesoCell.z = '#,##0.000'; // Formato con 3 decimales y separador de miles

            // Columna D: Total Pagado ($)
            const totalCell = ws[XLSX.utils.encode_cell({ c: 3, r: R })];
            if (totalCell) totalCell.z = '$ #,##0'; // Formato de moneda con separador de miles
        }

        ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
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