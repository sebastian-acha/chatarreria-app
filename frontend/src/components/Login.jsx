import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';
import { ConfiguracionContext } from '../context/ConfiguracionContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { configuracion } = useContext(ConfiguracionContext);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await axios.post(`${API_URL}/auth/login`, formData);

            // Guardar token y usuario en localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

            // Redireccionar al dashboard o home (ajusta la ruta según tu router)
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Error al iniciar sesión. Verifique su conexión.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="bg-white p-5 rounded shadow w-100" style={{ maxWidth: '400px' }}>
                <div className="text-center mb-4">
                    {configuracion?.logo_url && (
                        <img src={configuracion.logo_url} alt="Logo" className="mx-auto mb-4" style={{ height: '64px' }} />
                    )}
                    <h1 className="h3 fw-bold text-dark">
                        {configuracion?.nombre_empresa || 'Chatarrería'}
                    </h1>
                    <p className="text-muted">Sistema de Gestión</p>
                </div>

                {error && (
                    <div className="alert alert-danger mb-4 small">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label fw-bold small text-secondary" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <User size={20} className="text-muted" />
                            </span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-control"
                                placeholder="ejemplo@correo.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold small text-secondary" htmlFor="password">
                            Contraseña
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <Lock size={20} className="text-muted" />
                            </span>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                placeholder="********"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2 ${loading ? 'disabled' : ''}`}
                    >
                        {loading ? 'Ingresando...' : <><LogIn size={20} /> Iniciar Sesión</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;