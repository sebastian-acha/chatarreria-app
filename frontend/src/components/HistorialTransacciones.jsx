import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Printer, ArrowUpDown, ChevronLeft, ChevronRight, Search, Eye, X } from 'lucide-react';
import { ConfiguracionContext } from '../context/ConfiguracionContext';

const HistorialTransacciones = () => {
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transaccionModal, setTransaccionModal] = useState(null); // Para el modal de detalles

    const [paginacion, setPaginacion] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', metal_id: '' });
    const [orden, setOrden] = useState({ sort: 'id', order: 'DESC' });
    const [metales, setMetales] = useState([]); // Para el filtro
    const { configuracion } = useContext(ConfiguracionContext);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const fetchTransacciones = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const params = { page: paginacion.page, limit: paginacion.limit, sort: orden.sort, order: orden.order, ...filtros };
            Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

            const response = await axios.get(`${API_URL}/transacciones`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            setTransacciones(response.data.data);
            setPaginacion(prev => ({ ...prev, ...response.data.pagination }));
        } catch (err) {
            setError(err.response?.data?.error || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchMetales = async () => {
            try {
                const res = await axios.get(`${API_URL}/metales`);
                setMetales(res.data);
            } catch (error) {
                console.error("Error cargando metales", error);
            }
        };
        fetchMetales();
    }, [API_URL]);

    useEffect(() => {
        fetchTransacciones();
    }, [paginacion.page, paginacion.limit, orden]);

    const handleSort = (campo) => {
        setOrden(prev => ({ sort: campo, order: prev.sort === campo && prev.order === 'ASC' ? 'DESC' : 'ASC' }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPaginacion(prev => ({ ...prev, page: 1 }));
        fetchTransacciones();
    };

    const imprimirVoucher = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/transacciones/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = response.data;

            const detallesHTML = data.detalles.map(d => `
                <div style="margin-top: 10px; text-align: left;">
                    <p><strong>- ${d.metal_nombre}</strong></p>
                    <p style="padding-left: 15px;">Peso: ${d.peso_kilos} kg</p>
                    <p style="padding-left: 15px;">Precio/kg: $${Math.round(d.valor_kilo_aplicado).toLocaleString('es-CL')}</p>
                    <p style="padding-left: 15px;">Subtotal: $${Math.round(d.subtotal).toLocaleString('es-CL')}</p>
                </div>
            `).join('<hr style="border-style: dashed; margin: 5px 0;"/>');

            const ventana = window.open('', 'PRINT', 'height=600,width=400');
            ventana.document.write(`
                <html>
                    <head><title>Voucher #${data.id}</title></head>
                    <body style="font-family: monospace; text-align: center; padding: 20px;">
                        ${configuracion?.logo_url ? `<img src="${configuracion.logo_url}" alt="Logo" class="mx-auto mb-4" style="height: 4rem;" />` : ''}
                        <h2>${configuracion?.nombre_empresa || 'CHATARRERÍA'}</h2>
                        <p>Sucursal: ${data.sucursal_nombre || 'Central'}</p>
                        <p>Fecha: ${new Date(data.fecha_hora).toLocaleString()}</p>
                        <p>Voucher N°: <strong>${data.id}</strong></p>
                        <hr/>
                        <div style="text-align: left;">
                            <p>Cliente: ${data.cliente_nombre}</p>
                            <p>RUT/DNI: ${data.cliente_rut_dni || '-'}</p>
                        </div>
                        <hr/>
                        ${detallesHTML}
                        <hr/>
                        <h3>TOTAL: $${Math.round(parseFloat(data.total_pagar)).toLocaleString('es-CL')}</h3>
                        <br/>
                        <p>Atendido por: ${data.ejecutivo_nombre}</p>
                    </body>
                </html>
            `);
            ventana.document.close();
            ventana.focus();
            ventana.print();
            ventana.close();
        } catch (err) {
            alert('Error al cargar datos para imprimir');
        }
    };

    return (
        <div className="container-fluid p-4">
            <h1 className="h3 fw-bold mb-4">Historial de Transacciones</h1>

            <form onSubmit={handleSearch} className="bg-white p-4 rounded shadow-sm border mb-4 d-flex flex-wrap gap-3 align-items-end">
                <input type="date" className="form-control w-auto" value={filtros.fecha_inicio} onChange={e => setFiltros({ ...filtros, fecha_inicio: e.target.value })} />
                <input type="date" className="form-control w-auto" value={filtros.fecha_fin} onChange={e => setFiltros({ ...filtros, fecha_fin: e.target.value })} />
                <select className="form-select w-auto" value={filtros.metal__id} onChange={e => setFiltros({ ...filtros, metal_id: e.target.value })}>
                    <option value="">Todos los metales</option>
                    {metales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2"><Search size={18} /> Filtrar</button>
            </form>

            <div className="d-flex justify-content-between align-items-center mb-2">
                <div><span className="me-2">Mostrar</span><select value={paginacion.limit} onChange={(e) => setPaginacion(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))} className="form-select form-select-sm d-inline-block w-auto"><option value={20}>20</option><option value={40}>40</option><option value={100}>100</option></select><span className="ms-2">registros</span></div>
                <div><strong>Total:</strong> {paginacion.total} transacciones</div>
            </div>

            <div className="table-responsive bg-white shadow-sm rounded border">
                <table className="table table-hover mb-0">
                    <thead className="table-dark text-uppercase small">
                        <tr>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('id')}><div className="d-flex align-items-center gap-1">ID <ArrowUpDown size={14} /></div></th>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('fecha_hora')}><div className="d-flex align-items-center gap-1">Fecha <ArrowUpDown size={14} /></div></th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('total_pagar')}><div className="d-flex align-items-center gap-1">Total <ArrowUpDown size={14} /></div></th>
                            <th className="px-4 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="5" className="text-center py-4">Cargando...</td></tr>) : transacciones.length === 0 ? (<tr><td colSpan="5" className="text-center py-4">No se encontraron registros</td></tr>) : (
                            transacciones.map((t) => (
                                <tr key={t.id}>
                                    <td className="px-4 py-2">{t.id}</td>
                                    <td className="px-4 py-2">{new Date(t.fecha_hora).toLocaleString()}</td>
                                    <td className="px-4 py-2"><div className="fw-medium">{t.cliente_nombre}</div><div className="small text-muted">{t.cliente_rut_dni}</div></td>
                                    <td className="px-4 py-2 fw-bold text-success">${Math.round(parseFloat(t.total_pagar)).toLocaleString('es-CL')}</td>
                                    <td className="px-4 py-2 d-flex align-items-center gap-2">
                                        <button onClick={() => setTransaccionModal(t)} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"><Eye size={14} /> Detalles</button>
                                        <button onClick={() => imprimirVoucher(t.id)} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"><Printer size={14} /> Voucher</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-center align-items-center gap-4 mt-4">
                <button disabled={paginacion.page <= 1} onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page - 1 }))} className="btn btn-outline-secondary p-2"><ChevronLeft size={20} /></button>
                <span>Página {paginacion.page} de {paginacion.totalPages || 1}</span>
                <button disabled={paginacion.page >= paginacion.totalPages} onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page + 1 }))} className="btn btn-outline-secondary p-2"><ChevronRight size={20} /></button>
            </div>
            {error && <div className="text-danger text-center mt-2">{error}</div>}

            {transaccionModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Detalles de la Transacción #{transaccionModal.id}</h5>
                                <button onClick={() => setTransaccionModal(null)} className="btn-close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3 mb-4 small">
                                    <div className="col-6"><strong>Fecha:</strong> {new Date(transaccionModal.fecha_hora).toLocaleString()}</div>
                                    <div className="col-6"><strong>Sucursal:</strong> {transaccionModal.sucursal_nombre}</div>
                                    <div className="col-6"><strong>Cliente:</strong> {transaccionModal.cliente_nombre}</div>
                                    <div className="col-6"><strong>RUT/DNI:</strong> {transaccionModal.cliente_rut_dni || '-'}</div>
                                    <div className="col-6"><strong>Ejecutivo:</strong> {transaccionModal.ejecutivo_nombre}</div>
                                </div>

                                <div className="fw-bold mb-2">Metales comprados:</div>
                                <div className="table-responsive border rounded">
                                    <table className="table table-sm mb-0 small">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Metal</th>
                                                <th className="px-3 py-2 text-right">Peso (kg)</th>
                                                <th className="px-3 py-2 text-right">Precio/kg</th>
                                                <th className="px-3 py-2 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transaccionModal.detalles.map((d, index) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2">{d.metal_nombre}</td>
                                                    <td className="px-3 py-2 text-right">{d.peso_kilos}</td>
                                                    <td className="px-3 py-2 text-right">${Math.round(parseFloat(d.valor_kilo_aplicado)).toLocaleString('es-CL')}</td>
                                                    <td className="px-3 py-2 text-right fw-semibold">${Math.round(parseFloat(d.subtotal)).toLocaleString('es-CL')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="text-right mt-4">
                                    <span className="h5 fw-bold">TOTAL: ${Math.round(parseFloat(transaccionModal.total_pagar)).toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialTransacciones;