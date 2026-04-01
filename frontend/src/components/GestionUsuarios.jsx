import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { Users, Plus, Save } from 'lucide-react';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nombres: '',
        apellido_paterno: '',
        email: '',
        password: '',
        rol: 'EJECUTIVO',
        sucursal_id: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resUsuarios, resSucursales] = await Promise.all([
                apiClient.get(`/usuarios`),
                apiClient.get(`/sucursales`)
            ]);
            setUsuarios(resUsuarios.data);
            setSucursales(resSucursales.data);
        } catch (error) {
            console.error("Error cargando datos", error);
            alert('No se pudieron cargar los datos. Verifique que tiene permisos de administrador.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.rol === 'EJECUTIVO' && !form.sucursal_id) {
            alert('Debe seleccionar una sucursal para el ejecutivo.');
            return;
        }
        try {
            await apiClient.post(`/usuarios`, form);
            alert('Usuario creado con éxito');
            setForm({ nombres: '', apellido_paterno: '', email: '', password: '', rol: 'EJECUTIVO', sucursal_id: '' });
            fetchData(); // Recargar lista de usuarios
        } catch (error) {
            alert(error.response?.data?.error || 'Error al crear el usuario');
        }
    };

    return (
        <div className="container my-4">
          <div className="row justify-content-center">
            <h2 className="h3 fw-bold text-center mb-3 gap-2">
              <span><Users /></span> 
              Gestión de Usuarios
            </h2>
            <div className="col">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                
                  {/* Formulario de Creación */}
                  <div className="mb-4 bg-light p-4 rounded border">
                    <h3 className="h5 mb-3 d-flex align-items-center gap-2"><Plus /> Crear Nuevo Usuario</h3>
                    <form onSubmit={handleSubmit} className="row g-3">
                      <div className="col-md-4"><input name="nombres" value={form.nombres} onChange={handleChange} placeholder="Nombres" className="form-control" required /></div>
                      <div className="col-md-4"><input name="apellido_paterno" value={form.apellido_paterno} onChange={handleChange} placeholder="Apellido Paterno" className="form-control" required /></div>
                      <div className="col-md-4"><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="form-control" required /></div>
                      <div className="col-md-4"><input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Contraseña" className="form-control" required /></div>
                      <div className="col-md-4">
                        <select name="rol" value={form.rol} onChange={handleChange} className="form-select">
                          <option value="EJECUTIVO">Ejecutivo</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      </div>
                      {form.rol === 'EJECUTIVO' && (
                          <div className="col-md-4">
                            <select name="sucursal_id" value={form.sucursal_id} onChange={handleChange} className="form-select" required>
                              <option value="">Seleccione Sucursal...</option>
                              {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            </select>
                          </div>
                      )}
                      <div className="col-12 col-md-4">
                        <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
                            <Save size={18} /> Guardar Usuario
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Tabla de Usuarios */}
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">Nombre</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Rol</th>
                          <th className="p-3">Sucursal</th>
                          <th className="p-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="p-4 text-center">Cargando...</td>
                            </tr>
                          ) : (
                          usuarios.map(user => (
                          <tr key={user.id}>
                            <td className="p-3 text-muted">#{user.id}</td>
                            <td className="p-3 fw-medium">{user.nombres} {user.apellido_paterno}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3">
                              <span className={`badge rounded-pill ${user.rol === 'ADMIN' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                                {user.rol}
                              </span>
                            </td>
                            <td className="p-3">{user.sucursal_nombre || 'N/A'}</td>
                            <td className="p-3">
                              <span className={`badge rounded-pill ${user.activo ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                {user.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                          </tr>
                          ))
                        )}
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

export default GestionUsuarios;
