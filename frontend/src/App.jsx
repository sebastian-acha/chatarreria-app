import React, { useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RutaPrivada from './components/RutaPrivada';
import Configuracion from './components/Configuracion';
import { ConfiguracionContext } from './context/ConfiguracionContext';

const TitleUpdater = () => {
    const { configuracion } = useContext(ConfiguracionContext);
    const location = useLocation();

    useEffect(() => {
        const usuarioStr = localStorage.getItem('usuario');
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

        const nombreEmpresa = configuracion?.nombre_empresa;
        const nombreSucursal = usuario?.nombre_sucursal;

        let title = "Chatarreria App";

        if (nombreEmpresa) {
            title = nombreEmpresa;
            if (nombreSucursal && location.pathname !== '/login') {
                title += ` - ${nombreSucursal}`;
            }
        }
        
        document.title = title;

    }, [configuracion, location]);

    return null;
}

function App() {
  return (
    <BrowserRouter>
      <TitleUpdater />
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta privada: Dashboard (Protegida) */}
        <Route 
          path="/dashboard" 
          element={
            <RutaPrivada>
              <Dashboard />
            </RutaPrivada>
          } 
        />
        <Route 
          path="/configuracion" 
          element={
            <RutaPrivada>
              <Configuracion />
            </RutaPrivada>
          } 
        />

        {/* Redirección por defecto: Si entran a la raíz, ir a dashboard (o login si no hay token) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
