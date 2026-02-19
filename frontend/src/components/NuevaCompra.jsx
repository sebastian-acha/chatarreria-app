import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Calculator, Printer, CheckCircle, AlertCircle, PlusCircle, XCircle } from 'lucide-react';
import Footer from './Footer';

const NuevaCompra = () => {
    const [metales, setMetales] = useState([]);
    const [cliente, setCliente] = useState({ cliente_nombre: '', cliente_rut_dni: '' });
    const [detalles, setDetalles] = useState([{ metal_id: '', peso_kilos: '', precio_especial: '' }]);
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
        setDetalles([...detalles, { metal_id: '', peso_kilos: '', precio_especial: '' }]);
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
            setDetalles([{ metal_id: '', peso_kilos: '', precio_especial: '' }]);

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

            // Usar precio especial si existe, sino el del metal
            const precio = (detalle.precio_especial && parseFloat(detalle.precio_especial) > 0)
                ? parseFloat(detalle.precio_especial)
                : (metal ? metal.valor_por_kilo : 0);

            const subtotal = precio * parseFloat(detalle.peso_kilos);
            return total + subtotal;
        }, 0));
    };

    const imprimirVoucher = () => {
        if (!voucher) return;
        const detallesHTML = voucher.detalles.map(d => {
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
                    <h3>TOTAL: $${Math.round(voucher.total_pagado).toLocaleString('es-CL')}</h3>
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
        <>
            <div className="container my-4">
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <h2 className="card-title mb-4 d-flex align-items-center gap-2">
                            <Calculator className="text-primary" /> Nueva Compra
                        </h2>

                        {mensaje.text && (
                            <div className={`alert ${mensaje.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center gap-2`}>
                                {mensaje.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {mensaje.text}
                            </div>
                        )}

                        {voucher && (
                            <div className="alert alert-info text-center mb-4">
                                <h3 className="h5 fw-bold text-primary">¡Transacción #{voucher.correlativo} completada!</h3>
                                <p className="mb-3">Total a pagar: <strong>$${Math.round(voucher.total_pagado).toLocaleString('es-CL')}</strong></p>
                                <button onClick={imprimirVoucher} className="btn btn-primary d-inline-flex align-items-center gap-2">
                                    <Printer size={20} /> Imprimir Voucher
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Datos del Cliente */}
                            <fieldset className="border p-3 rounded mb-4">
                                <legend className="float-none w-auto px-2 h5 fw-bold">Datos del Cliente</legend>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Nombre Cliente</label>
                                        <input type="text" name="cliente_nombre" value={cliente.cliente_nombre} onChange={handleClienteChange} className="form-control" placeholder="Juan Pérez" required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">RUT / DNI</label>
                                        <input type="text" name="cliente_rut_dni" value={cliente.cliente_rut_dni} onChange={handleClienteChange} className="form-control" placeholder="12345678-9" />
                                    </div>
                                </div>
                            </fieldset>

                            {/* Detalles de Metales */}
                            <fieldset className="border p-3 rounded mb-4">
                                <legend className="float-none w-auto px-2 h5 fw-bold">Metales a Vender</legend>
                                {detalles.map((detalle, index) => (
                                    <div key={index} className="row g-3 align-items-end mb-3 pb-3 border-bottom">
                                        <div className="col-md-4">
                                            <label className="form-label">Metal</label>
                                            <select name="metal_id" value={detalle.metal_id} onChange={(e) => handleDetalleChange(index, e)} className="form-select" required>
                                                <option value="">Seleccione...</option>
                                                {metales.map(m => (
                                                    <option key={m.id} value={m.id}>{m.nombre} (${Math.round(m.valor_por_kilo).toLocaleString('es-CL')}/kg)</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label text-primary fw-bold">Precio Especial</label>
                                            <input type="number" name="precio_especial" value={detalle.precio_especial} onChange={(e) => handleDetalleChange(index, e)} className="form-control border-primary" placeholder="Opcional" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Peso (kilos)</label>
                                            <input type="number" step="0.01" name="peso_kilos" value={detalle.peso_kilos} onChange={(e) => handleDetalleChange(index, e)} className="form-control" placeholder="0.00" required />
                                        </div>
                                        <div className="col-md-2 text-end">
                                            {detalles.length > 1 && (
                                                <button type="button" onClick={() => quitarDetalle(index)} className="btn btn-outline-danger border-0">
                                                    <XCircle size={24} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={agregarDetalle} className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-0 mt-2">
                                    <PlusCircle size={20} /> Añadir otro metal
                                </button>
                            </fieldset>

                            {/* Total y Submit */}
                            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded mb-4">
                                <span className="fw-bold text-secondary">Total Estimado:</span>
                                <span className="h4 mb-0 fw-bold text-success">${getTotalEstimado().toLocaleString('es-CL')}</span>
                            </div>

                            <button type="submit" disabled={loading} className="btn btn-success w-100 py-3 fw-bold d-flex justify-content-center align-items-center gap-2">
                                {loading ? 'Procesando...' : <><Save size={20} /> Registrar Compra</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default NuevaCompra;