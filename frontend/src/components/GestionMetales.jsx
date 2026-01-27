import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Save, Plus, X, DollarSign } from 'lucide-react';

const GestionMetales = () => {
    const [metales, setMetales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    
    // Formulario para crear
    const [nuevoMetal, setNuevoMetal] = useState({ nombre: '', valor_por_gramo: '' });
    
    // Estado para edición en línea
    const [editForm, setEditForm] = useState({ nombre: '', valor_por_gramo: '' });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const fetchMetales = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/metales`);
            setMetales(res.data);
        } catch (err) {
            setError('Error al cargar metales');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetales();
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/metales`, nuevoMetal, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNuevoMetal({ nombre: '', valor_por_gramo: '' });
            fetchMetales();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al crear metal');
        }
    };

    const iniciarEdicion = (metal) => {
        setEditingId(metal.id);
        setEditForm({ nombre: metal.nombre, valor_por_gramo: metal.valor_por_gramo });
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setEditForm({ nombre: '', valor_por_gramo: '' });
    };

    const guardarEdicion = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/metales/${id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingId(null);
            fetchMetales();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al actualizar');
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><DollarSign /> Gestión de Precios y Metales</h2>

            {/* Formulario de Creación */}
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Plus size={20}/> Agregar Nuevo Metal</h3>
                <form onSubmit={handleCrear} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input 
                            type="text" 
                            className="border p-2 rounded w-full" 
                            placeholder="Ej: Cobre"
                            value={nuevoMetal.nombre}
                            onChange={e => setNuevoMetal({...nuevoMetal, nombre: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium mb-1">Precio por Gramo</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            className="border p-2 rounded w-full" 
                            placeholder="0.00"
                            value={nuevoMetal.valor_por_gramo}
                            onChange={e => setNuevoMetal({...nuevoMetal, valor_por_gramo: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 h-[42px]">
                        Guardar
                    </button>
                </form>
            </div>

            {/* Tabla de Metales */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-3">ID</th>
                            <th className="p-3">Metal</th>
                            <th className="p-3">Precio / Gramo</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metales.map(metal => (
                            <tr key={metal.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-gray-500">#{metal.id}</td>
                                
                                {editingId === metal.id ? (
                                    <>
                                        <td className="p-3">
                                            <input 
                                                type="text" 
                                                className="border p-1 rounded w-full"
                                                value={editForm.nombre}
                                                onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                className="border p-1 rounded w-full"
                                                value={editForm.valor_por_gramo}
                                                onChange={e => setEditForm({...editForm, valor_por_gramo: e.target.value})}
                                            />
                                        </td>
                                        <td className="p-3 flex gap-2">
                                            <button onClick={() => guardarEdicion(metal.id)} className="text-green-600 hover:bg-green-50 p-1 rounded" title="Guardar">
                                                <Save size={18} />
                                            </button>
                                            <button onClick={cancelarEdicion} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Cancelar">
                                                <X size={18} />
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-3 font-medium">{metal.nombre}</td>
                                        <td className="p-3 font-bold text-blue-600">${metal.valor_por_gramo}</td>
                                        <td className="p-3">
                                            <button onClick={() => iniciarEdicion(metal)} className="text-blue-600 hover:bg-blue-50 p-1 rounded flex items-center gap-1">
                                                <Edit2 size={16} /> Editar
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {loading && <p className="text-center mt-4">Cargando...</p>}
        </div>
    );
};

export default GestionMetales;