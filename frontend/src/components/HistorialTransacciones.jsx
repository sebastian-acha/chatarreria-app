import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { Eye, Printer, Search, Calendar, X, ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import Footer from './Footer';

const HistorialTransacciones = () => {
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginacion, setPaginacion] = useState({ page: 1, totalPages: 1, total: 0 });
    const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '' });

    // Estado para el Modal y Configuración
    const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
    const [configuracion, setConfiguracion] = useState(null);



    // Cargar configuración (para el logo del voucher) al montar
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await apiClient.get(`/configuracion`);
                setConfiguracion(res.data);
            } catch (error) {
                console.error("Error cargando configuración", error);
            }
        };
        fetchConfig();
    }, []);

    // Cargar transacciones cuando cambian filtros o página
    useEffect(() => {
        fetchTransacciones();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginacion.page, filtros]);

    const fetchTransacciones = async () => {
        setLoading(true);
        try {
            const params = {
                page: paginacion.page,
                limit: 10,
                ...filtros
            };

            // Eliminar claves vacías
            Object.keys(params).forEach(key => params[key] === '' && delete params[key]);

            const res = await apiClient.get(`/transacciones`, {
                params
            });

            console.log('Datos recibidos del backend:', res.data);

            setTransacciones(res.data.data);
            setPaginacion(prev => ({ ...prev, ...res.data.pagination }));
        } catch (error) {
            console.error("Error cargando historial", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
        setPaginacion({ ...paginacion, page: 1 }); // Resetear a página 1 al filtrar
    };

    const handleAnular = async (id) => {
        if (window.confirm('¿Está seguro que desea anular esta transacción?')) {
            try {
                await apiClient.put(`/transacciones/${id}/anular`);
                fetchTransacciones();
            } catch (error) {
                console.error("Error al anular la transacción", error);
                alert('Hubo un error al anular la transacción.');
            }
        }
    };

    const abrirModal = (transaccion) => {
        setTransaccionSeleccionada(transaccion);
    };

    const cerrarModal = () => {
        setTransaccionSeleccionada(null);
    };

    const imprimirVoucher = (transaccion) => {
        if (!transaccion) return;

        const voucher = {
            correlativo: transaccion.id,
            fecha: transaccion.fecha_hora,
            cliente: {
                nombre: transaccion.cliente_nombre,
                rut: transaccion.cliente_rut_dni
            },
            detalles: transaccion.detalles,
            total_pagado: transaccion.total_pagar,
            logo_url: configuracion?.logo_url,
        };

        const detallesHTML = voucher.detalles.map(d => {
            const precioDisplay = (d.precio_oficial && d.precio_unitario !== d.precio_oficial)
                ? `<span class="texto-tachado">$${Math.round(d.precio_oficial).toLocaleString('es-CL')}</span><br/>Precio Especial: <b>$${Math.round(d.precio_unitario).toLocaleString('es-CL')}</b>`
                : `<b>$${Math.round(d.precio_unitario).toLocaleString('es-CL')}</b>`;

            return `
            <tr>
              <td>
                <table class="font11"> 
                  <tr> 
                    <td>
                      <b>${d.peso_kilos} kg </b>| ${d.familia ? `${d.familia} - ` : ''}${d.metal}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span> Valor kg: ${precioDisplay}</span>
                    </td>
                  </tr>
                </table> 
              </td>
              <td class="text-center">
                Subtotal:
                <br>
                <b>$${Math.round(d.subtotal).toLocaleString('es-CL')}</b>
              </td>
            </tr>
        `}).join('');

        const logoHTML = voucher.logo_url ? `<img class="logo" src="${voucher.logo_url}" alt="Logo" style="max-width: 150px; margin: 0 auto 20px auto; display: block;">` : '';

        const ventana = window.open('', 'PRINT', 'height=600,width=400');
        ventana.document.write(`
            <html>
                <head><title>Voucher #${voucher.correlativo}</title>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
                    <style type="text/css">
                        .container{padding:0;}
                        body {font-size:11px; font-family: tahoma, sans-serif; font-weight:100; letter-spacing: 0.02em;}
                        .font11{font-size:11px }
                        footer{font-size:10px;}
                        .table-container{border:1px solid black; margin-bottom:8px; overflow-x: auto; -webkit-overflow-scrolling: touch;}
                        .table{margin-bottom:0;font-size:11px}
                        .table b,
                        table strong,
                        footer b{font-weight:600; letter-spacing:0.03em;}
                        footer b{letter-spacing:0;}
                        .logo{max-height:35px;}
                        h1{font-size:16px; margin:4px 0;}
                        .table td{vertical-align: middle;}
                        .table-materials tr{border-bottom: 1px solid black;}
                        .table-materials tr:last-child{border-bottom: transparent;}
                        .table-materials tr td:first-child,
                        .table-info-user tr td:first-child{border-right: 1px solid black;}
                        .table-materials tr td table{width:100%;}
                        .table-materials tr td table tr{border-bottom: 1px dashed black;}
                        .table-materials tr td table tr td{border-right: none !important;}
                        .table-materials tr td table tr td{border-right: none !important; padding-bottom:0px; line-height:1.4em; padding-bottom:4px;}
                        .table-materials tr td table tr:last-child td{padding-bottom:0px;}
                        .table-info-user{margin-bottom:20px;}
                        .table-info-user tbody tr{border-style: hidden;}
                        .table-info-user table tr td:first-child{padding-right: 11px;}
                        .table-container.total .table {font-size:16px; margin-bottom:5px;}
                        .texto-tachado{text-decoration: line-through;}
                        .table>:not(caption)>*>*{border-bottom-width:0; padding:6px;}
                    </style>
                </head>
                <body class="font11">
                    <main>
                        <div class="container">
                            <header class="text-center mb-3">
                                ${logoHTML}
                                <h1> ${configuracion?.nombre_empresa || 'Chatarrería'}</h1>
                            </header>
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span>
                                    Fecha: ${new Date(voucher.fecha).toLocaleDateString()}
                                </span>
                                <span>
                                    Hora: ${new Date(voucher.fecha).toLocaleTimeString()};
                                </span>
                            </div>
                            <div class="table-container table-info-user rounded">
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <td class="text-start">
                                                Cliente: ${voucher.cliente.nombre}
                                                <br>
                                                Rut: ${voucher.cliente.rut || '-'}
                                            </td>
                                            <td class="text-center">
                                                Comprobante
                                                <br>
                                                <b>Nº: ${voucher.correlativo}</b>
                                            </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </div>
                                <div class="table-container table-materials rounded">
                                    <table class="table mb-0">
                                        <tbody>
                                            ${detallesHTML}
                                        </tbody>
                                    </table>
                                </div>
                                <div class="table-container total rounded">
                                    <table class="table">
                                        <tbody>
                                            <tr>
                                                <td class="text-center">
                                                    Total <b>$${Math.round(voucher.total_pagado).toLocaleString('es-CL')}</b>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <footer class="d-flex justify-content-end mb-2">
                                    <span>
                                        <!-- Atendido por: <b>Leonardo Aguirre</b> -->
                                    </span>
                                </footer>
                            </div>
                        </main>
                    </body>
                </html>
        `);
        ventana.document.close();
        ventana.onload = () => {
            ventana.focus();
            ventana.print();
            ventana.close();
        };
    };

    return (
        <>
            <div className="container my-4">
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <h2 className="card-title mb-4 d-flex align-items-center gap-2">
                            <Search className="text-primary" /> Historial de Transacciones
                        </h2>

                        {/* Filtros */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label fw-bold text-secondary"><Calendar size={16} /> Fecha Inicio</label>
                                <input type="date" name="fecha_inicio" className="form-control" value={filtros.fecha_inicio} onChange={handleFiltroChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold text-secondary"><Calendar size={16} /> Fecha Fin</label>
                                <input type="date" name="fecha_fin" className="form-control" value={filtros.fecha_fin} onChange={handleFiltroChange} />
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th className="text-end">Total</th>
                                        <th>Estado</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-4">Cargando...</td></tr>
                                    ) : transacciones.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-4">No se encontraron transacciones.</td></tr>
                                    ) : (
                                        transacciones.map(t => (
                                            <tr key={t.id} className={t.estado && t.estado.toLowerCase() === 'anulada' ? 'table-danger' : ''}>
                                                <td>#{t.id}</td>
                                                <td>{new Date(t.fecha_hora).toLocaleDateString()} {new Date(t.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td>{t.cliente_nombre}</td>
                                                <td className="fw-bold text-success">${t.estado && t.estado.toLowerCase() === 'anulada' ? 0 : Math.round(t.total_pagar).toLocaleString('es-CL')}</td>
                                                <td>
                                                    <span className={`badge ${t.estado && t.estado.toLowerCase() === 'activa' ? 'bg-success' : 'bg-danger'}`}>
                                                        {t.estado}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    {t.estado && t.estado.toLowerCase() === 'activa' && (
                                                        <button className="btn btn-sm btn-outline-danger me-2" onClick={() => handleAnular(t.id)} title="Anular Transacción">
                                                            <Ban size={18} />
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => abrirModal(t)} title="Ver Detalles">
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => imprimirVoucher(t)} title="Imprimir Voucher">
                                                        <Printer size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted">Página {paginacion.page} de {paginacion.totalPages}</span>
                            <div>
                                <button className="btn btn-outline-secondary btn-sm me-2" disabled={paginacion.page <= 1} onClick={() => setPaginacion(p => ({ ...p, page: p.page - 1 }))}>
                                    <ChevronLeft size={16} /> Anterior
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" disabled={paginacion.page >= paginacion.totalPages} onClick={() => setPaginacion(p => ({ ...p, page: p.page + 1 }))}>
                                    Siguiente <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Detalles */}
                {transaccionSeleccionada && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Detalle Transacción #{transaccionSeleccionada.id}</h5>
                                    <button type="button" className="btn-close" onClick={cerrarModal}></button>
                                </div>
                                <div className="modal-body">
                                    <p><strong>Cliente:</strong> {transaccionSeleccionada.cliente_nombre}</p>
                                    <p><strong>Ejecutivo:</strong> {transaccionSeleccionada.ejecutivo_nombre}</p>
                                     <p><strong>Estado:</strong> <span className={`badge ${transaccionSeleccionada.estado && transaccionSeleccionada.estado.toLowerCase() === 'activa' ? 'bg-success' : 'bg-danger'}`}>{transaccionSeleccionada.estado}</span></p>
                                    <hr />
                                    <ul className="list-group list-group-flush">
                                        {transaccionSeleccionada.detalles.map((d, idx) => (
                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="fw-bold">{d.metal}</span> <span className="text-muted">({d.peso_kilos} kg)</span>
                                                    {/* Visualización de Precio Especial en Modal */}
                                                    {d.precio_oficial && d.precio_unitario !== d.precio_oficial && (
                                                        <div className="small text-primary">
                                                            <span className="text-decoration-line-through text-muted me-1">${Math.round(d.precio_oficial)}</span>
                                                            <strong>${Math.round(d.precio_unitario)}</strong> (Especial)
                                                        </div>
                                                    )}
                                                    {(!d.precio_oficial || d.precio_unitario === d.precio_oficial) && (
                                                        <div className="small text-muted">${Math.round(d.precio_unitario)} / kg</div>
                                                    )}
                                                </div>
                                                <span className="fw-bold">${Math.round(d.subtotal).toLocaleString('es-CL')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <hr />
                                    <h4 className="text-end text-success fw-bold">Total: ${transaccionSeleccionada.estado && transaccionSeleccionada.estado.toLowerCase() === 'anulada' ? 0 : Math.round(transaccionSeleccionada.total_pagar).toLocaleString('es-CL')}</h4>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={cerrarModal}>Cerrar</button>
                                    <button type="button" className="btn btn-primary" onClick={() => imprimirVoucher(transaccionSeleccionada)}>
                                        <Printer size={18} className="me-2" /> Imprimir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default HistorialTransacciones;