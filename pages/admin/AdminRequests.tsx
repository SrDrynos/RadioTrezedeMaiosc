import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { SongRequest } from '../../types';
import { CheckCircle, Download } from 'lucide-react';

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<SongRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => setRequests(db.getRequests());

  const markAsPlayed = (id: string) => {
    db.updateRequestStatus(id, 'played');
    loadRequests();
  };

  const exportList = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "Nome,Musica,Artista,Local,Mensagem,Data\n"
        + requests.map(e => `${e.listenerName},${e.song},${e.artist},${e.location},${e.message || ''},${e.createdAt}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pedidos_musicais.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Pedidos Musicais</h1>
            <button onClick={exportList} className="flex items-center text-blue-600 hover:underline">
                <Download size={16} className="mr-1" /> Exportar CSV
            </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-4">Ouvinte</th>
                        <th className="p-4">Local</th>
                        <th className="p-4">Pedido</th>
                        <th className="p-4">Recado</th>
                        <th className="p-4 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {requests.map(req => (
                        <tr key={req.id} className={req.status === 'played' ? 'bg-gray-50 opacity-60' : 'bg-white'}>
                            <td className="p-4 font-medium">{req.listenerName}</td>
                            <td className="p-4 text-gray-600">{req.location}</td>
                            <td className="p-4">
                                <div className="font-bold text-blue-900">{req.song}</div>
                                <div className="text-sm text-gray-500">{req.artist}</div>
                            </td>
                            <td className="p-4 text-sm text-gray-600 italic">"{req.message}"</td>
                            <td className="p-4 text-right">
                                {req.status === 'pending' ? (
                                    <button onClick={() => markAsPlayed(req.id)} className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-3 py-1 rounded text-sm font-bold flex items-center ml-auto">
                                        <CheckCircle size={14} className="mr-1" /> Atender
                                    </button>
                                ) : (
                                    <span className="text-green-600 text-xs font-bold uppercase">Atendido</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AdminRequests;