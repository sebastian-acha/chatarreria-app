import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Calculator, Printer, CheckCircle, AlertCircle, PlusCircle, XCircle } from 'lucide-react';

const NuevaCompra = () => {
    const [metales, setMetales] = useState([]);
    const [cliente, setCliente] = useState({ cliente_nombre: '', cliente_rut_dni: '' });
    const [detalles, setDetalles] = useState([{ metal_id: '', peso_kilos: '' }]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ type: '', text: '' });
    const [voucher, setVoucher] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const fetchMetales = async () => {
            try {
                const res = await axios.get(`${API_URL}/metales`);
                setMetales(res.data);
            } catch (error) {
                console.error("Error cargando metales", error);
                setMensaje({ type: 'error', text: 'No se pudo cargar la lista de metales.' });
            }
        };
        fetchMetales();
    }, [API_URL]);

    const handleClienteChange = (e) => {
        setCliente({ ...cliente, [e.target.name]: e.target.value });
        if (voucher) setVoucher(null);
    };
    
    const handleDetalleChange = (index, e) => {
        const nuevosDetalles = [...detalles];
        nuevosDetalles[index][e.target.name] = e.target.value;
        setDetalles(nuevosDetalles);
        if (voucher) setVoucher(null);
    };

    const agregarDetalle = () => {
        setDetalles([...detalles, { metal_id: '', peso_kilos: '' }]);
    };

    const quitarDetalle = (index) => {
        const nuevosDetalles = detalles.filter((_, i) => i !== index);
        setDetalles(nuevosDetalles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ type: '', text: '' });
        setVoucher(null);

        // Validar que los detalles no estén vacíos
        const metalesParaEnviar = detalles.filter(d => d.metal_id && d.peso_kilos > 0);
        if (metalesParaEnviar.length === 0) {
            setMensaje({ type: 'error', text: 'Debe agregar al menos un metal con peso válido.' });
            setLoading(false);
            return;
        }

        const payload = {
            ...cliente,
            metales: metalesParaEnviar
        };

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/transacciones`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMensaje({ type: 'success', text: 'Compra registrada con éxito' });
            setVoucher(res.data.voucher);
            
            // Limpiar formulario
            setCliente({ cliente_nombre: '', cliente_rut_dni: '' });
            setDetalles([{ metal_id: '', peso_kilos: '' }]);

        } catch (error) {
            setMensaje({ type: 'error', text: error.response?.data?.error || 'Error al registrar compra' });
        } finally {
            setLoading(false);
        }
    };

    const getTotalEstimado = () => {
        return Math.round(detalles.reduce((total, detalle) => {
            if (!detalle.metal_id || !detalle.peso_kilos) return total;
            const metal = metales.find(m => m.id === parseInt(detalle.metal_id));
            const subtotal = metal ? metal.valor_por_kilo * parseFloat(detalle.peso_kilos) : 0;
            return total + subtotal;
        }, 0));
    };

    const imprimirVoucher = () => {
        if (!voucher) return;
        const detallesHTML = voucher.detalles.map(d => `
            <div style="margin-top: 10px;">
                <p>Metal: ${d.metal}</p>
                <p>Peso: ${d.peso_kilos} kg</p>
                <p>Precio/kg: $${Math.round(d.precio_unitario)}</p>
                <p>Subtotal: $${Math.round(d.subtotal)}</p>
            </div>
        `).join('<hr style="border-style: dashed;"/>');

        const logoHTML = voucher.logo_url ? `<img src="${voucher.logo_url}" alt="Logo" style="max-width: 150px; margin: 0 auto 20px auto; display: block;">` : '';

        const ventana = window.open('', 'PRINT', 'height=600,width=400');
        ventana.document.write(`
            <html>
                <head><title>Voucher #${voucher.correlativo}</title></head>
                <body style="font-family: monospace; text-align: center; padding: 20px;">
                    ${logoHTML}
                    <h2>CHATARRERÍA</h2>
                    <p>Fecha: ${new Date(voucher.fecha).toLocaleString()}</p>
                    <p>Voucher N°: <strong>${voucher.correlativo}</strong></p>
                    <hr/>
                    <div style="text-align: left;">
                        <p>Cliente: ${voucher.cliente.nombre}</p>
                        <p>RUT/DNI: ${voucher.cliente.rut || '-'}</p>
                    </div>
                    <hr/>
                    ${detallesHTML}
                    <hr/>
                    <h3>TOTAL: $${Math.round(voucher.total_pagado)}</h3>
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
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calculator className="text-blue-600" /> Nueva Compra
            </h2>

            {mensaje.text && (
                <div className={`p-4 mb-4 rounded flex items-center gap-2 ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {mensaje.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {mensaje.text}
                </div>
            )}

            {voucher && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6 text-center">
                    <h3 className="font-bold text-lg text-blue-800">¡Transacción #{voucher.correlativo} completada!</h3>
                    <p className="text-sm text-blue-600 mb-3">Total a pagar: <strong>$${Math.round(voucher.total_pagado)}</strong></p>
                    <button onClick={imprimirVoucher} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 mx-auto">
                        <Printer size={20} /> Imprimir Voucher
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Datos del Cliente */}
                <fieldset className="border p-4 rounded mb-6">
                    <legend className="text-lg font-semibold px-2">Datos del Cliente</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre Cliente</label>
                            <input type="text" name="cliente_nombre" value={cliente.cliente_nombre} onChange={handleClienteChange} className="w-full border p-2 rounded" placeholder="Juan Pérez" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">RUT / DNI</label>
                            <input type="text" name="cliente_rut_dni" value={cliente.cliente_rut_dni} onChange={handleClienteChange} className="w-full border p-2 rounded" placeholder="12345678-9" />
                        </div>
                    </div>
                </fieldset>

                {/* Detalles de Metales */}
                <fieldset className="border p-4 rounded mb-6">
                    <legend className="text-lg font-semibold px-2">Metales a Vender</legend>
                    {detalles.map((detalle, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center mb-3 p-2 border-b">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Metal</label>
                                <select name="metal_id" value={detalle.metal_id} onChange={(e) => handleDetalleChange(index, e)} className="w-full border p-2 rounded" required>
                                    <option value="">Seleccione...</option>
                                    {metales.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre} (${Math.round(m.valor_por_kilo)}/kg)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Peso (kilos)</label>
                                <input type="number" step="0.01" name="peso_kilos" value={detalle.peso_kilos} onChange={(e) => handleDetalleChange(index, e)} className="w-full border p-2 rounded" placeholder="0.00" required />
                            </div>
                            <div className="md:col-span-1 flex items-end justify-center">
                                {detalles.length > 1 && (
                                    <button type="button" onClick={() => quitarDetalle(index)} className="p-2 text-red-500 hover:text-red-700">
                                        <XCircle size={24} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={agregarDetalle} className="mt-2 text-blue-600 hover:text-blue-800 flex items-center gap-2">
                        <PlusCircle size={20} /> Añadir otro metal
                    </button>
                </fieldset>
                
                {/* Total y Submit */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded mb-6">
                    <span className="font-semibold text-gray-600">Total Estimado:</span>
                    <span className="text-2xl font-bold text-green-600">${getTotalEstimado()}</span>
                </div>

                <button type="submit" disabled={loading} className={`w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 flex justify-center items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                    {loading ? 'Procesando...' : <><Save size={20} /> Registrar Compra</>}
                </button>
            </form>
        </div>
    );
};

export default NuevaCompra;