import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Printer, Search, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

const HistorialTransacciones = () => {
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginacion, setPaginacion] = useState({ page: 1, totalPages: 1, total: 0 });
    const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '' });

    // Estado para el Modal y Configuración
    const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
    const [configuracion, setConfiguracion] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // Cargar configuración (para el logo del voucher) al montar
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axios.get(`${API_URL}/configuracion`);
                setConfiguracion(res.data);
            } catch (error) {
                console.error("Error cargando configuración", error);
            }
        };
        fetchConfig();
    }, [API_URL]);

    // Cargar transacciones cuando cambian filtros o página
    useEffect(() => {
        fetchTransacciones();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginacion.page, filtros]);

    const fetchTransacciones = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = {
                page: paginacion.page,
                limit: 10,
                ...filtros
            };

            // Eliminar claves vacías
            Object.keys(params).forEach(key => params[key] === '' && delete params[key]);

            const res = await axios.get(`${API_URL}/transacciones`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

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

    const abrirModal = (transaccion) => {
        setTransaccionSeleccionada(transaccion);
    };

    const cerrarModal = () => {
        setTransaccionSeleccionada(null);
    };

    const imprimirVoucher = (transaccion) => {
        if (!transaccion) return;

        const detallesHTML = transaccion.detalles.map(d => {
            // Lógica de visualización de Precio Especial
            const precioDisplay = (d.precio_oficial && d.precio_unitario !== d.precio_oficial)
                ? `<span style="text-decoration: line-through; color: #666; font-size: 0.9em;">$${Math.round(d.precio_oficial).toLocaleString('es-CL')}</span><br/>Precio Especial: <b>$${Math.round(d.precio_unitario).toLocaleString('es-CL')}</b>`
                : `$${Math.round(d.precio_unitario).toLocaleString('es-CL')}`;

            return `
            <div style="margin-top: 10px;">
                <p>Metal: ${d.metal}</p>
                <p>Peso: ${d.peso_kilos} kg</p>
                <p>Precio/kg: ${precioDisplay}</p>
                <p>Subtotal: $${Math.round(d.subtotal).toLocaleString('es-CL')}</p>
            </div>
        `}).join('<hr style="border-style: dashed;"/>');

        const logoHTML = configuracion?.logo_url
            ? `<img src="${configuracion.logo_url}" alt="Logo" style="max-width: 150px; margin: 0 auto 20px auto; display: block;">`
            : '';

        const ventana = window.open('', 'PRINT', 'height=600,width=400');
        ventana.document.write(`
            <html>
                <head><title>Voucher #${transaccion.id}</title></head>
                <body style="font-family: monospace; text-align: center; padding: 20px;">
                    ${logoHTML}
                    <h2>CHATARRERÍA</h2>
                    <p>Fecha: ${new Date(transaccion.fecha_hora).toLocaleString()}</p>
                    <p>Voucher N°: <strong>${transaccion.id}</strong></p>
                    <hr/>
                    <div style="text-align: left;">
                        <p>Cliente: ${transaccion.cliente_nombre}</p>
                        <p>RUT/DNI: ${transaccion.cliente_rut_dni || '-'}</p>
                        <p>Atendido por: ${transaccion.ejecutivo_nombre || '-'}</p>
                    </div>
                    <hr/>
                    ${detallesHTML}
                    <hr/>
                    <h3>TOTAL: $${Math.round(transaccion.total_pagar).toLocaleString('es-CL')}</h3>
                    <br/>
                </body>
            </html>
        `);
        ventana.document.close();
        ventana.focus();
        ventana.print();
        ventana.close();
    };

    return (
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
                                    <th>Total</th>
                                    <th className="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4">Cargando...</td></tr>
                                ) : transacciones.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4">No se encontraron transacciones.</td></tr>
                                ) : (
                                    transacciones.map(t => (
                                        <tr key={t.id}>
                                            <td>#{t.id}</td>
                                            <td>{new Date(t.fecha_hora).toLocaleDateString()} {new Date(t.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td>{t.cliente_nombre}</td>
                                            <td className="fw-bold text-success">${Math.round(t.total_pagar).toLocaleString('es-CL')}</td>
                                            <td className="text-end">
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
                                <h4 className="text-end text-success fw-bold">Total: ${Math.round(transaccionSeleccionada.total_pagar).toLocaleString('es-CL')}</h4>
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
    );
};

export default HistorialTransacciones;