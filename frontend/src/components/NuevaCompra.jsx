import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Calculator, Printer, CheckCircle, AlertCircle } from 'lucide-react';

const NuevaCompra = () => {
    const [metales, setMetales] = useState([]);
    const [formData, setFormData] = useState({
        metal_id: '',
        peso_gramos: '',
        cliente_nombre: '',
        cliente_rut_dni: ''
    });
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ type: '', text: '' });
    const [voucher, setVoucher] = useState(null);

    // Cargar lista de metales al montar el componente
    useEffect(() => {
        const fetchMetales = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/metales');
                setMetales(res.data);
            } catch (error) {
                console.error("Error cargando metales", error);
                setMensaje({ type: 'error', text: 'No se pudo cargar la lista de metales.' });
            }
        };
        fetchMetales();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Limpiar voucher y mensajes si el usuario empieza a escribir una nueva compra
        if (voucher) {
            setVoucher(null);
            setMensaje({ type: '', text: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ type: '', text: '' });
        setVoucher(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:3000/api/transacciones', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMensaje({ type: 'success', text: 'Compra registrada con éxito' });
            setVoucher(res.data.voucher);
            
            // Limpiar formulario (opcional, depende del flujo de trabajo)
            setFormData({ metal_id: '', peso_gramos: '', cliente_nombre: '', cliente_rut_dni: '' });
        } catch (error) {
            setMensaje({ type: 'error', text: error.response?.data?.error || 'Error al registrar compra' });
        } finally {
            setLoading(false);
        }
    };

    // Calcular total estimado en vivo para mostrar al usuario
    const getTotalEstimado = () => {
        if (!formData.metal_id || !formData.peso_gramos) return 0;
        const metal = metales.find(m => m.id === parseInt(formData.metal_id));
        return metal ? (metal.valor_por_gramo * parseFloat(formData.peso_gramos)).toFixed(2) : 0;
    };

    const imprimirVoucher = () => {
        if (!voucher) return;
        const ventana = window.open('', 'PRINT', 'height=600,width=400');
        ventana.document.write(`
            <html>
                <head><title>Voucher #${voucher.correlativo}</title></head>
                <body style="font-family: monospace; text-align: center; padding: 20px;">
                    <h2>CHATARRERÍA</h2>
                    <p>Fecha: ${new Date(voucher.fecha).toLocaleString()}</p>
                    <p>Voucher N°: <strong>${voucher.correlativo}</strong></p>
                    <hr/>
                    <div style="text-align: left;">
                        <p>Cliente: ${voucher.cliente.nombre}</p>
                        <p>RUT/DNI: ${voucher.cliente.rut || '-'}</p>
                        <p>Metal: ${voucher.detalle.metal}</p>
                        <p>Peso: ${voucher.detalle.peso_gramos} g</p>
                        <p>Precio/g: $${voucher.detalle.precio_unitario}</p>
                    </div>
                    <hr/>
                    <h3>TOTAL: $${voucher.detalle.total}</h3>
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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calculator className="text-blue-600" /> Nueva Compra
            </h2>

            {mensaje.text && (
                <div className={`p-4 mb-4 rounded flex items-center gap-2 ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {mensaje.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {mensaje.text}
                </div>
            )}

            {/* Si hay voucher generado, mostramos opción de imprimir */}
            {voucher && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6 text-center">
                    <h3 className="font-bold text-lg text-blue-800">¡Transacción #{voucher.correlativo} completada!</h3>
                    <p className="text-sm text-blue-600 mb-3">Total a pagar: <strong>${voucher.detalle.total}</strong></p>
                    <button onClick={imprimirVoucher} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 mx-auto">
                        <Printer size={20} /> Imprimir Voucher
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Metal</label>
                        <select name="metal_id" value={formData.metal_id} onChange={handleChange} className="w-full border p-2 rounded" required>
                            <option value="">Seleccione un metal...</option>
                            {metales.map(m => (
                                <option key={m.id} value={m.id}>{m.nombre} (${m.valor_por_gramo}/g)</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Peso (gramos)</label>
                        <input type="number" step="0.01" name="peso_gramos" value={formData.peso_gramos} onChange={handleChange} className="w-full border p-2 rounded" placeholder="0.00" required />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre Cliente</label>
                        <input type="text" name="cliente_nombre" value={formData.cliente_nombre} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Juan Pérez" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">RUT / DNI</label>
                        <input type="text" name="cliente_rut_dni" value={formData.cliente_rut_dni} onChange={handleChange} className="w-full border p-2 rounded" placeholder="12345678-9" />
                    </div>
                </div>

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