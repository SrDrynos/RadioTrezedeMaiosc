
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import { NewsItem, SiteSettings } from '../../types';
import { Calendar, ChevronRight, Radio } from 'lucide-react';
import { RadioLogo } from '../../components/RadioLogo';
import { SponsorsCarousel } from '../../components/SponsorsCarousel';

const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = () => {
        setNews(db.getNews(true).slice(0, 3)); // Get top 3 published news
        const s = db.getSettings();
        setSettings(s);
    };

    loadData();

    window.addEventListener('radio-settings-update', loadData);
    window.addEventListener('storage', loadData);

    return () => {
        window.removeEventListener('radio-settings-update', loadData);
        window.removeEventListener('storage', loadData);
    };
  }, []);

  const handleImageError = (id: string) => {
      setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  if (!settings) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="animate-fade-in bg-gray-50">
      {/* 
        HERO SECTION - STATIC ONLY (Logo + Image)
      */}
      <section className="relative h-auto min-h-[500px] md:h-[600px] overflow-hidden bg-blue-900 pb-10">
        
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1920&auto=format&fit=crop" 
                alt="Paisagem Treze de Maio" 
                className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-800/20 to-green-900/30"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/90 to-transparent"></div>
        </div>

        {/* Content Layer */}
        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-center items-center pt-20">
            
            <div className="relative w-full max-w-6xl flex justify-between items-end h-full pb-10 md:pb-16 mt-10">
                
                {/* Imagem Esquerda (Castelo) */}
                {settings.heroLeftImageUrl && (
                    <div className="hidden md:block w-1/4 relative self-end mb-4 opacity-95 hover:scale-105 transition duration-700">
                        <img 
                            src={settings.heroLeftImageUrl} 
                            alt="Castelo Belvedere" 
                            className="w-full h-auto object-contain drop-shadow-2xl transform -rotate-3"
                            style={{ filter: 'contrast(1.1) brightness(1.1)' }}
                        />
                    </div>
                )}

                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 md:-mt-20">
                    <div className="bg-blue-600/80 backdrop-blur-sm text-white px-4 py-1 rounded-full mb-6 transform -rotate-1 border border-blue-400 shadow-lg">
                        <span className="font-bold text-sm md:text-base tracking-widest uppercase">Ouça Online 24 Horas</span>
                    </div>
                    <div className="relative mb-6 transform hover:scale-105 transition duration-500">
                        <RadioLogo src={settings.logoUrl} className="w-80 md:w-[450px] h-auto drop-shadow-2xl" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-blue-100 uppercase tracking-widest drop-shadow-md">
                        Música • Notícias • Comunidade
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button onClick={() => (document.querySelector('button[title="Play"]') as HTMLElement)?.click()} className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 font-black uppercase rounded-full shadow-lg hover:scale-105 transition transform flex items-center justify-center gap-2">
                            <span className="animate-pulse text-xl">▶</span> Ouvir Agora
                        </button>
                        <Link to="/pedidos" className="px-8 py-3 bg-white/10 backdrop-blur-md border-2 border-white text-white font-bold uppercase rounded-full hover:bg-white hover:text-blue-900 transition flex items-center justify-center">
                            Pedir Música
                        </Link>
                    </div>
                </div>

                {/* Imagem Direita (Santa) */}
                {settings.heroRightImageUrl && (
                    <div className="hidden md:block w-1/4 relative self-end mb-4 hover:scale-105 transition duration-700">
                        <img 
                            src={settings.heroRightImageUrl} 
                            alt="Nossa Senhora de Fátima" 
                            className="w-full h-auto object-contain drop-shadow-2xl transform rotate-3"
                            style={{ filter: 'contrast(1.1) brightness(1.1)' }}
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Bottom Curve Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50"></path>
            </svg>
        </div>
      </section>

      {/* Latest News Section (Existing) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10 border-b-2 border-gray-200 pb-4">
                <div>
                    <span className="text-green-600 font-bold uppercase tracking-wider text-sm">Atualizações</span>
                    <h3 className="text-blue-900 font-black text-3xl italic">Últimas Notícias</h3>
                </div>
                <Link to="/noticias" className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-full transition">Ver todas <ChevronRight size={18} /></Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {news.map(item => {
                    const hasImgError = imgErrors[item.id] || !item.imageUrl;
                    return (
                        <article key={item.id} className="group flex flex-col h-full bg-white shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100">
                            <Link to={`/noticias/${item.id}`} className="h-56 overflow-hidden relative block bg-slate-100">
                                {hasImgError ? (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-800 flex flex-col items-center justify-center text-white/80 p-6 text-center">
                                        <Radio size={48} className="mb-2 opacity-50" />
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Rádio Treze de Maio</span>
                                    </div>
                                ) : (
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.title} 
                                        onError={() => handleImageError(item.id)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none"></div>
                                <span className="absolute bottom-4 left-4 bg-yellow-400 text-blue-900 text-xs font-black px-3 py-1 rounded shadow uppercase tracking-wide z-10">{item.category}</span>
                            </Link>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center text-gray-400 text-xs mb-3 gap-2 font-semibold uppercase">
                                    <Calendar size={14} className="text-green-500" />
                                    <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <Link to={`/noticias/${item.id}`}>
                                    <h4 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors leading-tight">{item.title}</h4>
                                </Link>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">{item.excerpt}</p>
                                <Link to={`/noticias/${item.id}`} className="text-blue-600 font-bold text-sm hover:text-green-600 mt-auto flex items-center gap-1">Ler Mais <ChevronRight size={14} /></Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
      </section>

      {/* Interactive Banners */}
      <section className="py-12 bg-white mb-10">
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-600 z-0"></div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 group-hover:scale-110 transition">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <h4 className="text-2xl font-black italic mb-2 text-yellow-400">ANUNCIE AQUI</h4>
                        <p className="text-blue-100 font-medium">Sua marca na rádio mais ouvida da cidade.</p>
                    </div>
                    <Link to="/contato" className="px-6 py-3 bg-white text-blue-900 font-black rounded-full hover:bg-yellow-400 transition shadow-lg uppercase text-sm">Fale Conosco</Link>
                </div>
            </div>
             <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-700 to-green-500 z-0"></div>
                 <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 group-hover:scale-110 transition">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <h4 className="text-2xl font-black italic mb-2 text-white">MANDE SEU RECADO</h4>
                        <p className="text-green-100 font-medium">Participe da programação ao vivo pelo WhatsApp.</p>
                    </div>
                 <a
                    href={`https://wa.me/55${settings.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 bg-white text-green-700 font-black rounded-full hover:bg-green-900 hover:text-white transition shadow-lg uppercase text-sm"
                 >WhatsApp</a>
                </div>
            </div>
         </div>
      </section>

      {/* NEW: Sponsors Carousel */}
      <SponsorsCarousel />
    </div>
  );
};

export default Home;
