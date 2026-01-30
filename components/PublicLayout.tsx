
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, Youtube, Phone, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { db } from '../services/db';
import { SiteSettings } from '../types';
import { RadioLogo } from './RadioLogo';

const PublicLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.8);
  const location = useLocation();

  useEffect(() => {
    // Initialize DB and load settings
    db.init();
    const loadedSettings = db.getSettings();
    setSettings(loadedSettings);

    // Setup Audio
    const newAudio = new Audio(loadedSettings.streamUrl);
    newAudio.preload = 'none';
    setAudio(newAudio);

    // Cleanup on unmount
    return () => {
      if (newAudio) {
        newAudio.pause();
        newAudio.src = '';
      }
    };
  }, []);

  // Update audio source if settings change (e.g. from Admin)
  useEffect(() => {
    const currentSettings = db.getSettings();
    if (audio && currentSettings.streamUrl !== audio.src) {
        const wasPlaying = !audio.paused;
        audio.src = currentSettings.streamUrl;
        if(wasPlaying) audio.play().catch(e => console.error("Stream error", e));
    }
  }, [location.pathname, audio]); // Check on nav

  // NEW: Server-Side Tracking via PHP
  const trackListener = async () => {
      // Check session storage to avoid spamming the tracker on every play/pause in same session
      if (sessionStorage.getItem('radio_tracked_session')) return;

      try {
          const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'Celular' : 'Computador';
          // Calls the PHP script in the public folder
          const response = await fetch(`./tracker.php?device=${deviceType}`);
          
          if (response.ok) {
              const result = await response.json();
              if (result.success) {
                  console.log("Ouvinte rastreado via servidor:", result.data.city);
                  sessionStorage.setItem('radio_tracked_session', 'true');
              }
          }
      } catch (e) {
          console.warn("Tracking indisponível (Dev mode ou erro de rede):", e);
      }
  };

  const togglePlay = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error("Playback failed:", error);
        alert("Não foi possível iniciar o player. Verifique sua conexão.");
      });
      // Trigger Tracking
      trackListener();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleVolume = () => {
    if(!audio) return;
    if (audio.volume > 0) {
        audio.volume = 0;
        setVolume(0);
    } else {
        audio.volume = 0.8;
        setVolume(0.8);
    }
  }

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  if (!settings) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50 pb-24 relative">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2 text-sm hidden md:block border-b border-blue-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-2 text-green-400 font-bold"><Phone size={14} /> {settings.phone}</span>
            <span className="text-yellow-400 font-bold tracking-widest text-xs">A VOZ DE TREZE DE MAIO</span>
          </div>
          <div className="flex space-x-4">
            <a href={settings.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400"><Facebook size={16} /></a>
            <a href={settings.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400"><Instagram size={16} /></a>
            <a href="#" className="hover:text-yellow-400 opacity-50 cursor-default" title="Em breve"><Youtube size={16} /></a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center relative z-50 bg-white">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 group hover:scale-105 transition duration-300">
             <RadioLogo src={settings.logoUrl} className="h-20 md:h-24 w-auto drop-shadow-md py-1" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 font-bold text-sm uppercase tracking-wide text-gray-700 items-center">
            <Link to="/" className={`hover:text-blue-600 transition ${location.pathname === '/' ? 'text-blue-600' : ''}`}>Início</Link>
            <Link to="/noticias" className={`hover:text-blue-600 transition ${location.pathname === '/noticias' ? 'text-blue-600' : ''}`}>Notícias</Link>
            <Link to="/programacao" className={`hover:text-blue-600 transition ${location.pathname === '/programacao' ? 'text-blue-600' : ''}`}>Programação</Link>
            <Link to="/pedidos" className={`hover:text-blue-600 transition ${location.pathname === '/pedidos' ? 'text-blue-600' : ''}`}>Pedidos</Link>
            <Link to="/a-radio" className={`hover:text-blue-600 transition ${location.pathname === '/a-radio' ? 'text-blue-600' : ''}`}>Quem Somos</Link>
            <Link to="/contato" className={`hover:text-blue-600 transition ${location.pathname === '/contato' ? 'text-blue-600' : ''}`}>Contato</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-blue-900 focus:outline-none">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t p-4 flex flex-col space-y-3 shadow-lg relative z-50 animate-fade-in">
            <Link to="/" className="block py-2 text-gray-700 font-bold uppercase border-b border-gray-100">Início</Link>
            <Link to="/noticias" className="block py-2 text-gray-700 font-bold uppercase border-b border-gray-100">Notícias</Link>
            <Link to="/programacao" className="block py-2 text-gray-700 font-bold uppercase border-b border-gray-100">Programação</Link>
            <Link to="/pedidos" className="block py-2 text-gray-700 font-bold uppercase border-b border-gray-100">Pedidos Musicais</Link>
            <Link to="/a-radio" className="block py-2 text-gray-700 font-bold uppercase border-b border-gray-100">Quem Somos</Link>
            <Link to="/contato" className="block py-2 text-gray-700 font-bold uppercase">Contato</Link>
          </nav>
        )}
      </header>

      {/* Backdrop Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-blue-900 to-black text-white pt-12 pb-28 md:pb-32 border-t-4 border-yellow-400">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <div className="mb-6">
                     <RadioLogo src={settings.logoUrl} className="h-28 w-auto" />
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">A Voz de Treze de Maio para o mundo. Levando nossa cultura, nossa fé e o melhor da música para onde você estiver.</p>
                <div className="flex space-x-3">
                   <a href={settings.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center cursor-pointer hover:bg-yellow-400 hover:text-blue-900 transition"><Facebook size={18} /></a>
                   <a href={settings.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center cursor-pointer hover:bg-yellow-400 hover:text-blue-900 transition"><Instagram size={18} /></a>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-4 text-green-400 uppercase tracking-wide">Links Rápidos</h3>
                <ul className="space-y-2 text-gray-300 text-sm font-medium">
                    <li><Link to="/a-radio" className="hover:text-yellow-400 transition">Quem Somos</Link></li>
                    <li><Link to="/noticias" className="hover:text-yellow-400 transition">Notícias Locais</Link></li>
                    <li><Link to="/programacao" className="hover:text-yellow-400 transition">Nossa Grade</Link></li>
                    <li><Link to="/pedidos" className="hover:text-yellow-400 transition">Peça sua Música</Link></li>
                    <li><Link to="/contato" className="hover:text-yellow-400 transition">Contato</Link></li>
                    <li><Link to="/admin" className="hover:text-yellow-400 transition opacity-50">Área Administrativa</Link></li>
                </ul>
            </div>
            <div>
                 <h3 className="text-lg font-bold mb-4 text-green-400 uppercase tracking-wide">Contato</h3>
                 <p className="text-gray-300 text-sm mb-2">{settings.address}</p>
                 <p className="text-gray-300 text-sm mb-2 flex items-center gap-2"><Phone size={14} className="text-yellow-400"/> {settings.phone}</p>
                 <p className="text-gray-300 text-sm flex items-center gap-2"><span className="text-yellow-400">@</span> {settings.email}</p>
            </div>
        </div>
        <div className="border-t border-blue-800 mt-8 pt-6 text-center text-xs text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} {settings.radioName}. Todos os direitos reservados.
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/55${settings.whatsapp.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 md:bottom-28 md:right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-40 border-2 border-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </a>

      {/* Persistent Audio Player Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-blue-900 text-white border-t-4 border-yellow-400 shadow-2xl z-50 h-20 md:h-24">
        {/* CSS Keyframes for Equalizer */}
        <style>{`
          @keyframes equalizer {
            0% { height: 10%; }
            50% { height: 100%; }
            100% { height: 10%; }
          }
        `}</style>

        <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={togglePlay}
                    className={`w-12 h-12 md:w-14 md:h-14 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 shadow-lg hover:bg-white transition-all duration-300 transform ${isPlaying ? 'scale-105 ring-4 ring-yellow-400/50' : 'hover:scale-105'}`}
                >
                    {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" className="ml-1" size={24} />}
                </button>
                <div className="hidden md:block">
                    <p className="text-sm font-bold uppercase mb-0.5">{settings.radioName}</p>
                    <p className="text-xs text-green-400 font-black tracking-widest uppercase">
                      {isPlaying ? <span className="animate-pulse">● AO VIVO</span> : 'PAUSADO'}
                    </p>
                </div>
            </div>

            <div className="flex-1 mx-4 md:mx-12 flex justify-center">
                 {/* Visualizer simulation */}
                 <div className="flex items-end gap-1 h-10">
                    {[...Array(16)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 md:w-1.5 bg-gradient-to-t from-green-400 to-yellow-300 rounded-t-[1px] transition-all duration-300 ${isPlaying ? 'opacity-100' : 'opacity-40'}`} 
                          style={{ 
                             height: isPlaying ? '40%' : '10%',
                             animation: isPlaying ? `equalizer ${0.4 + (i % 5) * 0.15 + (i % 3) * 0.05}s ease-in-out infinite alternate` : 'none',
                             animationDelay: `-${(i * 0.1)}s`
                          }}
                        ></div>
                    ))}
                 </div>
            </div>

            <div className="flex items-center gap-2">
                 <button onClick={toggleVolume} className="text-gray-300 hover:text-white">
                    {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                 </button>
                 <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                        const newVol = parseFloat(e.target.value);
                        setVolume(newVol);
                        if(audio) audio.volume = newVol;
                    }}
                    className="w-16 md:w-24 accent-green-400 cursor-pointer h-1 rounded-full appearance-none bg-blue-950"
                 />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;
