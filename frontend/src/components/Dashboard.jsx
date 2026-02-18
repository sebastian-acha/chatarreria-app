import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import HistorialTransacciones from './HistorialTransacciones';
import NuevaCompra from './NuevaCompra';
import GestionMetales from './GestionMetales';
import ReporteDiario from './ReporteDiario';
import GestionUsuarios from './GestionUsuarios';
import GestionSucursales from './GestionSucursales';
import Configuracion from './Configuracion';
import { LogOut, LayoutDashboard, ShoppingCart, Settings, Menu, BarChart3, Users, Building, Cog } from 'lucide-react';
import { ConfiguracionContext } from '../context/ConfiguracionContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const [vistaActual, setVistaActual] = useState('historial');
    const [sidebarOpen, setSidebarOpen] = useState(true);
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
        <div className="d-flex min-vh-100 bg-light">
            {/* Sidebar */}
            <aside className="bg-dark text-white d-flex flex-column" style={{ width: sidebarOpen ? '250px' : '80px', transition: 'width 0.3s' }}>
                <div className="p-3 d-flex align-items-center justify-content-between">
                    {sidebarOpen && (
                        <div className="d-flex flex-column align-items-center gap-2 text-center w-100">
                            {configuracion?.logo_url && <img src={configuracion.logo_url} alt="Logo" className="mx-auto" style={{ height: '32px' }} />}
                            <h1 className="h6 fw-bold mb-0">{configuracion?.nombre_empresa || 'Chatarrería'}</h1>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-sm btn-dark">
                        <Menu size={24} />
                    </button>
                </div>

                <nav className="flex-grow-1 mt-4">
                    <BotonMenu
                        icon={<LayoutDashboard size={20} />}
                        label="Historial"
                        active={vistaActual === 'historial'}
                        onClick={() => setVistaActual('historial')}
                        expanded={sidebarOpen}
                    />
                    <BotonMenu
                        icon={<ShoppingCart size={20} />}
                        label="Nueva Compra"
                        active={vistaActual === 'nueva-compra'}
                        onClick={() => setVistaActual('nueva-compra')}
                        expanded={sidebarOpen}
                    />
                    <BotonMenu
                        icon={<Settings size={20} />}
                        label="Precios Metales"
                        active={vistaActual === 'metales'}
                        onClick={() => setVistaActual('metales')}
                        expanded={sidebarOpen}
                    />
                    <BotonMenu
                        icon={<BarChart3 size={20} />}
                        label="Reporte Diario"
                        active={vistaActual === 'reporte'}
                        onClick={() => setVistaActual('reporte')}
                        expanded={sidebarOpen}
                    />
                    {usuario.rol === 'ADMIN' && (
                        <>
                            <BotonMenu
                                icon={<Users size={20} />}
                                label="Usuarios"
                                active={vistaActual === 'usuarios'}
                                onClick={() => setVistaActual('usuarios')}
                                expanded={sidebarOpen}
                            />
                            <BotonMenu
                                icon={<Building size={20} />}
                                label="Sucursales"
                                active={vistaActual === 'sucursales'}
                                onClick={() => setVistaActual('sucursales')}
                                expanded={sidebarOpen}
                            />
                            <BotonMenu
                                icon={<Cog size={20} />}
                                label="Configuración"
                                active={vistaActual === 'configuracion'}
                                onClick={() => setVistaActual('configuracion')}
                                expanded={sidebarOpen}
                            />
                        </>
                    )}
                </nav>

                <div className="p-3 border-top border-secondary">
                    <div className={`d-flex align-items-center gap-3 ${!sidebarOpen && 'justify-content-center'}`}>
                        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center fw-bold text-white" style={{ width: '32px', height: '32px' }}>
                            {usuario.nombres?.[0]}
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="small fw-medium text-truncate mb-0">{usuario.nombres}</p>
                                <p className="small text-white-50 text-truncate mb-0">{usuario.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`btn btn-link text-decoration-none mt-3 d-flex align-items-center gap-2 text-danger w-100 ${!sidebarOpen && 'justify-content-center'}`}
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow-1 overflow-auto vh-100">
                <div className="p-4">
                    {renderVista()}
                </div>
            </main>
        </div>
    );
};



const BotonMenu = ({ icon, label, active, onClick, expanded }) => (
    <button
        onClick={onClick}
        className={`btn w-100 rounded-0 d-flex align-items-center gap-3 p-3 border-0 ${active ? 'btn-primary' : 'text-white-50 hover-bg-secondary'} ${!expanded && 'justify-content-center'}`}
        title={!expanded ? label : ''}
    >
        {icon}
        {expanded && <span>{label}</span>}
    </button>
);

export default Dashboard;