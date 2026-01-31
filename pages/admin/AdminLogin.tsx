
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { db } from '../../services/db';
import { RadioLogo } from '../../components/RadioLogo';
import { SiteSettings } from '../../types';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get settings to show logo, fall back gracefully if init needed
    try {
        setSettings(db.getSettings());
    } catch (e) {
        db.init(); // Just in case
        setSettings(db.getSettings());
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await authService.login(email, password);
      if (user) {
        navigate('/admin/dashboard');
      } else {
        setError('Credenciais inválidas.');
      }
    } catch (e) {
      setError('Erro ao conectar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8 flex flex-col items-center">
            <RadioLogo src={settings?.logoUrl} className="w-32 h-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
            <p className="text-gray-500 text-sm">Acesso Restrito</p>
        </div>

        {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="admin@radiotrezedemaio.com.br"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 text-white font-bold py-2 rounded hover:bg-blue-800 transition disabled:opacity-50"
            >
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Sistema Interno
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
