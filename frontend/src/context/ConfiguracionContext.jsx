import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ConfiguracionContext = createContext();

export const ConfiguracionProvider = ({ children }) => {
    const [configuracion, setConfiguracion] = useState(null);

    useEffect(() => {
        const fetchConfiguracion = async () => {
            try {
                const res = await axios.get('/api/configuracion');
                setConfiguracion(res.data);
            } catch (error) {
                console.error('Error al obtener la configuración:', error);
            }
        };
        fetchConfiguracion();
    }, []);

    return (
        <ConfiguracionContext.Provider value={{ configuracion, setConfiguracion }}>
            {children}
        </ConfiguracionContext.Provider>
    );
};
