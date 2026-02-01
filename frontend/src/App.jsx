import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RutaPrivada from './components/RutaPrivada';
import Configuracion from './components/Configuracion';

function App() {
  return (
    <BrowserRouter>
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
