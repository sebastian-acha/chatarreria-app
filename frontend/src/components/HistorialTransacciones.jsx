import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Printer, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const HistorialTransacciones = () => {
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estado de Paginación
    const [paginacion, setPaginacion] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Estado de Filtros
    const [filtros, setFiltros] = useState({
        fecha_inicio: '',
        fecha_fin: '',
        metal_id: ''
    });

    // Estado de Ordenamiento
    const [orden, setOrden] = useState({
        sort: 'id',
        order: 'DESC'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // Función para cargar datos
    const fetchTransacciones = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No se encontró token de autenticación');
                setLoading(false);
                return;
            }

            // Preparamos los parámetros, eliminando los vacíos
            const params = {
                page: paginacion.page,
                limit: paginacion.limit,
                sort: orden.sort,
                order: orden.order,
                ...filtros
            };
            
            // Limpiar filtros vacíos
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });

            const response = await axios.get(`${API_URL}/transacciones`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            setTransacciones(response.data.data);
            setPaginacion(prev => ({
                ...prev,
                ...response.data.pagination
            }));

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar datos al cambiar página, límite u orden
    useEffect(() => {
        fetchTransacciones();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginacion.page, paginacion.limit, orden]);

    // Manejadores de eventos
    const handleSort = (campo) => {
        setOrden(prev => ({
            sort: campo,
            order: prev.sort === campo && prev.order === 'ASC' ? 'DESC' : 'ASC'
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPaginacion(prev => ({ ...prev, page: 1 })); // Volver a la primera página al filtrar
        fetchTransacciones();
    };

    const handleLimitChange = (e) => {
        setPaginacion(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }));
    };

    // Función para reimprimir voucher
    const imprimirVoucher = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/transacciones/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data;

            // Abrir ventana de impresión
            const ventana = window.open('', 'PRINT', 'height=600,width=400');
            ventana.document.write(`
                <html>
                    <head><title>Voucher #${data.id}</title></head>
                    <body style="font-family: monospace; text-align: center; padding: 20px;">
                        <h2>CHATARRERÍA</h2>
                        <p>Sucursal: ${data.sucursal_nombre || 'Central'}</p>
                        <p>Fecha: ${new Date(data.fecha_hora).toLocaleString()}</p>
                        <p>Voucher N°: <strong>${data.id}</strong></p>
                        <hr/>
                        <div style="text-align: left;">
                            <p>Cliente: ${data.cliente_nombre}</p>
                            <p>RUT/DNI: ${data.cliente_rut_dni || '-'}</p>
                            <p>Metal: ${data.metal_nombre}</p>
                            <p>Peso: ${data.peso_gramos} g</p>
                            <p>Precio/g: $${data.valor_gramo_aplicado}</p>
                        </div>
                        <hr/>
                        <h3>TOTAL: $${data.total_pagar}</h3>
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
            
            {/* Filtros */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium">Fecha Inicio</label>
                    <input type="date" className="border p-2 rounded" value={filtros.fecha_inicio} onChange={e => setFiltros({...filtros, fecha_inicio: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Fecha Fin</label>
                    <input type="date" className="border p-2 rounded" value={filtros.fecha_fin} onChange={e => setFiltros({...filtros, fecha_fin: e.target.value})} />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Search size={18} /> Filtrar
                </button>
            </form>

            {/* Controles de Tabla */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <span className="mr-2">Mostrar</span>
                    <select value={paginacion.limit} onChange={handleLimitChange} className="border p-1 rounded">
                        <option value={20}>20</option>
                        <option value={40}>40</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="ml-2">registros</span>
                </div>
                <div><strong>Total:</strong> {paginacion.total} transacciones</div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto bg-white shadow-sm rounded-xl border border-gray-200">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-800 text-white uppercase">
                        <tr>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('id')}><div className="flex items-center gap-1">ID <ArrowUpDown size={14}/></div></th>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('fecha_hora')}><div className="flex items-center gap-1">Fecha <ArrowUpDown size={14}/></div></th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('metal_nombre')}><div className="flex items-center gap-1">Metal <ArrowUpDown size={14}/></div></th>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('peso_gramos')}><div className="flex items-center gap-1">Peso <ArrowUpDown size={14}/></div></th>
                            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('total_pagar')}><div className="flex items-center gap-1">Total <ArrowUpDown size={14}/></div></th>
                            <th className="px-4 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="7" className="text-center py-4">Cargando...</td></tr>) : transacciones.length === 0 ? (<tr><td colSpan="7" className="text-center py-4">No se encontraron registros</td></tr>) : (
                            transacciones.map((t) => (
                                <tr key={t.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{t.id}</td>
                                    <td className="px-4 py-2">{new Date(t.fecha_hora).toLocaleString()}</td>
                                    <td className="px-4 py-2"><div className="font-medium">{t.cliente_nombre}</div><div className="text-xs text-gray-500">{t.cliente_rut_dni}</div></td>
                                    <td className="px-4 py-2">{t.metal_nombre}</td>
                                    <td className="px-4 py-2">{t.peso_gramos} g</td>
                                    <td className="px-4 py-2 font-bold text-green-700">${t.total_pagar}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => imprimirVoucher(t.id)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 border border-blue-600 px-2 py-1 rounded text-xs">
                                            <Printer size={14} /> Voucher
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-center items-center gap-4 mt-4">
                <button disabled={paginacion.page === 1} onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page - 1 }))} className="p-2 border rounded disabled:opacity-50 hover:bg-gray-100"><ChevronLeft size={20} /></button>
                <span>Página {paginacion.page} de {paginacion.totalPages || 1}</span>
                <button disabled={paginacion.page >= paginacion.totalPages} onClick={() => setPaginacion(prev => ({ ...prev, page: prev.page + 1 }))} className="p-2 border rounded disabled:opacity-50 hover:bg-gray-100"><ChevronRight size={20} /></button>
            </div>
            {error && <div className="text-red-500 text-center mt-2">{error}</div>}
        </div>
    );
};

export default HistorialTransacciones;