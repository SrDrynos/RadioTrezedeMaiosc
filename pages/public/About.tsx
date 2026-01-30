import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { SiteSettings } from '../../types';

const About: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setSettings(db.getSettings());
  }, []);

  if (!settings) return null;

  return (
    <div className="bg-white py-16">
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">Sobre a Rádio</h1>
                <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                    <img src={settings.aboutImageUrl} alt="Estúdio da Rádio" className="w-full h-96 object-cover" />
                </div>
                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="whitespace-pre-wrap leading-relaxed">{settings.aboutText}</p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-6 bg-gray-50 rounded-xl">
                        <h3 className="text-xl font-bold text-blue-800 mb-2">Missão</h3>
                        <p className="text-sm text-gray-600">Informar e entreter com responsabilidade e respeito à comunidade.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-xl">
                        <h3 className="text-xl font-bold text-blue-800 mb-2">Visão</h3>
                        <p className="text-sm text-gray-600">Ser referência em comunicação regional e integração social.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-xl">
                        <h3 className="text-xl font-bold text-blue-800 mb-2">Valores</h3>
                        <p className="text-sm text-gray-600">Ética, Verdade, Comunidade, Fé e Tradição.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default About;