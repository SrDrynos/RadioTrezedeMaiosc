
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { ListenerSession } from '../../types';
import { 
    Music, Users, Activity, Radio, Mic2, Server, MapPin, Laptop, Signal, Navigation, Target, Globe, Wifi, RefreshCw, AlertTriangle, Monitor, Smartphone, Search
} from 'lucide-react';

interface StreamData {
  status: string;
  porta: string;
  porta_dj: string;
  ip: string;
  ouvintes_conectados: string;
  titulo: string;
  plano_ouvintes: string;
  plano_bitrate: string;
  musica_atual: string;
  proxima_musica: string;
  genero: string;
  capa_musica: string;
}

interface LocationData {
  method: 'GPS' | 'IP';
  lat: number;
  lng: number;
  accuracy?: number;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  region: string;
  full_address: string;
  isp?: string;
  ip?: string; // Tracking the IP of the focus target
}

const AdminDashboard: React.FC = () => {
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  
  // Advanced Tracking State
  const [location, setLocation] = useState<LocationData | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<'idle' | 'searching' | 'locked' | 'error' | 'denied'>('idle');
  const [trackingErrorMsg, setTrackingErrorMsg] = useState('');
  
  // Listeners Data
  const [listeners, setListeners] = useState(0);
  const [peakListeners, setPeakListeners] = useState(0);
  const [historyData, setHistoryData] = useState<number[]>(new Array(30).fill(0));
  
  // Web Sessions (Real Tracked Users from Server)
  const [activeSessions, setActiveSessions] = useState<ListenerSession[]>([]);

  useEffect(() => {
    // 1. Start Systems
    initializeGPS();
    fetchStreamData();

    // 3. Loops
    const streamInterval = setInterval(fetchStreamData, 10000); // 10s updates
    
    return () => {
        clearInterval(streamInterval);
    };
  }, []);

  const initializeGPS = () => {
      setTrackingStatus('searching');
      setTrackingErrorMsg('');

      if (!navigator.geolocation) {
          setTrackingStatus('error');
          setTrackingErrorMsg('Seu navegador não suporta geolocalização GPS.');
          fallbackToIP();
          return;
      }

      navigator.geolocation.getCurrentPosition(
          async (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              
              // Reverse Geocoding (Lat/Lng -> Endereço Real)
              try {
                  // Using OpenStreetMap Nominatim for detailed address
                  const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                  const geoData = await geoRes.json();
                  const addr = geoData.address || {};
                  
                  // Ensure all fields are strings to avoid Object Rendering Error
                  const street = String(addr.road || addr.pedestrian || addr.street || "Rua não identificada");
                  const houseNumber = String(addr.house_number || "S/N");
                  const suburb = String(addr.suburb || addr.neighbourhood || addr.residential || "");
                  const city = String(addr.city || addr.town || addr.village || "");
                  const state = String(addr.state_code || addr.state || "");

                  const fullAddress = String(geoData.display_name || "");

                  setLocation({
                      method: 'GPS',
                      lat: latitude,
                      lng: longitude,
                      accuracy: Math.round(accuracy),
                      street: street,
                      number: houseNumber,
                      neighborhood: suburb,
                      city: city,
                      region: state,
                      full_address: fullAddress,
                      isp: 'Conexão Local Segura'
                  });
                  setTrackingStatus('locked');
              } catch (e) {
                  console.error("Erro na conversão de endereço", e);
                  // Fallback se a API de endereço falhar, mas temos coordenadas
                  setLocation({
                      method: 'GPS',
                      lat: latitude,
                      lng: longitude,
                      accuracy: Math.round(accuracy),
                      street: `Lat: ${latitude.toFixed(5)}`,
                      number: "",
                      neighborhood: `Lng: ${longitude.toFixed(5)}`,
                      city: "Coordenadas Brutas",
                      region: "",
                      full_address: "Endereço não pôde ser resolvido pelo servidor de mapas.",
                      isp: 'Conexão Local Segura'
                  });
                  setTrackingStatus('locked');
              }
          },
          (error) => {
              console.warn("Erro GPS:", error);
              if (error.code === 1) {
                  setTrackingStatus('denied');
                  setTrackingErrorMsg('Permissão de GPS negada pelo usuário.');
              } else if (error.code === 2) {
                  setTrackingStatus('error');
                  setTrackingErrorMsg('Sinal de GPS indisponível no local.');
              } else {
                  setTrackingStatus('error');
                  setTrackingErrorMsg('Tempo limite esgotado ao buscar satélites.');
              }
              fallbackToIP();
          },
          { 
              enableHighAccuracy: true, // CRITICAL: Forces GPS hardware usage
              timeout: 20000, 
              maximumAge: 0 
          }
      );
  };

  const fallbackToIP = async () => {
      try {
          const ipRes = await fetch('https://ipwho.is/');
          const ipData = await ipRes.json();
          
          if (ipData.success) {
              setLocation({
                  method: 'IP',
                  lat: ipData.latitude,
                  lng: ipData.longitude,
                  accuracy: 5000, // IP is imprecise
                  street: "Localização Aproximada (Baseada em IP)",
                  number: "",
                  neighborhood: "",
                  city: String(ipData.city || ""),
                  region: String(ipData.region || ""),
                  full_address: `${ipData.city} - ${ipData.region}, ${ipData.country}`,
                  isp: String(ipData.connection?.isp || ipData.isp || "Provedor Desconhecido")
              });
          }
      } catch (e) {
          console.error("IP Geo failed", e);
      }
  };

  // Allows admin to click on a listener and see their location on map
  const trackListener = (session: ListenerSession) => {
      setLocation({
          method: 'IP',
          lat: session.lat,
          lng: session.lng,
          accuracy: 1000,
          street: "Ouvinte Web",
          number: "IP Rastreável",
          neighborhood: "Acesso via Site",
          city: String(session.city),
          region: String(session.region),
          full_address: `${session.city} - ${session.region}, ${session.country}`,
          isp: String(session.isp),
          ip: session.ip
      });
      // Scroll top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchStreamData = async () => {
    try {
        const apiUrl = 'http://radio.linknacional.com/api-json/Njk4Misx';
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
        
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Network error');
        
        const rawData = await res.json();
        
        // --- FETCH REAL LISTENERS FROM PHP SERVER LOG ---
        let sessions: ListenerSession[] = [];
        try {
            // Try fetching local JSON (Generated by PHP)
            const logRes = await fetch('./listeners_log.json?t=' + Date.now()); // Prevent Cache
            if (logRes.ok) {
                sessions = await logRes.json();
            } else {
                // Fallback to localStorage (Dev Mode or First Run)
                sessions = db.getSessions();
            }
        } catch (e) {
            console.warn("Could not fetch server logs, using local", e);
            sessions = db.getSessions();
        }

        // Sanitization of Server Data
        const safeSessions = sessions.map(s => ({
            ...s,
            city: String(s.city || 'Desconhecido'),
            region: String(s.region || ''),
            country: String(s.country || ''),
            isp: String(s.isp || 'Provedor Oculto')
        }));

        setActiveSessions(safeSessions);

        // SANITIZATION: Ensure NO objects are passed to state to prevent React Error #31
        const safeData: StreamData = {
            status: String(rawData.status || 'OFFLINE'),
            porta: String(rawData.porta || ''),
            porta_dj: String(rawData.porta_dj || ''),
            ip: String(rawData.ip || ''),
            ouvintes_conectados: String(rawData.ouvintes_conectados || '0'),
            titulo: String(rawData.titulo || ''),
            plano_ouvintes: String(rawData.plano_ouvintes || ''),
            plano_bitrate: String(rawData.plano_bitrate || ''),
            // Handle cases where API returns {} for empty image/music fields
            musica_atual: (typeof rawData.musica_atual === 'object' ? '' : String(rawData.musica_atual || '')),
            proxima_musica: (typeof rawData.proxima_musica === 'object' ? '' : String(rawData.proxima_musica || '')),
            genero: String(rawData.genero || ''),
            capa_musica: (typeof rawData.capa_musica === 'object' ? '' : String(rawData.capa_musica || ''))
        };
        
        setStreamData(safeData);

        // Logic: Listener Count is max of (Stream Reported) vs (Web Sessions)
        // Usually Stream Report includes web sessions, but just in case.
        const streamCount = parseInt(safeData.ouvintes_conectados) || 0;
        const total = Math.max(streamCount, safeSessions.length);

        setListeners(total);
        if (total > peakListeners) setPeakListeners(total);

        setHistoryData(prev => [...prev.slice(1), total]);

    } catch (error) {
        console.error("Stream Fetch Error", error);
    }
  };

  // SVG Chart Generators
  const getPolylinePoints = (data: number[], width: number, height: number) => {
      const max = Math.max(...data, 5) * 1.2;
      const step = width / (data.length - 1);
      return data.map((val, i) => `${i * step},${height - (val / max) * height}`).join(' ');
  };

  // Safe accessor for status to prevent crash
  const streamStatus = String(streamData?.status || 'OFFLINE');
  const isOnline = streamStatus.toLowerCase().includes('ligada') || streamStatus.toLowerCase().includes('transmitindo');

  // Calculate "Hidden" listeners (Stream Count - Identified Web Sessions)
  const unknownListenersCount = Math.max(0, listeners - activeSessions.length);

  return (
    <div className="space-y-6 font-sans pb-10">
        
        {/* TOP STATUS BAR */}
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-700">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className={`w-3 h-3 rounded-full absolute top-0 right-0 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <Radio size={24} className="text-slate-300" />
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-none tracking-tight">CENTRAL DE COMANDO</h1>
                    <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                        <Server size={10} /> SERVER: {streamData?.ip || '...'} : {streamData?.porta || '...'}
                    </p>
                </div>
            </div>
            
            <div className="flex gap-4 text-center">
                <div className="px-4 border-r border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Status da Rádio</div>
                    <div className={`font-bold text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                        {streamStatus.toUpperCase()}
                    </div>
                </div>
                <div className="px-4">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bitrate</div>
                    <div className="font-bold text-blue-400 text-sm">{streamData?.plano_bitrate || '128'} kbps</div>
                </div>
            </div>
        </div>

        {/* MAIN TRACKING AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT: MAP & LOCATION */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase">
                        <Target size={18} className="text-red-600" /> 
                        Rastreamento em Mapa
                    </h3>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={initializeGPS} 
                            className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-600 transition"
                            title="Voltar para Minha Localização"
                        >
                            <RefreshCw size={14} className={trackingStatus === 'searching' ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="relative flex-1 bg-slate-200 w-full group">
                    {location ? (
                        <>
                            {/* GOOGLE MAPS IFRAME */}
                            <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight={0} 
                                marginWidth={0} 
                                title="Tracking Map"
                                // Dynamic Zoom: IP locations (1000m accuracy) get zoom 13, GPS gets 19
                                src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=${location.accuracy && location.accuracy > 100 ? 13 : 19}&output=embed`}
                                className="filter grayscale-[20%] group-hover:grayscale-0 transition duration-700"
                            ></iframe>
                            
                            {/* PRECISION OVERLAY */}
                            <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg backdrop-blur-md border border-white/10 shadow-xl max-w-xs">
                                <div className="text-[10px] text-green-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                    <Signal size={10} /> Precisão: {location.accuracy ? `+/- ${location.accuracy}m` : 'Baixa (IP)'}
                                </div>
                                <div className="font-mono text-xl font-bold tracking-tight text-white mb-1">
                                    {location.lat.toFixed(6)}
                                </div>
                                <div className="font-mono text-xl font-bold tracking-tight text-white">
                                    {location.lng.toFixed(6)}
                                </div>
                            </div>

                            {/* ADDRESS CARD */}
                            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl p-5 border-t-4 border-blue-600 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                             <div className="bg-blue-100 text-blue-700 p-1 rounded">
                                                <MapPin size={16} />
                                             </div>
                                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                 {location.method === 'GPS' ? 'Meu GPS' : 'Local do Ouvinte (IP)'}
                                             </span>
                                        </div>
                                        
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 leading-none">
                                                {location.street} {location.number ? `, ${location.number}` : ''}
                                            </h2>
                                            <p className="text-slate-600 font-medium mt-1">
                                                {location.neighborhood} • {location.city}/{location.region}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="hidden md:block text-right border-l border-slate-200 pl-6">
                                        <div className="text-xs text-slate-400 mb-1">PROVEDOR / ISP</div>
                                        <div className="font-bold text-slate-700">{location.isp || 'Detectando...'}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-100">
                             <div className="relative">
                                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                                <Navigation size={48} className="relative z-10 text-blue-500 animate-pulse" />
                             </div>
                             <p className="mt-4 font-bold text-slate-500">Inicializando Mapa...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: STATS & GRAPH */}
            <div className="space-y-6 flex flex-col">
                
                {/* BIG LISTENER COUNTER */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden flex-1 min-h-[160px] flex flex-col justify-center">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-blue-100 font-bold text-xs uppercase tracking-widest border border-blue-400/30 px-2 py-1 rounded">Ao Vivo</span>
                            <Users className="text-blue-200" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black tracking-tighter">{listeners}</span>
                            <span className="text-lg text-blue-200 font-medium">Ouvintes</span>
                        </div>
                        <div className="mt-4 text-xs text-blue-200 font-medium flex items-center gap-2 bg-black/20 w-fit px-3 py-1.5 rounded-full">
                            <Activity size={12} /> Pico da Sessão: <span className="text-white font-bold">{peakListeners}</span>
                        </div>
                    </div>
                </div>

                {/* GRAPH */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex-1">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Audiência (Tempo Real)</h4>
                    <div className="h-28 w-full flex items-end">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <polyline
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="2"
                                points={getPolylinePoints(historyData, 100, 100)}
                                vectorEffect="non-scaling-stroke"
                            />
                            <path 
                                d={`M0,100 ${getPolylinePoints(historyData, 100, 100).replace(/ /g, ' L')} L100,100 Z`} 
                                fill="rgba(37, 99, 235, 0.1)" 
                            />
                        </svg>
                    </div>
                </div>

                {/* NOW PLAYING MINI */}
                <div className="bg-slate-900 rounded-xl shadow-md p-4 flex items-center gap-4 border border-slate-700 text-white">
                     <div className="w-14 h-14 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 relative border border-slate-600">
                        <img 
                            src={streamData?.capa_musica && streamData.capa_musica !== 'sem_imagem' ? streamData.capa_musica : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400'} 
                            className="w-full h-full object-cover opacity-80"
                            alt=""
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                     </div>
                     <div className="overflow-hidden">
                         <div className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">Tocando Agora</div>
                         <div className="font-bold text-sm truncate leading-tight text-slate-100">{streamData?.musica_atual || 'Carregando...'}</div>
                         <div className="text-xs text-slate-500 mt-1">{streamData?.genero || 'Ao Vivo'}</div>
                     </div>
                </div>
            </div>
        </div>

        {/* DETAILED LISTENER LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Globe size={20} className="text-blue-600" />
                        Mapa de Conexões Ativas
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Sessões monitoradas via Site & Servidor de Streaming</p>
                </div>
            </div>

            <table className="w-full text-left">
                <thead className="bg-white text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Dispositivo / Tipo</th>
                        <th className="px-6 py-4">Endereço / Cidade</th>
                        <th className="px-6 py-4">Status de Rastreio</th>
                        <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    
                    {/* 1. ACTIVE WEB SESSIONS (REAL TRACKING FROM PHP LOGS) */}
                    {activeSessions.map((session, idx) => (
                         <tr key={session.id} className="hover:bg-blue-50 transition cursor-pointer group" onClick={() => trackListener(session)}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-700 shadow-sm">
                                        {session.device === 'Celular' ? <Smartphone size={18} /> : <Monitor size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-800">Ouvinte Web #{idx + 1}</div>
                                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            Acesso pelo Site
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">
                                    {session.city}, {session.region}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    ISP: {session.isp}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold">
                                    <Target size={12} /> RASTREADO (IP)
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="inline-flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-bold transition">
                                    <Search size={12} /> RASTREAR
                                </button>
                            </td>
                        </tr>
                    ))}

                    {/* 2. UNKNOWN LISTENERS (STREAMING SERVER LEFTOVERS) */}
                    {Array.from({ length: Math.max(0, unknownListenersCount) }).map((_, idx) => (
                        <tr key={`unknown-${idx}`} className="hover:bg-slate-50 transition opacity-60">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                                        <Radio size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-600">Ouvinte Remoto #{idx + 1}</div>
                                        <div className="text-xs text-slate-400 font-mono">App Externo / Player Direto</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-400 italic">Localização Oculta</div>
                                <div className="text-xs text-slate-400 mt-1 max-w-[200px] leading-tight">
                                    Conectado diretamente ao servidor de áudio (Sem GPS).
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold">
                                    <Server size={12} /> STREAM
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="inline-flex items-center gap-1 text-slate-400 font-bold text-xs">
                                    <Signal size={12} /> ONLINE
                                </div>
                            </td>
                        </tr>
                    ))}

                    {listeners === 0 && (
                         <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400">
                                Nenhuma conexão ativa detectada no momento.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AdminDashboard;
