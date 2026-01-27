import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [resUsuarios, resSucursales] = await Promise.all([
                axios.get(`${API_URL}/usuarios`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/sucursales`, { headers: { Authorization: `Bearer ${token}` } })
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
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/usuarios`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Usuario creado con éxito');
            setForm({ nombres: '', apellido_paterno: '', email: '', password: '', rol: 'EJECUTIVO', sucursal_id: '' });
            fetchData(); // Recargar lista de usuarios
        } catch (error) {
            alert(error.response?.data?.error || 'Error al crear el usuario');
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users /> Gestión de Usuarios</h2>

            {/* Formulario de Creación */}
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus /> Crear Nuevo Usuario</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input name="nombres" value={form.nombres} onChange={handleChange} placeholder="Nombres" className="border p-2 rounded" required />
                    <input name="apellido_paterno" value={form.apellido_paterno} onChange={handleChange} placeholder="Apellido Paterno" className="border p-2 rounded" required />
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" required />
                    <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Contraseña" className="border p-2 rounded" required />
                    <select name="rol" value={form.rol} onChange={handleChange} className="border p-2 rounded">
                        <option value="EJECUTIVO">Ejecutivo</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                    {form.rol === 'EJECUTIVO' && (
                        <select name="sucursal_id" value={form.sucursal_id} onChange={handleChange} className="border p-2 rounded" required>
                            <option value="">Seleccione Sucursal...</option>
                            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    )}
                    <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 col-span-full md:col-span-1 flex items-center justify-center gap-2">
                        <Save size={18} /> Guardar Usuario
                    </button>
                </form>
            </div>

            {/* Tabla de Usuarios */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
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
                            <tr><td colSpan="6" className="p-4 text-center">Cargando...</td></tr>
                        ) : (
                            usuarios.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-gray-500">#{user.id}</td>
                                    <td className="p-3 font-medium">{user.nombres} {user.apellido_paterno}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.rol === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className="p-3">{user.sucursal_nombre || 'N/A'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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
    );
};

export default GestionUsuarios;
