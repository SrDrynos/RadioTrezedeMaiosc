
import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, BarChart3, Tv, FileText, Music, HeartHandshake } from 'lucide-react';

const AdminPanel: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Painel Geral</h1>
        <p className="text-gray-500">Bem-vindo ao sistema de gestão da Rádio Treze de Maio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Atalho Central de Comando */}
        <Link to="/admin/dashboard" className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition">
                <Radio size={120} />
            </div>
            <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Radio size={24} />
                </div>
                <h3 className="text-xl font-bold mb-1">Central de Comando</h3>
                <p className="text-blue-100 text-sm">Monitoramento de streaming, GPS de ouvintes e status do servidor.</p>
            </div>
        </Link>

        {/* Atalho TV */}
        <Link to="/admin/tv-config" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 group">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                <Tv size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">TV Ao Vivo</h3>
            <p className="text-gray-500 text-sm">Configure o link da transmissão de vídeo.</p>
        </Link>

        {/* Atalho Tráfego */}
        <Link to="/admin/trafego" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 group">
             <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Tráfego do Site</h3>
            <p className="text-gray-500 text-sm">Estatísticas de acesso e audiência.</p>
        </Link>

        {/* Atalho Notícias */}
        <Link to="/admin/noticias" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 group">
             <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition">
                <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Notícias</h3>
            <p className="text-gray-500 text-sm">Gerenciar redação e notícias.</p>
        </Link>

        {/* Atalho Pedidos */}
        <Link to="/admin/pedidos" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 group">
             <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition">
                <Music size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Pedidos Musicais</h3>
            <p className="text-gray-500 text-sm">Ver pedidos dos ouvintes.</p>
        </Link>

        {/* Atalho Patrocinadores */}
        <Link to="/admin/patrocinadores" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-1 border border-gray-100 group">
             <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition">
                <HeartHandshake size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Patrocinadores</h3>
            <p className="text-gray-500 text-sm">Gerenciar logos do rodapé.</p>
        </Link>

      </div>
    </div>
  );
};

export default AdminPanel;
