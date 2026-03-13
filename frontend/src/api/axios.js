import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/';

const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Limpiar datos de sesión
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            // Redirigir a la página de login
            // Usamos window.location en lugar de useNavigate porque estamos fuera de un componente de React
            window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export default apiClient;
