
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { SiteSettings, TVItem } from '../../types';
import { Tv, Radio, AlertTriangle, Volume2, VolumeX, Lock } from 'lucide-react';

const TV: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [playlist, setPlaylist] = useState<TVItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const loadData = () => {
        const s = db.getSettings();
        setSettings(s);
        if (s.tvPlaylist) setPlaylist(s.tvPlaylist);
    };
    loadData();
    window.addEventListener('radio-settings-update', loadData);
    return () => window.removeEventListener('radio-settings-update', loadData);
  }, []);

  const handleNextVideo = () => {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  if (!settings) return null;

  const currentItem = playlist[currentIndex];

  // Extração de ID do YouTube Robusta
  const getYoutubeId = (url: string) => {
      if(!url) return '';
      if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : '';
  }
  
  const videoId = currentItem ? getYoutubeId(currentItem.url) : '';
  const isYoutube = !!videoId; // Detecta se é YT ou Arquivo Nativo
  
  // Configuração para YouTube
  // Controls=0 para dificultar pular pelo player do YT
  const embedUrl = isYoutube 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&fs=1&disablekb=1&origin=${window.location.origin}`
    : '';

  const isOnline = settings.tvEnabled && playlist.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white animate-fade-in pb-20">
      {/* TV Header */}
      <div className="bg-black/50 border-b border-white/10 p-4 sticky top-0 z-20 backdrop-blur-md">
         <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-lg"><Tv size={24} /></div>
                TV Fluxx <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-normal hidden md:inline-block">Transmissão Digital</span>
            </h1>
            {isOnline ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div> AO VIVO
                </div>
            ) : (
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div> OFFLINE
                </div>
            )}
         </div>
      </div>

      <div className="container mx-auto px-4 py-8">
          
          {isOnline ? (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Player Area */}
                <div className="lg:col-span-2 space-y-4">
                     {/* 
                        FLUXX TV PLAYER CONTAINER 
                     */}
                     <div className="bg-black aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative group">
                         
                         {isYoutube ? (
                             // PLAYER YOUTUBE
                             <div className="w-full h-full transform scale-[1.35] origin-center pointer-events-none">
                                <iframe 
                                    key={`${currentItem.id}-${isMuted}`} 
                                    src={embedUrl}
                                    className="w-full h-full"
                                    title="TV Player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    allowFullScreen
                                ></iframe>
                             </div>
                         ) : currentItem?.url ? (
                             // PLAYER NATIVO (MP4/UPLOAD)
                             // Controls removed to prevent skipping
                             <video
                                key={currentItem.id}
                                src={currentItem.url}
                                className="w-full h-full object-contain bg-black"
                                autoPlay
                                muted={isMuted}
                                controls={false} 
                                playsInline
                                onEnded={handleNextVideo}
                                onError={(e) => console.log("Erro no video", e)}
                                style={{ pointerEvents: 'none' }} // Disable clicking on video
                             >
                                 Seu navegador não suporta este vídeo.
                             </video>
                         ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-black">
                                 <AlertTriangle size={48} className="mb-2 text-yellow-500" />
                                 <p>Aguardando sinal...</p>
                             </div>
                         )}

                         {/* Overlays */}
                         <div className="absolute top-4 left-4 flex gap-2 pointer-events-none z-20">
                             {currentItem.type === 'live' && (
                                <div className="bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded shadow backdrop-blur-sm animate-pulse">
                                    ● TRANSMISSÃO AO VIVO
                                </div>
                             )}
                             <div className="bg-blue-600/90 text-white text-xs font-bold px-3 py-1 rounded shadow backdrop-blur-sm">
                                 TV FLUXX
                             </div>
                         </div>

                         {/* Mute/Unmute Control - Top Right (Only Interactive Element) */}
                         <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all cursor-pointer pointer-events-auto"
                            title={isMuted ? "Ativar Som" : "Mudo"}
                         >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                         </button>
                        
                        {/* Bloqueio Visual */}
                        {isMuted && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <div className="bg-black/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 text-white font-bold animate-pulse">
                                    CLIQUE NO ÍCONE DE SOM PARA OUVIR ↗
                                </div>
                            </div>
                        )}
                     </div>

                     <div className="border-l-4 border-blue-600 pl-4">
                         <h2 className="text-2xl font-bold leading-tight">{currentItem.title}</h2>
                         <div className="flex items-center gap-2 mt-2 text-sm">
                             <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded uppercase font-bold text-xs">{currentItem.type}</span>
                             <span className="text-slate-400">Fonte: {currentItem.duration === 'Ao Vivo' ? 'Ao Vivo' : currentItem.duration}</span>
                         </div>
                     </div>
                </div>

                {/* Playlist Sidebar (Non-Interactive EPG style) */}
                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 h-fit max-h-[600px] flex flex-col">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2 text-slate-200">
                            <Radio size={18} /> Grade de Programação
                        </h3>
                        <Lock size={14} className="text-slate-500" title="Grade Fixa" />
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-900">
                        {playlist.map((item, idx) => {
                            const isActive = idx === currentIndex;
                            const isPast = idx < currentIndex;
                            
                            return (
                                <div 
                                    key={item.id}
                                    className={`w-full flex items-center gap-4 p-4 border-b border-white/5 transition-all
                                        ${isActive ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : 'opacity-60 grayscale'}
                                    `}
                                >
                                    {/* Status Column */}
                                    <div className="w-16 flex-shrink-0 text-center">
                                        {isActive ? (
                                            <span className="text-xs font-black text-red-500 animate-pulse block">NO AR</span>
                                        ) : isPast ? (
                                            <span className="text-[10px] font-bold text-slate-600 block">EXIBIDO</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 block">A SEGUIR</span>
                                        )}
                                    </div>

                                    {/* Info Column */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 rounded ${
                                                item.type === 'commercial' ? 'bg-yellow-900/50 text-yellow-500' :
                                                item.type === 'live' ? 'bg-red-900/50 text-red-500' : 'bg-slate-700 text-slate-400'
                                            }`}>
                                                {item.type === 'live' ? 'LIVE' : item.type === 'commercial' ? 'COMERCIAL' : 'VÍDEO'}
                                            </span>
                                        </div>
                                        <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                            {item.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                Fonte: {item.duration}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {playlist.length === 0 && (
                            <div className="p-4 text-center text-xs text-gray-500">
                                Sem programação definida.
                            </div>
                        )}
                    </div>
                </div>

             </div>
          ) : (
             /* OFFLINE STATE */
             <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                 <div className="bg-slate-800 p-8 rounded-full mb-6 relative">
                     <Tv size={64} className="text-slate-600" />
                     <div className="absolute bottom-2 right-2 bg-slate-900 rounded-full p-2 border-4 border-slate-900">
                        <AlertTriangle size={24} className="text-yellow-500" />
                     </div>
                 </div>
                 <h2 className="text-3xl font-bold text-slate-200 mb-2">Sinal de TV Offline</h2>
                 <p className="text-slate-400 max-w-md">
                     Nossa transmissão de vídeo está temporariamente fora do ar.
                 </p>
             </div>
          )}

      </div>
    </div>
  );
};

export default TV;
