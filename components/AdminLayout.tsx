import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { LayoutDashboard, Radio, Calendar, Music, Settings, LogOut, FileText, Mail } from 'lucide-react';
import { User } from '../types';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

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
    { path: '/admin/dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/noticias', label: 'Notícias', icon: <FileText size={20} /> },
    { path: '/admin/programacao', label: 'Programação', icon: <Calendar size={20} /> },
    { path: '/admin/pedidos', label: 'Pedidos Musicais', icon: <Music size={20} /> },
    { path: '/admin/mensagens', label: 'Mensagens', icon: <Mail size={20} /> },
    { path: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-yellow-400">Rádio Admin</h2>
          <p className="text-xs text-gray-400 mt-1">Treze de Maio - SC</p>
        </div>

        <nav className="flex-1 py-6">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-blue-600 text-white border-r-4 border-yellow-400'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                {user.name.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
          >
            <LogOut size={16} className="mr-2" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 md:hidden flex justify-between items-center">
             <span className="font-bold text-slate-800">Admin Panel</span>
             <button onClick={handleLogout} className="text-red-600"><LogOut size={20} /></button>
        </header>
        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;