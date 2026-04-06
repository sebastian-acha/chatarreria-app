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
        <h2 className="h3 fw-bold text-center mb-4 gap-2">
          <span>
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12c.263 0 .524-.06.767-.175a2 2 0 0 0 .65-.491c.186-.21.333-.46.433-.734.1-.274.15-.568.15-.864a2.4 2.4 0 0 0 .586 1.591c.375.422.884.659 1.414.659.53 0 1.04-.237 1.414-.659A2.4 2.4 0 0 0 12 9.736a2.4 2.4 0 0 0 .586 1.591c.375.422.884.659 1.414.659.53 0 1.04-.237 1.414-.659A2.4 2.4 0 0 0 16 9.736c0 .295.052.588.152.861s.248.521.434.73a2 2 0 0 0 .649.488 1.809 1.809 0 0 0 1.53 0 2.03 2.03 0 0 0 .65-.488c.185-.209.332-.457.433-.73.1-.273.152-.566.152-.861 0-.974-1.108-3.85-1.618-5.121A.983.983 0 0 0 17.466 4H6.456a.986.986 0 0 0-.93.645C5.045 5.962 4 8.905 4 9.736c.023.59.241 1.148.611 1.567.37.418.865.667 1.389.697Zm0 0c.328 0 .651-.091.94-.266A2.1 2.1 0 0 0 7.66 11h.681a2.1 2.1 0 0 0 .718.734c.29.175.613.266.942.266.328 0 .651-.091.94-.266.29-.174.537-.427.719-.734h.681a2.1 2.1 0 0 0 .719.734c.289.175.612.266.94.266.329 0 .652-.091.942-.266.29-.174.536-.427.718-.734h.681c.183.307.43.56.719.734.29.174.613.266.941.266a1.819 1.819 0 0 0 1.06-.351M6 12a1.766 1.766 0 0 1-1.163-.476M5 12v7a1 1 0 0 0 1 1h2v-5h3v5h7a1 1 0 0 0 1-1v-7m-5 3v2h2v-2h-2Z"/>
            </svg>
          </span>
           Configuración de la Empresa
          </h2>
        <div className="col col-xl-8 col-lg-10">
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
                      {config.logo_url && <img src={config.logo_url} alt="Logo" className="mt-4 mb-2 logo-config"/>}
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
