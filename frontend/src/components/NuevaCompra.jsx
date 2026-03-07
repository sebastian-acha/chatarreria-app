import React, { useState, useEffect, useContext, useRef } from 'react';
import apiClient from '../api/axios';
import { Save, Calculator, Printer, CheckCircle, AlertCircle, PlusCircle, XCircle } from 'lucide-react';
import Footer from './Footer';
import { ConfiguracionContext } from '../context/ConfiguracionContext';

const NuevaCompra = () => {
    const [metalesPorFamilia, setMetalesPorFamilia] = useState([]);
    const [metalesSinFamilia, setMetalesSinFamilia] = useState([]);
    const [cliente, setCliente] = useState({ cliente_nombre: '', cliente_rut_dni: '' });
    const [detalles, setDetalles] = useState([{ metal_id: '', peso_kilos: '', precio_especial: '' }]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ type: '', text: '' });
    const [voucher, setVoucher] = useState(null);
    const { configuracion } = useContext(ConfiguracionContext);
    const [showModal, setShowModal] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        if (showModal) {
            modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [showModal]);

    useEffect(() => {
        const fetchMetales = async () => {
            try {
                const res = await apiClient.get(`/metales`);
                setMetalesPorFamilia(res.data.familias || []);
                setMetalesSinFamilia(res.data.sinFamilia || []);
            } catch (error) {
                console.error("Error cargando metales", error);
                setMensaje({ type: 'error', text: 'No se pudo cargar la lista de metales.' });
            }
        };
        fetchMetales();
    }, []);

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
        setShowModal(false);

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
            const res = await apiClient.post(`/transacciones`, payload);

            setMensaje({ type: 'success', text: 'Compra registrada con éxito' });
            setVoucher(res.data.voucher);
            setShowModal(true);

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

            const metalId = parseInt(detalle.metal_id);
            let metal = null;

            for (const familia of metalesPorFamilia) {
                metal = familia.metales.find(m => m.id === metalId);
                if (metal) break;
            }

            if (!metal) {
                metal = metalesSinFamilia.find(m => m.id === metalId);
            }

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
                ? `<span class="texto-tachado">$${Math.round(d.precio_oficial).toLocaleString('es-CL')}</span><br/>Precio Especial: <b>$${Math.round(d.precio_unitario).toLocaleString('es-CL')}</b>`
                : `<b>$${Math.round(d.precio_unitario).toLocaleString('es-CL')}</b>`;

            return `
            <tr>
              <td>
                <table class="font11"> 
                  <tr> 
                    <td>
                      <b>${d.peso_kilos} kg </b>| ${d.metal}
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

    const closeModal = () => {
        setShowModal(false);
        setVoucher(null);
        setMensaje({ type: '', text: '' });
    };

    return (
        <>
            <div className="container my-4">
                {showModal && voucher && (
                    <div ref={modalRef} className="modal-custom-backdrop" style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', zIndex: 1050
                    }}>
                        <div className="modal-custom-content card shadow-lg" style={{ width: '90%', maxWidth: '500px' }}>
                            <div className="modal-custom-header card-header d-flex justify-content-between align-items-center">
                                <h5 className="modal-custom-title mb-0 d-flex align-items-center gap-2">
                                    <CheckCircle className="text-success" />
                                    {mensaje.text}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-custom-body card-body text-center">
                                <h3 className="h5 fw-bold text-primary">¡Transacción #{voucher.correlativo} completada!</h3>
                                <p className="mb-3">Total a pagar: <strong>$${Math.round(voucher.total_pagado).toLocaleString('es-CL')}</strong></p>
                                <button onClick={imprimirVoucher} className="btn btn-primary d-inline-flex align-items-center gap-2">
                                    <Printer size={20} /> Imprimir Voucher
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <h2 className="card-title mb-4 d-flex align-items-center gap-2">
                            <Calculator className="text-primary" /> Nueva Compra
                        </h2>

                        {mensaje.text && mensaje.type === 'error' && (
                            <div className={`alert alert-danger d-flex align-items-center gap-2`}>
                                <AlertCircle size={20} />
                                {mensaje.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
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

                            <fieldset className="border p-3 rounded mb-4">
                                <legend className="float-none w-auto px-2 h5 fw-bold">Metales a Vender</legend>
                                {detalles.map((detalle, index) => (
                                    <div key={index} className="row g-3 align-items-end mb-3 pb-3 border-bottom">
                                        <div className="col-md-4">
                                            <label className="form-label">Metal</label>
                                            <select name="metal_id" value={detalle.metal_id} onChange={(e) => handleDetalleChange(index, e)} className="form-select" required>
                                                <option value="">Seleccione...</option>
                                                {metalesPorFamilia.map(familia => (
                                                    <optgroup key={familia.familia_id} label={familia.familia_nombre}>
                                                        {familia.metales.map(m => (
                                                            <option key={m.id} value={m.id}>
                                                                {m.nombre} (${Math.round(m.valor_por_kilo).toLocaleString('es-CL')}/kg)
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                                {metalesSinFamilia.length > 0 && (
                                                    <optgroup label="Otros">
                                                        {metalesSinFamilia.map(m => (
                                                            <option key={m.id} value={m.id}>
                                                                {m.nombre} (${Math.round(m.valor_por_kilo).toLocaleString('es-CL')}/kg)
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
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