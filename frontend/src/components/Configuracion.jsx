import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/configuracion', {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('nombre_empresa', config.nombre_empresa);
            formData.append('direccion', config.direccion);
            formData.append('telefono', config.telefono);
            formData.append('email', config.email);
            if (logo) {
                formData.append('logo', logo);
            }

            const res = await axios.put('/api/configuracion', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Configuración de la Empresa</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Nombre de la Empresa</label>
                    <input
                        type="text"
                        name="nombre_empresa"
                        value={config.nombre_empresa}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Dirección</label>
                    <input
                        type="text"
                        name="direccion"
                        value={config.direccion}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        value={config.telefono}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={config.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Logo</label>
                    <input
                        type="file"
                        name="logo"
                        onChange={handleLogoChange}
                        className="w-full p-2 border rounded"
                    />
                    {config.logo_url && <img src={config.logo_url} alt="Logo" className="mt-4 h-20" />}
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
};

export default Configuracion;
