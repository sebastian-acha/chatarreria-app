import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, DollarSign, Scale, Download } from 'lucide-react';

const ReporteDiario = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resumen, setResumen] = useState({ totalKilos: 0, totalDinero: 0 });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const fetchReporte = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/transacciones/reporte-diario`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDatos(res.data);

                // Calcular totales generales
                const totalK = res.data.reduce((acc, curr) => acc + parseFloat(curr.total_kilos || 0), 0);
                const totalD = res.data.reduce((acc, curr) => acc + parseFloat(curr.total_pagado), 0);
                setResumen({ totalKilos: totalK, totalDinero: totalD });

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReporte();
    }, []);

    const handleExportarExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/transacciones/reporte-diario/excel`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', // Importante para recibir archivos binarios
            });

            // Crear un link temporal para descargar el archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Diario_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error al descargar Excel:", error);
            alert("No se pudo descargar el reporte.");
        }
    };

    // Calcular el valor máximo para escalar el gráfico
    const maxVal = datos.length > 0 ? Math.max(...datos.map(d => parseFloat(d.total_kilos || 0))) : 0;
    // Evitar división por cero si no hay datos o todo es 0
    const maxKilos = maxVal === 0 ? 1 : maxVal;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h3 fw-bold d-flex align-items-center gap-2"><BarChart3 /> Reporte Diario ({new Date().toLocaleDateString()})</h2>
                <button onClick={handleExportarExcel} className="btn btn-success d-flex align-items-center gap-2"><Download size={18} /> Exportar Excel</button>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <p className="text-muted small fw-bold text-uppercase mb-1">Total Comprado Hoy</p>
                                <h3 className="h2 fw-bold text-dark mb-0">{resumen.totalKilos.toFixed(2)} kg</h3>
                            </div>
                            <div className="p-3 bg-primary-subtle rounded-circle text-primary">
                                <Scale size={32} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <p className="text-muted small fw-bold text-uppercase mb-1">Total Pagado Hoy</p>
                                <h3 className="h2 fw-bold text-dark mb-0">$ {Math.round(resumen.totalDinero).toLocaleString('es-CL')}</h3>
                            </div>
                            <div className="p-3 bg-success-subtle rounded-circle text-success">
                                <DollarSign size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de Barras (CSS Puro) */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h3 className="h5 fw-semibold mb-4 d-flex align-items-center gap-2 text-secondary">
                        <BarChart3 size={18} /> Volumen de Compra por Metal (Kg)
                    </h3>

                    <div className="d-flex align-items-end justify-content-around gap-2 border-bottom pb-2" style={{ height: '250px' }}>
                        {loading ? (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">Cargando gráfico...</div>
                        ) : datos.length === 0 ? (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">Sin datos para graficar</div>
                        ) : (
                            datos.map((item, index) => {
                                const kilos = parseFloat(item.total_kilos || 0);
                                const porcentaje = (kilos / maxKilos) * 100;

                                return (
                                    <div key={index} className="d-flex flex-column align-items-center flex-fill h-100 justify-content-end position-relative" style={{ maxWidth: '60px' }}>
                                        <div className="w-100 bg-light rounded-top position-relative h-100 d-flex align-items-end overflow-hidden">
                                            <div
                                                className="w-100 bg-primary rounded-top position-relative"
                                                style={{ height: `${Math.max(porcentaje, 1)}%` }}
                                                title={`${kilos.toFixed(2)} kg`}
                                            >
                                            </div>
                                        </div>
                                        <p className="small text-muted mt-2 fw-medium text-truncate w-100 text-center" title={item.metal}>
                                            {item.metal}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla Detallada */}
            <div className="card shadow-sm overflow-hidden">
                <div className="card-header bg-light">
                    <h3 className="h6 fw-semibold mb-0 d-flex align-items-center gap-2"><TrendingUp size={18} /> Detalle por Metal</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light text-uppercase small">
                            <tr>
                                <th className="p-4">Metal</th>
                                <th className="p-4">Transacciones</th>
                                <th className="p-4">Peso Total (kg)</th>
                                <th className="p-4">Total Pagado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="p-4 text-center">Cargando datos...</td></tr>
                            ) : datos.length === 0 ? (
                                <tr><td colSpan="4" className="p-4 text-center text-muted">No hay movimientos hoy.</td></tr>
                            ) : (
                                datos.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-4 fw-medium">{item.metal}</td>
                                        <td className="p-4">{item.cantidad_transacciones}</td>
                                        <td className="p-4 fw-bold text-primary">{parseFloat(item.total_kilos || 0).toFixed(2)} kg</td>
                                        <td className="p-4 fw-bold text-success">$ {Math.round(parseFloat(item.total_pagado)).toLocaleString('es-CL')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReporteDiario;