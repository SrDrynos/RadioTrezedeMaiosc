import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { SiteSettings, ContactMessage } from '../../types';
import { Phone, Mail, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSettings(db.getSettings());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMessage: ContactMessage = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        message: formData.message,
        date: new Date().toISOString()
    };
    db.addMessage(newMessage);
    setSent(true);
    setFormData({ name: '', email: '', message: '' });
  };

  if (!settings) return null;

  return (
    <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-blue-900 text-center mb-12">Fale Conosco</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {/* Info Card */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Informações de Contato</h3>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Endereço</p>
                                    <p className="text-gray-600">{settings.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Telefone / WhatsApp</p>
                                    <p className="text-gray-600">{settings.phone}</p>
                                    <p className="text-gray-600">{settings.whatsapp}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">E-mail</p>
                                    <p className="text-gray-600">{settings.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-200 h-64 rounded-xl overflow-hidden shadow-inner">
                        {/* Static Map Placeholder since we can't key a real Gmaps */}
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src="https://maps.google.com/maps?q=Treze%20de%20Maio%20SC&t=&z=13&ie=UTF8&iwloc=&output=embed"
                            title="Mapa Treze de Maio"
                        ></iframe>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Envie uma Mensagem</h3>
                    {sent ? (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Sucesso!</strong>
                            <span className="block sm:inline"> Sua mensagem foi enviada. Entraremos em contato em breve.</span>
                            <button onClick={() => setSent(false)} className="underline text-sm mt-2">Enviar nova mensagem</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                            >
                                Enviar
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Contact;