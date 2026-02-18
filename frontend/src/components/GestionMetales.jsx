import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Save, Plus, X, DollarSign } from 'lucide-react';

const GestionMetales = () => {
    const [metales, setMetales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Formulario para crear
    const [nuevoMetal, setNuevoMetal] = useState({ nombre: '', valor_por_kilo: '' });

    // Estado para edición en línea
    const [editForm, setEditForm] = useState({ nombre: '', valor_por_kilo: '' });
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
            setNuevoMetal({ nombre: '', valor_por_kilo: '' });
            fetchMetales();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al crear metal');
        }
    };

    const iniciarEdicion = (metal) => {
        setEditingId(metal.id);
        setEditForm({ nombre: metal.nombre, valor_por_kilo: metal.valor_por_kilo });
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setEditForm({ nombre: '', valor_por_kilo: '' });
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
        <div className="container-fluid p-4 bg-white rounded shadow-sm border">
            <h2 className="h3 mb-4 d-flex align-items-center gap-2"><DollarSign /> Gestión de Precios y Metales</h2>

            {/* Formulario de Creación */}
            <div className="mb-4 bg-light p-4 rounded border">
                <h3 className="h5 mb-3 d-flex align-items-center gap-2"><Plus size={20} /> Agregar Nuevo Metal</h3>
                <form onSubmit={handleCrear} className="row g-3 align-items-end">
                    <div className="col-md">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ej: Cobre"
                            value={nuevoMetal.nombre}
                            onChange={e => setNuevoMetal({ ...nuevoMetal, nombre: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md">
                        <label className="form-label">Precio por Kilo</label>
                        <input
                            type="number"
                            step="1"
                            className="form-control"
                            placeholder="0"
                            value={nuevoMetal.valor_por_kilo}
                            onChange={e => setNuevoMetal({ ...nuevoMetal, valor_por_kilo: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-auto">
                        <button type="submit" className="btn btn-success">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabla de Metales */}
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Metal</th>
                            <th className="p-3">Precio / Kilo</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metales.map(metal => (
                            <tr key={metal.id}>
                                <td className="p-3 text-muted">#{metal.id}</td>

                                {editingId === metal.id ? (
                                    <>
                                        <td className="p-3">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editForm.nombre}
                                                onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                step="1"
                                                className="form-control form-control-sm"
                                                value={editForm.valor_por_kilo}
                                                onChange={e => setEditForm({ ...editForm, valor_por_kilo: e.target.value })}
                                            />
                                        </td>
                                        <td className="p-3 d-flex gap-2">
                                            <button onClick={() => guardarEdicion(metal.id)} className="btn btn-sm btn-outline-success" title="Guardar">
                                                <Save size={18} />
                                            </button>
                                            <button onClick={cancelarEdicion} className="btn btn-sm btn-outline-danger" title="Cancelar">
                                                <X size={18} />
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-3 fw-medium">{metal.nombre}</td>
                                        <td className="p-3 fw-bold text-primary">${Math.round(metal.valor_por_kilo)}</td>
                                        <td className="p-3">
                                            <button onClick={() => iniciarEdicion(metal)} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
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