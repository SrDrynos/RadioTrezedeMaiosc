
import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { LayoutDashboard, Radio, Calendar, Music, Settings, LogOut, FileText, Mail, Menu, X, ChevronRight, BarChart3, Tv, Activity, Globe } from 'lucide-react';
import { User } from '../types';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login');
    }
    setUser(authService.getCurrentUser());
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (!user) return null;

  const navItems = [
    // Novas categorias solicitadas
    { path: '/admin/painel', label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/dashboard', label: 'Central de Comando', icon: <Radio size={20} /> }, // O antigo Dashboard vira a Central
    { path: '/admin/trafego', label: 'Tráfego do Site', icon: <BarChart3 size={20} /> },
    { path: '/admin/tv-config', label: 'Configuração TV Ao Vivo', icon: <Tv size={20} /> },
    
    // Categorias existentes
    { path: '/admin/noticias', label: 'Notícias & Conteúdo', icon: <FileText size={20} /> },
    { path: '/admin/programacao', label: 'Grade de Programação', icon: <Calendar size={20} /> },
    { path: '/admin/pedidos', label: 'Pedidos Musicais', icon: <Music size={20} /> },
    { path: '/admin/mensagens', label: 'Caixa de Entrada', icon: <Mail size={20} /> },
    { path: '/admin/configuracoes', label: 'Configurações Gerais', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col shadow-2xl`}>
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">Rádio 13</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Painel de Controle</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
             const isActive = location.pathname.startsWith(item.path);
             return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                </span>
                {item.label}
                {isActive && <ChevronRight size={16} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          {/* Botão Voltar para o Site */}
          <Link 
            to="/" 
            className="w-full flex items-center justify-center px-4 py-2.5 mb-4 bg-slate-800 hover:bg-slate-700 text-blue-200 border border-slate-700 hover:border-blue-500/50 rounded-xl text-sm font-bold transition-all duration-300 group shadow-lg"
          >
            <Globe size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Voltar para o Site
          </Link>

          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                {user.name.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.role === 'ADMIN' ? 'Administrador' : 'Locutor'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white rounded-lg text-sm transition-all duration-300 group"
          >
            <LogOut size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm p-4 md:hidden flex justify-between items-center z-10 relative">
             <div className="flex items-center gap-3">
                 <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
                    <Menu size={24} />
                 </button>
                 <span className="font-bold text-slate-800">Dashboard</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {user.name.charAt(0)}
             </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
