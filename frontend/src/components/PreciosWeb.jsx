import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { Edit2, Save, Plus, X, Trash2, Globe, Box, PlusCircle } from 'lucide-react';

const PreciosWeb = () => {
    const [items, setItems] = useState([]);
    const [familias, setFamilias] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ familia: '', material: '', precio: '' });

    const [nuevoItem, setNuevoItem] = useState({ familia_id: '', nueva_familia: '', material: '', precio: '' });
    const [isCreatingFamilia, setIsCreatingFamilia] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/preciosweb/admin');
            setItems(res.data);
            const familiasUnicas = [...new Set(res.data.map(item => item.familia))].sort();
            setFamilias(familiasUnicas);
            setError('');
        } catch (err) {
            setError('Error al cargar los datos. ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const agruparPorFamilia = () => {
        const grupos = {};
        items.forEach(item => {
            if (!grupos[item.familia]) {
                grupos[item.familia] = [];
            }
            grupos[item.familia].push(item);
        });
        return Object.entries(grupos).sort((a, b) => a[0].localeCompare(b[0]));
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        const familia = nuevoItem.nueva_familia.trim() || nuevoItem.familia_id;
        if (!familia) {
            alert("Debes seleccionar o crear una familia.");
            return;
        }
        try {
            await apiClient.post('/preciosweb', {
                familia,
                material: nuevoItem.material,
                precio: nuevoItem.precio
            });
            setNuevoItem({ familia_id: '', nueva_familia: '', material: '', precio: '' });
            setIsCreatingFamilia(false);
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al crear el precio web');
        }
    };

    const iniciarEdicion = (item) => {
        setEditingId(item.id);
        setEditForm({ familia: item.familia, material: item.material, precio: item.precio });
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setEditForm({ familia: '', material: '', precio: '' });
    };

    const guardarEdicion = async (id) => {
        try {
            await apiClient.put(`/preciosweb/${id}`, editForm);
            setEditingId(null);
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al actualizar');
        }
    };

    const handleEliminar = async (item) => {
        if (!window.confirm(`¿Eliminar "${item.material}" de la familia "${item.familia}"?`)) return;
        try {
            await apiClient.delete(`/preciosweb/${item.id}`);
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    const handleEliminarFamilia = async (familia) => {
        if (!window.confirm(`¿Eliminar la familia "${familia}" y todos sus materiales?`)) return;
        try {
            await apiClient.delete(`/preciosweb/familia/${encodeURIComponent(familia)}`);
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al eliminar la familia');
        }
    };

    const renderItemRow = (item) => (
        <tr key={item.id}>
            {editingId === item.id ? (
                <>
                    <td className="p-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editForm.familia}
                            onChange={e => setEditForm({ ...editForm, familia: e.target.value })}
                        />
                    </td>
                    <td className="p-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editForm.material}
                            onChange={e => setEditForm({ ...editForm, material: e.target.value })}
                        />
                    </td>
                    <td className="p-3">
                        <input
                            type="number"
                            step="0.01"
                            className="form-control form-control-sm"
                            value={editForm.precio}
                            onChange={e => setEditForm({ ...editForm, precio: e.target.value })}
                        />
                    </td>
                    <td className="p-3 d-flex gap-2">
                        <button onClick={() => guardarEdicion(item.id)} className="btn btn-sm btn-outline-success" title="Guardar"><Save size={18} /></button>
                        <button onClick={cancelarEdicion} className="btn btn-sm btn-outline-danger" title="Cancelar"><X size={18} /></button>
                    </td>
                </>
            ) : (
                <>
                    <td className="p-3 fw-medium">{item.familia}</td>
                    <td className="p-3">{item.material}</td>
                    <td className="p-3 fw-bold text-primary">${Math.round(item.precio)}</td>
                    <td className="p-3 d-flex gap-2">
                        <button onClick={() => iniciarEdicion(item)} className="btn btn-sm btn-outline-success" title="Editar"><Edit2 size={16} /></button>
                        <button onClick={() => handleEliminar(item)} className="btn btn-sm btn-outline-danger" title="Eliminar"><Trash2 size={16} /></button>
                    </td>
                </>
            )}
        </tr>
    );

    return (
      <div className="container my-4">
        <div className="row justify-content-center">
          <h2 className="h3 fw-bold text-center mb-3 gap-2">
            <span><Globe /></span>
            Precios Web
          </h2>
          <div className="col">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="g-3 mb-4 box">
                  <h3 className="h5 mb-3 d-flex align-items-center gap-2"><Plus size={20} /> Agregar Nuevo Material</h3>
                  <form onSubmit={handleCrear} className="row g-3 align-items-end">
                      <div className="col-md">
                        <label className="form-label">Familia</label>
                        <div className="input-group">
                          <select className="form-select" value={nuevoItem.familia_id} onChange={e => setNuevoItem({ ...nuevoItem, familia_id: e.target.value })} >
                              <option value="">Seleccionar o crear familia...</option>
                              {familias.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                          <button className="btn btn-outline-secondary" type="button" onClick={() => setIsCreatingFamilia(!isCreatingFamilia)} title="Crear nueva familia">
                              <PlusCircle size={18}/>
                          </button>
                        </div>
                      </div>
                      <div className="col-md">
                        <label className="form-label">Nombre del Material</label>
                        <input type="text" className="form-control" placeholder="Ej: Cobre web" value={nuevoItem.material} onChange={e => setNuevoItem({ ...nuevoItem, material: e.target.value })} required />
                      </div>
                      <div className="col-md">
                        <label className="form-label">Precio por Kilo</label>
                        <input type="number" step="0.01" className="form-control" placeholder="0" value={nuevoItem.precio} onChange={e => setNuevoItem({ ...nuevoItem, precio: e.target.value })} required />
                      </div>
                      <div className="col-auto">
                        <button type="submit" className="btn btn-success">Guardar Material</button>
                      </div>
                  </form>
                </div>

                {isCreatingFamilia && (
                  <div className="g-3 mb-4 box">
                    <h4 className="h6">Crear Nueva Familia</h4>
                    <form onSubmit={(e) => { e.preventDefault(); const nombre = nuevoItem.nueva_familia.trim(); if (!nombre) return; if (!familias.includes(nombre)) setFamilias(prev => [...prev, nombre].sort()); setNuevoItem({ ...nuevoItem, nueva_familia: '', familia_id: nombre }); setIsCreatingFamilia(false); }} className="row g-2 align-items-end">
                      <div className="col">
                        <label className="form-label">Nombre de la Familia</label>
                        <input type="text" className="form-control" placeholder="Ej: Aluminios" value={nuevoItem.nueva_familia} onChange={e => setNuevoItem({ ...nuevoItem, nueva_familia: e.target.value })} required />
                      </div>
                      <div className="col-auto">
                        <button type="submit" className="btn btn-success">Usar esta familia</button>
                      </div>
                      <div className="col-auto">
                        <button type="button" className="btn btn-outline-success" onClick={() => setIsCreatingFamilia(false)}>Cancelar</button>
                      </div>
                    </form>
                  </div>
                )}

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="table-responsive table-list">
                  <table className="table table-hover align-middle">
                      <thead className="table-light">
                          <tr>
                              <th className="p-2">Familia</th>
                              <th className="p-2">Material</th>
                              <th className="p-2">Precio / Kilo</th>
                              <th className="p-2">Acciones</th>
                          </tr>
                      </thead>
                      <tbody>
                          {loading && <tr><td colSpan="4" className="text-center p-4">Cargando...</td></tr>}
                          {!loading && items.length === 0 && <tr><td colSpan="4" className="text-center p-4 text-muted fst-italic">No hay precios web registrados.</td></tr>}
                          {!loading && agruparPorFamilia().map(([familia, metales]) => (
                              <React.Fragment key={familia}>
                                  <tr className="table-group-divider">
                                      <td colSpan="4" className="bg-body-secondary p-2 fw-bold text-dark d-flex align-items-center justify-content-between">
                                          <span><Box size={16} className="d-inline-block me-2"/> {familia}</span>
                                          <button onClick={() => handleEliminarFamilia(familia)} className="btn btn-sm btn-outline-danger" title="Eliminar familia" type="button"><Trash2 size={16} /></button>
                                      </td>
                                  </tr>
                                  {metales.map(item => renderItemRow(item))}
                              </React.Fragment>
                          ))}
                      </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default PreciosWeb;
