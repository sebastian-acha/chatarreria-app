import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import HistorialTransacciones from './HistorialTransacciones';
import NuevaCompra from './NuevaCompra';
import GestionMetales from './GestionMetales';
import ReporteDiario from './ReporteDiario';
import GestionUsuarios from './GestionUsuarios';
import GestionSucursales from './GestionSucursales';
import Configuracion from './Configuracion';
import { LogOut, LayoutDashboard, ShoppingCart, DollarSign, BarChart3, Users, Building, Settings } from 'lucide-react';
import { ConfiguracionContext } from '../context/ConfiguracionContext';
import Footer from './Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [vistaActual, setVistaActual] = useState('reporte');
  const { configuracion } = useContext(ConfiguracionContext);

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/login');
  };

  const renderVista = () => {
      switch (vistaActual) {
          case 'historial': return <HistorialTransacciones />;
          case 'nueva-compra': return <NuevaCompra />;
          case 'metales': return <GestionMetales />;
          case 'reporte': return <ReporteDiario />;
          case 'usuarios': return <GestionUsuarios />;
          case 'sucursales': return <GestionSucursales />;
          case 'configuracion': return <Configuracion />;
          default: return <HistorialTransacciones />;
      }
  };

  return (
  <main className="d-flex flex-column min-vh-100">
    <header className="navbar navbar-expand-md  flex-wrap flex-md-nowrap" aria-label="Main -navigation">
      <div class="container">
        <a className="navbar-brand p-0 me-2 d-flex align-items-center gap-2" href="#" onClick={e => e.preventDefault()}>
            {configuracion?.logo_url ? (
                <img src={configuracion.logo_url} alt="Logo" style={{ height: '32px' }} />
            ) : (
                <span className="h6 fw-bold mb-0 text-white">{configuracion?.nombre_empresa || 'Chatarrapp'}</span>
            )}
        </a>

        <button className="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#bdNavbar" aria-controls="bdNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="bi" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 11.5A.5.5 0 0 1 3 11h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 3h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"></path>
            </svg>
        </button>

        <div className="navbar-collapse collapse" id="bdNavbar">
            <ul className="navbar-nav flex-row flex-wrap bd-navbar-nav pt-2 py-md-0">
              <li className="nav-item col-12 col-md-auto">
                <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'reporte' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('reporte'); }}>
                  <span> <BarChart3 size={16} /></span>
                    Reporte Diario
                </a>
              </li>
              <li className="nav-item col-12 col-md-auto">
                <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'historial' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('historial'); }}>
                  <span> <LayoutDashboard size={16} /> </span>
                    Historial
                </a>
              </li>
              <li className="nav-item col-12 col-md-auto">
                <a className={`nav-link p-2 d-flex align-items-center gap-2 cta ${vistaActual === 'nueva-compra' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('nueva-compra'); }}>
                  <span> 
                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8 7V6a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1M3 18v-7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"></path>
                    </svg>
                  </span>
                    Nueva Compra
                </a>
              </li>
              {usuario.rol === 'ADMIN' && (
                  <>
                <li className="nav-item col-12 col-md-auto config">
                  <div className="dropdown">
                    <a className="nav-link p-2 d-flex align-items-center gap-2 dropdown-toggle" id="dropdownConfig" data-bs-toggle="dropdown" aria-expanded="false">
                      <span> <Settings size={16} /></span>
                        Configuración
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end text-small" aria-labelledby="dropdownConfig">
                      <li className="nav-item col-12 col-md-auto">
                        <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'metales' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('metales'); }}>
                          <span> <DollarSign size={16} /></span>
                            Precios Metales
                        </a>
                      </li>
                      <li className="nav-item col-12 col-md-auto">
                        <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'usuarios' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('usuarios'); }}>
                          <span> <Users size={16} /></span>
                            Usuarios
                        </a>
                      </li>
                      <li className="nav-item col-12 col-md-auto">
                        <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'configuracion' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('configuracion'); }}>
                          <span> <Settings size={16} /></span>
                            Datos empresa
                        </a>
                      </li>
                      <li className="nav-item col-12 col-md-auto">
                        <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'sucursales' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('sucursales'); }}>
                          <span> <Building size={16} /></span>
                            Sucursales
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                  </>
                )}
            </ul>

          <hr className="d-md-none" />

          <ul className="navbar-nav flex-row flex-wrap ms-md-auto user">
            <li className="nav-item col-6 col-md-auto">
              <div className="dropdown">
                <a href="#" className="d-block link-light text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src={`https://ui-avatars.com/api/?name=${usuario.nombres || 'User'}&background=random`} alt="user" width="32" height="32" className="rounded-circle" />
                </a>
                <ul className="dropdown-menu dropdown-menu-end text-small" aria-labelledby="dropdownUser1">
                  <li><a className="dropdown-item d-flex align-items-center gap-2" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}><LogOut size={16} /> Cerrar Sesión</a></li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>  
    </header>
      <div className="flex-grow-1">
          {renderVista()}
      </div>
      <Footer /> 
  </main>
    );
};

export default Dashboard;