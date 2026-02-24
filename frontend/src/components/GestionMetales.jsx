import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Save, Plus, X, DollarSign, Tag, Trash2, Box, PlusCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const GestionMetales = () => {
    const [metalesPorFamilia, setMetalesPorFamilia] = useState([]);
    const [metalesSinFamilia, setMetalesSinFamilia] = useState([]);
    const [familias, setFamilias] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ nombre: '', valor_por_kilo: '', familia_id: null });

    const [nuevoMetal, setNuevoMetal] = useState({ nombre: '', valor_por_kilo: '', familia_id: '' });
    const [nuevaFamilia, setNuevaFamilia] = useState({ nombre: '' });
    const [isCreatingFamilia, setIsCreatingFamilia] = useState(false);


    const fetchAllData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [resMetales, resFamilias] = await Promise.all([
                axios.get(`${API_URL}/metales`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/familias`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            setMetalesPorFamilia(resMetales.data.familias);
            setMetalesSinFamilia(resMetales.data.sinFamilia);
            setFamilias(resFamilias.data);

        } catch (err) {
            setError('Error al cargar los datos. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleCrearMetal = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/metales`, {
                ...nuevoMetal,
                familia_id: nuevoMetal.familia_id || null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNuevoMetal({ nombre: '', valor_por_kilo: '', familia_id: '' });
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al crear metal');
        }
    };
    
    const handleCrearFamilia = async (e) => {
        e.preventDefault();
        if (!nuevaFamilia.nombre.trim()) {
            alert("El nombre de la familia no puede estar vacío.");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/familias`, nuevaFamilia, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNuevaFamilia({ nombre: '' });
            setIsCreatingFamilia(false);
            // Seleccionar automáticamente la familia recién creada
            setNuevoMetal({...nuevoMetal, familia_id: res.data.id });
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al crear la familia');
        }
    };


    const iniciarEdicion = (metal, familiaId) => {
        setEditingId(metal.id);
        setEditForm({ 
            nombre: metal.nombre, 
            valor_por_kilo: metal.valor_por_kilo,
            familia_id: familiaId
        });
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setEditForm({ nombre: '', valor_por_kilo: '', familia_id: null });
    };

    const guardarEdicion = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/metales/${id}`, {
                ...editForm,
                familia_id: editForm.familia_id || null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingId(null);
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al actualizar');
        }
    };

    const renderMetalRow = (metal, familia) => (
        <tr key={metal.id}>
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
                    <td className="p-3">
                        <select 
                            className="form-select form-select-sm"
                            value={editForm.familia_id || ''}
                            onChange={e => setEditForm({ ...editForm, familia_id: e.target.value === '' ? null : e.target.value })}
                        >
                            <option value="">Sin familia</option>
                            {familias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                        </select>
                    </td>
                    <td className="p-3 d-flex gap-2">
                        <button onClick={() => guardarEdicion(metal.id)} className="btn btn-sm btn-outline-success" title="Guardar"><Save size={18} /></button>
                        <button onClick={cancelarEdicion} className="btn btn-sm btn-outline-danger" title="Cancelar"><X size={18} /></button>
                    </td>
                </>
            ) : (
                <>
                    <td className="p-3 fw-medium">{metal.nombre}</td>
                    <td className="p-3 fw-bold text-primary">${Math.round(metal.valor_por_kilo)}</td>
                    <td className="p-3 text-muted">{familia ? familia.familia_nombre : 'Sin Familia'}</td>
                    <td className="p-3">
                        <button onClick={() => iniciarEdicion(metal, familia?.familia_id)} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                            <Edit2 size={16} /> Editar
                        </button>
                    </td>
                </>
            )}
        </tr>
    );

    return (
        <div className="container-fluid p-4 bg-white rounded shadow-sm border">
            <h2 className="h3 mb-4 d-flex align-items-center gap-2"><DollarSign /> Gestión de Precios y Metales</h2>

            {/* Formulario de Creación */}
            <div className="mb-4 bg-light p-4 rounded border">
                 <h3 className="h5 mb-3 d-flex align-items-center gap-2"><Plus size={20} /> Agregar Nuevo Metal</h3>
                <form onSubmit={handleCrearMetal} className="row g-3 align-items-end">
                    <div className="col-md">
                        <label className="form-label">Familia</label>
                        <div className="input-group">
                            <select className="form-select" value={nuevoMetal.familia_id} onChange={e => setNuevoMetal({ ...nuevoMetal, familia_id: e.target.value })} >
                                <option value="">Seleccionar o crear familia...</option>
                                {familias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                            </select>
                           <button className="btn btn-outline-secondary" type="button" onClick={() => setIsCreatingFamilia(!isCreatingFamilia)} title="Crear nueva familia">
                                <PlusCircle size={18}/>
                            </button>
                        </div>
                    </div>
                    <div className="col-md">
                        <label className="form-label">Nombre del Metal</label>
                        <input type="text" className="form-control" placeholder="Ej: Cobre limpio" value={nuevoMetal.nombre} onChange={e => setNuevoMetal({ ...nuevoMetal, nombre: e.target.value })} required />
                    </div>
                    <div className="col-md">
                        <label className="form-label">Precio por Kilo</label>
                        <input type="number" step="1" className="form-control" placeholder="0" value={nuevoMetal.valor_por_kilo} onChange={e => setNuevoMetal({ ...nuevoMetal, valor_por_kilo: e.target.value })} required />
                    </div>
                    
                    <div className="col-auto">
                        <button type="submit" className="btn btn-success">Guardar Metal</button>
                    </div>
                </form>

                {isCreatingFamilia && (
                    <div className="mt-3 bg-white p-3 rounded border">
                         <h4 className="h6">Crear Nueva Familia</h4>
                        <form onSubmit={handleCrearFamilia} className="row g-2 align-items-end">
                            <div className="col">
                                 <label className="form-label">Nombre de la Familia</label>
                                <input type="text" className="form-control" placeholder="Ej: Aluminios" value={nuevaFamilia.nombre} onChange={e => setNuevaFamilia({ ...nuevaFamilia, nombre: e.target.value })} required />
                            </div>
                            <div className="col-auto">
                                <button type="submit" className="btn btn-primary">Crear y Usar</button>
                            </div>
                             <div className="col-auto">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingFamilia(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Tabla de Metales */}
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th className="p-3">Metal</th>
                            <th className="p-3">Precio / Kilo</th>
                            <th className="p-3">Familia</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="4" className="text-center p-4">Cargando...</td></tr>}
                        {!loading && metalesPorFamilia.map(familia => (
                            <React.Fragment key={familia.familia_id}>
                                <tr className="table-group-divider">
                                    <td colSpan="4" className="bg-body-secondary p-2 fw-bold text-dark">
                                        <Box size={16} className="d-inline-block me-2"/> {familia.familia_nombre}
                                    </td>
                                </tr>
                                {familia.metales && familia.metales.length > 0 ? (
                                     familia.metales.map(metal => renderMetalRow(metal, familia))
                                ) : (
                                    <tr><td colSpan="4" className="text-center p-3 text-muted fst-italic">No hay metales en esta familia.</td></tr>
                                )}
                            </React.Fragment>
                        ))}
                         {!loading && metalesSinFamilia.length > 0 && (
                             <>
                                <tr className="table-group-divider">
                                     <td colSpan="4" className="bg-body-secondary p-2 fw-bold text-dark">
                                         <Box size={16} className="d-inline-block me-2"/> Metales Sin Familia
                                     </td>
                                </tr>
                                {metalesSinFamilia.map(metal => renderMetalRow(metal, null))}
                             </>
                         )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionMetales;