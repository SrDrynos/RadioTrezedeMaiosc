import React, { useState } from 'react';
import { db } from '../../services/db';
import { SongRequest } from '../../types';
import { Music, MapPin, Send } from 'lucide-react';

const Requests: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    artist: '',
    song: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: SongRequest = {
        id: Date.now().toString(),
        listenerName: formData.name,
        location: formData.location,
        artist: formData.artist,
        song: formData.song,
        message: formData.message,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    db.addRequest(newRequest);
    setSubmitted(true);
  };

  if (submitted) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <Send size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Enviado!</h2>
                <p className="text-gray-600 mb-6">Obrigado por participar. Fique ligado na programação, seu pedido pode tocar a qualquer momento.</p>
                <button
                    onClick={() => { setSubmitted(false); setFormData({name: '', location: '', artist: '', song: '', message: ''}) }}
                    className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
                >
                    Fazer outro pedido
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-blue-900 p-8 text-center">
                <Music className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white">Peça sua Música</h1>
                <p className="text-blue-200 mt-2">Escolha o que você quer ouvir na Rádio Treze de Maio.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Ex: João da Silva"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14} /> Bairro/Cidade</label>
                        <input
                            required
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Ex: Centro, Treze de Maio"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantor/Banda</label>
                        <input
                            required
                            type="text"
                            value={formData.artist}
                            onChange={(e) => setFormData({...formData, artist: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Ex: Zezé Di Camargo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Música</label>
                        <input
                            required
                            type="text"
                            value={formData.song}
                            onChange={(e) => setFormData({...formData, song: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Ex: É o Amor"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recado (Opcional)</label>
                    <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Mande um abraço para..."
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition transform hover:-translate-y-1 shadow-md"
                >
                    Enviar Pedido
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Requests;