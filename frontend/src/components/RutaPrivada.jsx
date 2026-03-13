import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import apiClient from '../api/axios';

const RutaPrivada = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // El interceptor de axios se encargará de añadir el token.
                // Si el token es inválido, el backend dará un error 401/403.
                // El interceptor de respuesta de axios detectará el error y redirigirá.
                await apiClient.get('/auth/verify');
                setIsAuthenticated(true);
            } catch (error) {
                // Aunque el interceptor redirige, actualizamos el estado para ser consistentes.
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            // No hay token, no está autenticado.
        } else {
            verifyToken();
        }
    }, []);

    if (isLoading) {
        return <div>Verificando sesión...</div>; // O un componente de Spinner/Carga
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default RutaPrivada;