import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';

const DisenoContext = createContext();

export const useDiseno = () => {
    return useContext(DisenoContext);
};

export const DisenoProvider = ({ children }) => {
    const [customCss, setCustomCss] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEstilos = async () => {
            try {
                const { data } = await axios.get('/configuracion/estilos');
                if (data && data.custom_css) {
                    setCustomCss(data.custom_css);
                }
            } catch (error) {
                console.error('Error al cargar los estilos personalizados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEstilos();
    }, []);

    const saveCustomCss = async (css) => {
        try {
            const { data } = await axios.put('/configuracion/estilos', { custom_css: css });
            if (data && data.custom_css) {
                setCustomCss(data.custom_css);
            }
             return data;
        } catch (error) {
            console.error('Error al guardar los estilos personalizados:', error);
            throw error;
        }
    };
    
    // Inject CSS into head
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.id = 'custom-styles-from-db';
        styleElement.innerHTML = customCss;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, [customCss]);


    return (
        <DisenoContext.Provider value={{ customCss, saveCustomCss, loading }}>
            {children}
        </DisenoContext.Provider>
    );
};
