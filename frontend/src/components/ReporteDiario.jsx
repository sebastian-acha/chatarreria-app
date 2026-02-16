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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart3 /> Reporte Diario ({new Date().toLocaleDateString()})</h2>
                <button onClick={handleExportarExcel} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"><Download size={18} /> Exportar Excel</button>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase">Total Comprado Hoy</p>
                            <h3 className="text-3xl font-bold text-gray-900">{resumen.totalKilos.toFixed(2)} kg</h3>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                            <Scale size={32} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase">Total Pagado Hoy</p>
                            <h3 className="text-3xl font-bold text-gray-900">${resumen.totalDinero.toLocaleString()}</h3>
                        </div>
                        <div className="p-4 bg-green-50 rounded-full text-green-600">
                            <DollarSign size={32} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de Barras (CSS Puro) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h3 className="font-semibold mb-6 flex items-center gap-2 text-gray-700">
                    <BarChart3 size={18}/> Volumen de Compra por Metal (Kg)
                </h3>
                
                <div className="h-64 flex items-end justify-around gap-2 sm:gap-4 border-b border-gray-200 pb-2">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Cargando gráfico...</div>
                    ) : datos.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Sin datos para graficar</div>
                    ) : (
                        datos.map((item, index) => {
                            const kilos = parseFloat(item.total_kilos || 0);
                            const porcentaje = (kilos / maxKilos) * 100;
                            
                            return (
                                <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group">
                                    <div className="w-full max-w-[60px] bg-gray-50 rounded-t-md relative h-full flex items-end overflow-hidden">
                                        <div 
                                            className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-500 rounded-t-md relative"
                                            style={{ height: `${Math.max(porcentaje, 1)}%` }}
                                        >
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                                {kilos.toFixed(2)} kg
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3 font-medium truncate w-full text-center" title={item.metal}>
                                        {item.metal}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Tabla Detallada */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold flex items-center gap-2"><TrendingUp size={18}/> Detalle por Metal</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
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
                            <tr><td colSpan="4" className="p-4 text-center text-gray-500">No hay movimientos hoy.</td></tr>
                        ) : (
                            datos.map((item, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{item.metal}</td>
                                    <td className="p-4">{item.cantidad_transacciones}</td>
                                    <td className="p-4 font-bold text-blue-600">{parseFloat(item.total_kilos || 0).toFixed(2)} kg</td>
                                    <td className="p-4 font-bold text-green-600">${parseFloat(item.total_pagado).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReporteDiario;