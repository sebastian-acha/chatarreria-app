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
        <div className="container-fluid p-4 bg-white rounded shadow-sm border">
            <h2 className="h3 mb-4 d-flex align-items-center gap-2"><Building /> Gestión de Sucursales</h2>

            {/* Formulario Crear */}
            <div className="mb-4 bg-light p-4 rounded border">
                <h3 className="h5 mb-3 d-flex align-items-center gap-2"><Plus /> Nueva Sucursal</h3>
                <form onSubmit={handleCreate} className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <input
                            placeholder="Nombre Sucursal"
                            className="form-control"
                            value={form.nombre}
                            onChange={e => setForm({ ...form, nombre: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <input
                            placeholder="Dirección"
                            className="form-control"
                            value={form.direccion}
                            onChange={e => setForm({ ...form, direccion: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-2">
                        <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
                            <Save size={18} /> Guardar
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabla */}
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-light">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Dirección</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sucursales.map(s => (
                            <tr key={s.id}>
                                <td className="p-3 text-muted">#{s.id}</td>
                                {editingId === s.id ? (
                                    <>
                                        <td className="p-3"><input className="form-control form-control-sm" value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} /></td>
                                        <td className="p-3"><input className="form-control form-control-sm" value={editForm.direccion} onChange={e => setEditForm({ ...editForm, direccion: e.target.value })} /></td>
                                        <td className="p-3 d-flex gap-2">
                                            <button onClick={() => handleUpdate(s.id)} className="btn btn-sm btn-outline-success"><Save size={18} /></button>
                                            <button onClick={cancelEdit} className="btn btn-sm btn-outline-danger"><X size={18} /></button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-3 fw-medium">{s.nombre}</td>
                                        <td className="p-3">{s.direccion}</td>
                                        <td className="p-3">
                                            <button onClick={() => startEdit(s)} className="btn btn-sm btn-outline-primary d-flex gap-1 align-items-center"><Edit2 size={16} /> Editar</button>
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