
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { SiteSettings } from '../../types';
import { Mic, Radio, Signal, Music2 } from 'lucide-react';

const About: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setSettings(db.getSettings());
  }, []);

  if (!settings) return null;

  // COMPONENTE DE ARTE VISUAL (CSS ART)
  // Substitui a imagem quando ela não existe ou falha
  const StudioArtPlaceholder = () => (
    <div className="w-full h-96 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border-4 border-white/10 group">
        
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Animated Sound Waves */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[300px] border border-white/10 rounded-full animate-ping opacity-20 absolute"></div>
            <div className="w-[400px] h-[400px] border border-white/5 rounded-full animate-ping animation-delay-1000 opacity-10 absolute"></div>
        </div>

        {/* Central Icon Composition */}
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-6 transform group-hover:scale-110 transition duration-500">
                <Mic className="text-blue-900 w-12 h-12" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase drop-shadow-lg text-center px-4">
                {settings.radioName}
            </h2>
            
            <div className="flex items-center gap-3 mt-4 text-blue-200 font-medium tracking-widest uppercase text-sm">
                <span className="flex items-center gap-1"><Radio size={16} /> Estúdio Digital</span>
                <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                <span className="flex items-center gap-1"><Signal size={16} /> Ao Vivo</span>
                <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                <span className="flex items-center gap-1"><Music2 size={16} /> 24 Horas</span>
            </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="absolute bottom-0 w-full h-2 bg-gradient-to-r from-blue-900 via-yellow-400 to-blue-900"></div>
    </div>
  );

  return (
    <div className="bg-white py-16 animate-fade-in">
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">Quem Somos</h1>
                
                <div className="mb-10 rounded-2xl overflow-hidden shadow-xl bg-gray-100">
                    {/* Lógica: Se tiver imagem E não deu erro, mostra a foto. Senão, mostra a Arte. */}
                    {settings.aboutImageUrl && !imageError ? (
                        <img 
                            src={settings.aboutImageUrl} 
                            alt="Estúdio da Rádio" 
                            className="w-full h-96 object-cover transform hover:scale-105 transition duration-700" 
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <StudioArtPlaceholder />
                    )}
                </div>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-6 leading-relaxed text-justify font-sans">
                    <p>
                        A <strong>Rádio Treze de Maio</strong> é uma rádio online independente, criada com o propósito de dar voz à comunidade e conectar Treze de Maio ao mundo por meio da comunicação digital. Nosso compromisso é informar, entreter e valorizar a cultura local, regional e nacional, sempre com responsabilidade, proximidade e credibilidade.
                    </p>
                    <p>
                        Com uma programação diversificada, levamos ao ar música de qualidade, notícias, entrevistas, prestação de serviço, entretenimento e conteúdos especiais que refletem o dia a dia da nossa cidade e região. A Rádio Treze de Maio é um espaço aberto à comunidade, artistas locais, empreendedores e lideranças locais.
                    </p>
                    
                    <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600 my-8 shadow-sm">
                        <p className="font-medium text-blue-900 m-0">
                            A rádio integra o <strong>Hub de Streaming Fluxx Stream</strong>, uma plataforma de streaming e tecnologia digital responsável pela transmissão, distribuição de conteúdo e gestão de mídia digital, garantindo estabilidade, qualidade de áudio e alcance multiplataforma.
                        </p>
                    </div>

                    <p>
                        Por meio da Fluxx Stream, a Rádio Treze de Maio faz parte do <strong>Grupo Córtex Hold</strong>, um ecossistema de comunicação e inovação voltado ao desenvolvimento de projetos de mídia, rádio online, TV digital, shop (e-commerce), produção e distribuição de conteúdo, token próprio em criptomoeda, criação de sites, soluções financeiras e soluções criativas.
                    </p>
                    <p>
                        Mais do que uma rádio, somos um ponto de encontro de vozes, ideias e histórias.
                    </p>
                    <p className="text-xl font-bold text-blue-900 text-center mt-10 italic border-t border-gray-100 pt-6">
                        "Rádio Treze de Maio — a voz da nossa cidade, conectada com você."
                    </p>
                </div>

                {/* Values Section */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-8 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-xl">M</div>
                        <h3 className="text-xl font-bold text-blue-800 mb-2">Missão</h3>
                        <p className="text-sm text-gray-600">Dar voz à comunidade e conectar Treze de Maio ao mundo com informação e entretenimento.</p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                         <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-xl">V</div>
                        <h3 className="text-xl font-bold text-blue-800 mb-2">Visão</h3>
                        <p className="text-sm text-gray-600">Ser referência em comunicação digital regional, integrando inovação e tradição.</p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                         <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-xl">V</div>
                        <h3 className="text-xl font-bold text-blue-800 mb-2">Valores</h3>
                        <p className="text-sm text-gray-600">Responsabilidade, Proximidade, Credibilidade, Cultura Local e Inovação.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default About;
