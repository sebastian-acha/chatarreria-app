import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';
import { ConfiguracionContext } from '../context/ConfiguracionContext';
import apiClient from '../api/axios';
import Footer from './Footer';

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
            const response = await apiClient.post('/auth/login', formData);

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
      <main className="d-flex flex-column min-vh-100 bg-light">
        <div className="flex-grow-1 login">
          <div className="container p-4">
            <div className="row justify-content-center">
              <div className="col col-xl-6 col-xxl-5 col-lg-6 col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body p-2 ">
                  <div className="text-center pb-2 pt-4">
                    {configuracion?.logo_url && (
                        <img src={configuracion.logo_url} alt="Logo" className="mx-auto mb-4" style={{ height: '54px' }} />
                    )}
                    <h2 className="h3 fw-bold text-center mb-2 gap-2">
                        {configuracion?.nombre_empresa || 'Chatarrapp'}
                    </h2>
                    <p className="text-muted">Sistema de Gestión</p>
                {error && (
                    <div className="alert alert-danger mb-4 small">
                        {error}
                    </div>
                )}
                  </div>

                </div>
              </div>
              <div className="card shadow-sm">

                <div className="card-body p-4">
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
                          className={`btn btn-success w-100 py-3 fw-bold d-flex justify-content-center align-items-center gap-2 ${loading ? 'disabled' : ''}`}
                      >
                          {loading ? 'Ingresando...' : <><LogIn size={20} /> Iniciar Sesión</>}
                      </button>
                  </form>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
};

export default Login;