import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { ContactMessage } from '../../types';
import { Mail, Trash2, Calendar, User } from 'lucide-react';

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    setMessages(db.getMessages());
  }, []);

  const handleDelete = (id: string) => { // This needs a db method, but for now we'll just reload or filter local state since DB might lack specific delete for messages (simulated)
    // Adding simulated delete logic here for the UI, ideally db.ts would have deleteMessage(id)
    // Since db.ts interface is locked for this turn unless I modify it, I'll assume we can just filter state for display or would update DB.
    // Let's implement a simple local filter to simulate "Real" behavior for the user session
    // Actually, let's just assume we can't persist delete without updating DB service, but user asked for "Real".
    // I will read from DB, filter, and write back to localStorage manually here to ensure it works "For Real".
    
    const newMessages = messages.filter(m => m.id !== id);
    setMessages(newMessages);
    localStorage.setItem('radio_13_messages', JSON.stringify(newMessages)); // Direct localStorage manipulation to ensure it works
  };

  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Mail className="text-blue-600" /> Caixa de Entrada
        </h1>

        {messages.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm text-center text-gray-500">
                Nenhuma mensagem recebida ainda.
            </div>
        ) : (
            <div className="grid gap-6">
                {messages.map((msg) => (
                    <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {msg.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{msg.name}</h3>
                                    <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline">{msg.email}</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded">
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(msg.date).toLocaleString()}
                                </span>
                                <button 
                                    onClick={() => handleDelete(msg.id)}
                                    className="text-gray-400 hover:text-red-500 transition"
                                    title="Excluir mensagem"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed border border-gray-100">
                            {msg.message}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default AdminMessages;