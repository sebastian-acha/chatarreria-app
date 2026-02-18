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
                        ${configuracion?.logo_url ? `<img src="${configuracion.logo_url}" alt="Logo" style="mx-auto h-16 mb-4" />` : ''}
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
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Historial de Transacciones</h1>

            <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                <input type="date" className="border p-2 rounded" value={filtros.fecha_inicio} onChange={e => setFiltros({ ...filtros, fecha_inicio: e.target.value })} />
                <input type="date" className="border p-2 rounded" value={filtros.fecha_fin} onChange={e => setFiltros({ ...filtros, fecha_fin: e.target.value })} />
                <select className="border p-2 rounded" value={filtros.metal__id} onChange={e => setFiltros({ ...filtros, metal_id: e.target.value })}>
                    <option value="">Todos los metales</option>
                    {metales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><Search size={18} /> Filtrar</button>
            </form>

            <div className="flex justify-between items-center mb-2">
                <div><span className="mr-2">Mostrar</span><select value={paginacion.limit} onChange={(e) => setPaginacion(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))} className="border p-1 rounded"><option value={20}>20</option><option value={40}>40</option><option value={100}>100</option></select><span className="ml-2">registros</span></div>
                <div><strong>Total:</strong> {paginacion.total} transacciones</div>
            </div>

            <div className="overflow-x-auto bg-white shadow-sm rounded-xl border border-gray-200">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-800 text-white uppercase">
                        <tr>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('id')}><div className="flex items-center gap-1">ID <ArrowUpDown size={14} /></div></th>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('fecha_hora')}><div className="flex items-center gap-1">Fecha <ArrowUpDown size={14} /></div></th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('total_pagar')}><div className="flex items-center gap-1">Total <ArrowUpDown size={14} /></div></th>
                            <th className="px-4 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="5" className="text-center py-4">Cargando...</td></tr>) : transacciones.length === 0 ? (<tr><td colSpan="5" className="text-center py-4">No se encontraron registros</td></tr>) : (
                            transacciones.map((t) => (
                                <tr className="border-b hover:bg-gray-50" key={t.id}>
                                    <td className="px-4 py-2">{t.id}</td>
                                    <td className="px-4 py-2">{new Date(t.fecha_hora).toLocaleString()}</td>
                                    <td className="px-4 py-2"><div className="font-medium">{t.cliente_nombre}</div><div className="text-xs text-gray-500">{t.cliente_rut_dni}</div></td>
                                    <td className="px-4 py-2 font-bold text-green-700">${Math.round(parseFloat(t.total_pagar)).toLocaleString('es-CL')}</td>
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        <button onClick={() => setTransaccionModal(t)} className="text-gray-600 hover:text-gray-800 flex items-center gap-1 border border-gray-400 px-2 py-1 rounded text-xs"><Eye size={14} /> Detalles</button>
                                        <button onClick={() => imprimirVoucher(t.id)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 border border-blue-600 px-2 py-1 rounded text-xs"><Printer size={14} /> Voucher</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center gap-4 mt-4">
                <button disabled={paginacion.page <= 1} onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page - 1 }))} className="p-2 border rounded disabled:opacity-50 hover:bg-gray-100"><ChevronLeft size={20} /></button>
                <span>Página {paginacion.page} de {paginacion.totalPages || 1}</span>
                <button disabled={paginacion.page >= paginacion.totalPages} onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page + 1 }))} className="p-2 border rounded disabled:opacity-50 hover:bg-gray-100"><ChevronRight size={20} /></button>
            </div>
            {error && <div className="text-red-500 text-center mt-2">{error}</div>}

            {transaccionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold">Detalles de la Transacción #{transaccionModal.id}</h3>
                            <button onClick={() => setTransaccionModal(null)} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div><strong>Fecha:</strong> {new Date(transaccionModal.fecha_hora).toLocaleString()}</div>
                                <div><strong>Sucursal:</strong> {transaccionModal.sucursal_nombre}</div>
                                <div><strong>Cliente:</strong> {transaccionModal.cliente_nombre}</div>
                                <div><strong>RUT/DNI:</strong> {transaccionModal.cliente_rut_dni || '-'}</div>
                                <div><strong>Ejecutivo:</strong> {transaccionModal.ejecutivo_nombre}</div>
                            </div>

                            <div className="font-bold mb-2">Metales comprados:</div>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Metal</th>
                                            <th className="px-3 py-2 text-right">Peso (kg)</th>
                                            <th className="px-3 py-2 text-right">Precio/kg</th>
                                            <th className="px-3 py-2 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transaccionModal.detalles.map((d, index) => (
                                            <tr key={index} className="border-b last:border-b-0">
                                                <td className="px-3 py-2">{d.metal_nombre}</td>
                                                <td className="px-3 py-2 text-right">{d.peso_kilos}</td>
                                                <td className="px-3 py-2 text-right">${Math.round(parseFloat(d.valor_kilo_aplicado)).toLocaleString('es-CL')}</td>
                                                <td className="px-3 py-2 text-right font-semibold">${Math.round(parseFloat(d.subtotal)).toLocaleString('es-CL')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="text-right mt-4">
                                <span className="text-xl font-bold">TOTAL: ${Math.round(parseFloat(transaccionModal.total_pagar)).toLocaleString('es-CL')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialTransacciones;