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

const Dashboard = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const [vistaActual, setVistaActual] = useState('historial');
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
        <main className="d-flex flex-column min-vh-100 bg-light">
            <header className="navbar navbar-expand-md navbar-dark bg-dark container-fluid flex-wrap flex-md-nowrap" aria-label="Main -navigation">
                <a className="navbar-brand p-0 me-2 d-flex align-items-center gap-2" href="#" onClick={e => e.preventDefault()}>
                    {configuracion?.logo_url ? (
                        <img src={configuracion.logo_url} alt="Logo" style={{ height: '32px' }} />
                    ) : (
                        <span className="h6 fw-bold mb-0 text-white">{configuracion?.nombre_empresa || 'Chatarrería'}</span>
                    )}
                </a>

                <button className="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#bdNavbar" aria-controls="bdNavbar" aria-expanded="false" aria-label="Toggle navigation">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="bi" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M2.5 11.5A.5.5 0 0 1 3 11h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 3h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"></path>
                    </svg>
                </button>

                <div className="navbar-collapse collapse" id="bdNavbar">
                    <ul className="navbar-nav flex-row flex-wrap bd-navbar-nav pt-2 py-md-0">
                        <li className="nav-item col-6 col-md-auto">
                            <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'historial' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('historial'); }}>
                                <LayoutDashboard size={18} />
                                Historial
                            </a>
                        </li>
                        <li className="nav-item col-6 col-md-auto">
                            <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'nueva-compra' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('nueva-compra'); }}>
                                <ShoppingCart size={18} />
                                Nueva Compra
                            </a>
                        </li>
                        <li className="nav-item col-6 col-md-auto">
                            <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'metales' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('metales'); }}>
                                <DollarSign size={18} />
                                Precios Metales
                            </a>
                        </li>
                        <li className="nav-item col-6 col-md-auto">
                            <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'reporte' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('reporte'); }}>
                                <BarChart3 size={18} />
                                Reporte Diario
                            </a>
                        </li>
                        {usuario.rol === 'ADMIN' && (
                            <>
                                <li className="nav-item col-6 col-md-auto">
                                    <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'usuarios' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('usuarios'); }}>
                                        <Users size={18} />
                                        Usuarios
                                    </a>
                                </li>
                                <li className="nav-item col-6 col-md-auto">
                                    <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'sucursales' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('sucursales'); }}>
                                        <Building size={18} />
                                        Sucursales
                                    </a>
                                </li>
                                <li className="nav-item col-6 col-md-auto">
                                    <a className={`nav-link p-2 d-flex align-items-center gap-2 ${vistaActual === 'configuracion' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setVistaActual('configuracion'); }}>
                                        <Settings size={18} />
                                        Configuración
                                    </a>
                                </li>
                            </>
                        )}
                    </ul>

                    <hr className="d-md-none text-white-50" />

                    <ul className="navbar-nav flex-row flex-wrap ms-md-auto">
                        <li className="nav-item col-6 col-md-auto">
                            <div className="dropdown text-end">
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
            </header>

            <div className="flex-grow-1">
                {renderVista()}
            </div>
        </main>
    );
};

export default Dashboard;