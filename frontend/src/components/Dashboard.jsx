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
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className={`bg-gray-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
                <div className="p-4 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex flex-col items-center gap-2 text-center">
                            {configuracion?.logo_url && <img src={configuracion.logo_url} alt="Logo" className="h-8 mx-auto" />}
                            <h1 className="text-lg font-bold">{configuracion?.nombre_empresa || 'Chatarrería'}</h1>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-800 rounded">
                        <Menu size={24} />
                    </button>
                </div>
                
                <nav className="flex-1 mt-4">
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

                <div className="p-4 border-t border-gray-800">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                            {usuario.nombres?.[0]}
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{usuario.nombres}</p>
                                <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className={`mt-4 flex items-center gap-2 text-red-400 hover:text-red-300 w-full ${!sidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto h-screen">
                <div className="p-8">
                    {renderVista()}
                </div>
            </main>
        </div>
    );
};



const BotonMenu = ({ icon, label, active, onClick, expanded }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-4 transition-colors ${active ? 'bg-blue-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} ${!expanded && 'justify-center'}`}
        title={!expanded ? label : ''}
    >
        {icon}
        {expanded && <span>{label}</span>}
    </button>
);

export default Dashboard;