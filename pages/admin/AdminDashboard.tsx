import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { SongRequest, ContactMessage } from '../../types';
import { Music, MessageSquare, Users, BarChart } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [requestCount, setRequestCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const reqs = db.getRequests();
    const msgs = db.getMessages();
    setRequestCount(reqs.filter(r => r.status === 'pending').length);
    setMessageCount(msgs.length);
  }, []);

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
  );

  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Visão Geral</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Pedidos Pendentes" value={requestCount} icon={<Music size={20} />} color="bg-yellow-500" />
            <StatCard title="Mensagens Recebidas" value={messageCount} icon={<MessageSquare size={20} />} color="bg-blue-500" />
            <StatCard title="Ouvintes Online" value="128" icon={<Users size={20} />} color="bg-green-500" />
            <StatCard title="Total de Notícias" value={db.getNews().length} icon={<BarChart size={20} />} color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Últimos Pedidos Musicais</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-2">Ouvinte</th>
                                <th className="px-4 py-2">Música</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {db.getRequests().slice(0, 5).map(req => (
                                <tr key={req.id} className="border-b">
                                    <td className="px-4 py-3">{req.listenerName}</td>
                                    <td className="px-4 py-3 text-gray-600">{req.song} - {req.artist}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {req.status === 'pending' ? 'Pendente' : 'Atendido'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-4">Atalhos Rápidos</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => window.location.hash = '#/admin/noticias'} className="p-4 bg-gray-50 hover:bg-gray-100 rounded text-center text-blue-600 font-medium">
                        Nova Notícia
                    </button>
                    <button onClick={() => window.location.hash = '#/admin/configuracoes'} className="p-4 bg-gray-50 hover:bg-gray-100 rounded text-center text-blue-600 font-medium">
                        Alterar Streaming
                    </button>
                    <button onClick={() => window.location.hash = '#/admin/programacao'} className="p-4 bg-gray-50 hover:bg-gray-100 rounded text-center text-blue-600 font-medium">
                        Editar Grade
                    </button>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;