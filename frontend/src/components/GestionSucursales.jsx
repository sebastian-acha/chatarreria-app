import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, Plus, Save, Edit2, X } from 'lucide-react';

const GestionSucursales = () => {
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ nombre: '', direccion: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ nombre: '', direccion: '' });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const fetchSucursales = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/sucursales`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSucursales(res.data);
        } catch (error) {
            console.error(error);
            alert('Error al cargar sucursales');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSucursales();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/sucursales`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForm({ nombre: '', direccion: '' });
            fetchSucursales();
            alert('Sucursal creada');
        } catch (error) {
            alert(error.response?.data?.error || 'Error al crear');
        }
    };

    const startEdit = (sucursal) => {
        setEditingId(sucursal.id);
        setEditForm({ nombre: sucursal.nombre, direccion: sucursal.direccion });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ nombre: '', direccion: '' });
    };

    const handleUpdate = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/sucursales/${id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingId(null);
            fetchSucursales();
        } catch (error) {
            alert('Error al actualizar');
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Building /> Gestión de Sucursales</h2>

            {/* Formulario Crear */}
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus /> Nueva Sucursal</h3>
                <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <input 
                            placeholder="Nombre Sucursal" 
                            className="border p-2 rounded w-full"
                            value={form.nombre}
                            onChange={e => setForm({...form, nombre: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex-[2] min-w-[300px]">
                        <input 
                            placeholder="Dirección" 
                            className="border p-2 rounded w-full"
                            value={form.direccion}
                            onChange={e => setForm({...form, direccion: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                        <Save size={18} /> Guardar
                    </button>
                </form>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Dirección</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sucursales.map(s => (
                            <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-gray-500">#{s.id}</td>
                                {editingId === s.id ? (
                                    <>
                                        <td className="p-3"><input className="border p-1 rounded w-full" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} /></td>
                                        <td className="p-3"><input className="border p-1 rounded w-full" value={editForm.direccion} onChange={e => setEditForm({...editForm, direccion: e.target.value})} /></td>
                                        <td className="p-3 flex gap-2">
                                            <button onClick={() => handleUpdate(s.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={18}/></button>
                                            <button onClick={cancelEdit} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={18}/></button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-3 font-medium">{s.nombre}</td>
                                        <td className="p-3">{s.direccion}</td>
                                        <td className="p-3">
                                            <button onClick={() => startEdit(s)} className="text-blue-600 hover:bg-blue-50 p-1 rounded flex gap-1 items-center"><Edit2 size={16}/> Editar</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionSucursales;