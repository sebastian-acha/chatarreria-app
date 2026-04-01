import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';

const Configuracion = () => {
    const [config, setConfig] = useState({
        nombre_empresa: '',
        direccion: '',
        telefono: '',
        email: '',
        logo_url: ''
    });
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await apiClient.get('/configuracion');
                setConfig(res.data);
            } catch (error) {
                console.error('Error al obtener la configuración:', error);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        setLogo(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('nombre_empresa', config.nombre_empresa);
            formData.append('direccion', config.direccion);
            formData.append('telefono', config.telefono);
            formData.append('email', config.email);
            if (logo) {
                formData.append('logo', logo);
            }

            const res = await apiClient.put('/configuracion', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setConfig(res.data);
            alert('Configuración actualizada con éxito');
        } catch (error) {
            console.error('Error al actualizar la configuración:', error);
            alert('Error al actualizar la configuración');
        }
    };

    return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <h2 className="h3 fw-bold text-center mb-4 gap-2">Configuración de la Empresa</h2>
        <div className="col">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="box">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="mb-4 col-sm-6">
                      <label className="form-label">Nombre de la Empresa</label>
                      <input
                          type="text"
                          name="nombre_empresa"
                          value={config.nombre_empresa}
                          onChange={handleChange}
                          className="form-control"
                      />
                    </div>
                    <div className="mb-4 col-sm-6">
                      <label className="form-label">Dirección</label>
                      <input
                          type="text"
                          name="direccion"
                          value={config.direccion}
                          onChange={handleChange}
                          className="form-control"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="mb-4 col-sm-6">
                      <label className="form-label">Teléfono</label>
                      <input
                          type="text"
                          name="telefono"
                          value={config.telefono}
                          onChange={handleChange}
                          className="form-control"
                      />
                    </div>
                    <div className="mb-4 col-sm-6">
                      <label className="form-label">Email</label>
                      <input
                          type="email"
                          name="email"
                          value={config.email}
                          onChange={handleChange}
                          className="form-control"
                      />
                    </div>
                  </div>
                  <div className="row justify-content-center">
                    <div className="mb-4 col-sm-12 col-md-4">
                      {config.logo_url && <img src={config.logo_url} alt="Logo" className="mt-4 mb-2" style={{ height: '80px'}} />}
                      <input
                          type="file"
                          name="logo"
                          onChange={handleLogoChange}
                          className="form-control"
                      />
                    </div>
                  </div>
                  <div className="row justify-content-center">
                    <div className="mb-4 col-sm-12 col-md-4">
                      <button type="submit" className="btn btn-success w-100 d-flex justify-content-center">
                          Guardar Cambios
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
};

export default Configuracion;
