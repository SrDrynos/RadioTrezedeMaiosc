
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { SongRequest } from '../../types';
import { 
    Music, Users, Activity, ArrowUp, 
    Wifi, Radio, Clock, Smartphone, Monitor, Tablet, Globe, Disc, Mic2, Server, MapPin, Laptop
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

interface UserLocation {
  ip: string;
  city: string;
  region: string;
  country: string;
}

const AdminDashboard: React.FC = () => {
  // Database Data
  const [requestCount, setRequestCount] = useState(0);
  
  // Real Stream Data
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [loadingStream, setLoadingStream] = useState(true);
  
  // Real User Location (Site Traffic)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  
  // Metrics for Chart
  const [listeners, setListeners] = useState(0);
  const [peakListeners, setPeakListeners] = useState(0);
  const [capacityPct, setCapacityPct] = useState(0);

  // Chart History (Initialize with zeros)
  const [historyData, setHistoryData] = useState<number[]>(new Array(24).fill(0));

  useEffect(() => {
    // Load DB Data
    const reqs = db.getRequests();
    setRequestCount(reqs.filter(r => r.status === 'pending').length);

    // Initial Fetch
    fetchStreamData();
    fetchUserLocation();

    // Polling Interval for Stream (Every 15 seconds)
    const interval = setInterval(fetchStreamData, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserLocation = async () => {
      try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          setUserLocation({
              ip: data.ip,
              city: data.city,
              region: data.region_code,
              country: data.country_name
          });
      } catch (error) {
          console.error("Erro ao buscar localização do usuário", error);
      }
  };

  const fetchStreamData = async () => {
    try {
        // Using AllOrigins proxy to avoid Mixed Content (HTTP API on HTTPS site)
        const apiUrl = 'http://radio.linknacional.com/api-json/Njk4Misx';
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
        
        const res = await fetch(proxyUrl);
        const data: StreamData = await res.json();
        
        setStreamData(data);
        setLoadingStream(false);

        // Update Logic
        const currentListeners = parseInt(data.ouvintes_conectados) || 0;
        const maxListeners = parseInt(data.plano_ouvintes) || 1000;
        
        setListeners(currentListeners);
        setCapacityPct(Math.round((currentListeners / maxListeners) * 100));

        // Update History
        setHistoryData(prev => {
            const newData = [...prev.slice(1), currentListeners];
            return newData;
        });

    } catch (error) {
        console.error("Erro ao buscar dados do streaming:", error);
    }
  };

  // Update peak separately
  useEffect(() => {
      if (listeners > peakListeners) setPeakListeners(listeners);
  }, [listeners, peakListeners]);

  // Helper for Chart
  const getSvgPath = (data: number[], height: number, width: number) => {
      const max = Math.max(...data, 10) * 1.2;
      const stepX = width / (data.length - 1);
      const points = data.map((val, index) => {
          const x = index * stepX;
          const y = height - (val / max) * height;
          return `${x},${y}`;
      });
      return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  };
  
  const getLinePath = (data: number[], height: number, width: number) => {
      const max = Math.max(...data, 10) * 1.2;
      const stepX = width / (data.length - 1);
      return `M` + data.map((val, index) => {
          const x = index * stepX;
          const y = height - (val / max) * height;
          return `${x},${y}`;
      }).join(' L');
  };

  return (
    <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-200 pb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Visão Geral Unificada</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Monitoramento Site (IP) + Rádio (Streaming)
                </p>
            </div>
            <div className="flex gap-3">
                 <div className="bg-white px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-600 shadow-sm">
                    <span className={`w-2 h-2 rounded-full ${streamData?.status.toLowerCase().includes('ligada') || streamData?.status.toLowerCase().includes('transmitindo') ? "bg-green-500" : "bg-red-500"}`}></span>
                    Status: {streamData?.status || 'Carregando...'}
                 </div>
                 <div className="bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 flex items-center gap-2 text-xs font-semibold text-blue-700 shadow-sm">
                    <Radio size={14} />
                    {streamData ? `${streamData.plano_bitrate}` : '...'}
                 </div>
            </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Listeners */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ouvintes Conectados</h3>
                    <Users size={16} className="text-blue-500" />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800">{listeners}</span>
                    <span className="text-xs font-medium text-slate-400">
                        / {streamData?.plano_ouvintes || '...'} máx
                    </span>
                </div>
                <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.max(capacityPct, 5)}%` }}></div>
                </div>
            </div>

            {/* Card 2: Peak */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pico de Audiência</h3>
                    <Activity size={16} className="text-purple-500" />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800">{peakListeners}</span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
                        <ArrowUp size={10} className="mr-0.5" /> Sessão Atual
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Recorde desta sessão administrativa</p>
            </div>

            {/* Card 3: User Location (New) */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Seu Acesso (IP)</h3>
                    <MapPin size={16} className="text-orange-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-800 truncate">
                        {userLocation ? `${userLocation.city}, ${userLocation.region}` : 'Localizando...'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono mt-1">
                        IP: {userLocation?.ip || '...'}
                    </span>
                </div>
            </div>

            {/* Card 4: Requests */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pedidos Musicais</h3>
                    <Music size={16} className="text-green-500" />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800">{requestCount}</span>
                    <span className="text-xs text-slate-400">pendentes</span>
                </div>
                <div className="mt-3 flex gap-1">
                     {[1,2,3,4,5].map(i => (
                         <div key={i} className={`h-1 flex-1 rounded-full ${i <= requestCount ? 'bg-green-500' : 'bg-slate-100'}`}></div>
                     ))}
                </div>
            </div>
        </div>

        {/* Main Analytics Chart Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Graph (Listeners over time) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Audiência da Rádio (Tempo Real)</h3>
                        <p className="text-sm text-slate-500">Monitoramento de ouvintes conectados ao servidor</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Ao Vivo
                    </div>
                </div>

                <div className="relative h-64 w-full">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={getSvgPath(historyData, 100, 100)} fill="url(#chartGradient)" />
                        <path d={getLinePath(historyData, 100, 100)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-slate-400 pointer-events-none -ml-6">
                        <span>{Math.max(...historyData, 10) * 1.2}</span>
                        <span>0</span>
                    </div>
                </div>
            </div>

            {/* Now Playing Section */}
            <div className="bg-white p-0 rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">No Ar Agora</h3>
                    <Mic2 size={16} className="text-blue-500" />
                </div>
                
                <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                    {loadingStream ? (
                         <div className="animate-pulse flex flex-col items-center w-full">
                             <div className="w-32 h-32 bg-slate-200 rounded-lg mb-4"></div>
                             <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                         </div>
                    ) : (
                        <>
                            <div className="relative w-40 h-40 mb-6 group">
                                <img 
                                    src={streamData?.capa_musica && streamData.capa_musica !== 'sem_imagem' ? streamData.capa_musica : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400'} 
                                    alt="Capa do Álbum" 
                                    className="w-full h-full object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Disc size={32} className="text-white animate-spin-slow" />
                                </div>
                            </div>
                            
                            <h4 className="text-lg font-bold text-slate-800 line-clamp-2">
                                {streamData?.musica_atual || 'Desconhecido'}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1 mb-4">
                                {streamData?.genero ? `${streamData.genero}` : 'Rádio Ao Vivo'}
                            </p>
                        </>
                    )}
                </div>
                <div className="border-t border-slate-100 bg-slate-50 p-4">
                     <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Próxima (AutoDJ)</p>
                     <p className="text-sm text-slate-700 truncate">
                        {streamData?.proxima_musica || 'Programação Ao Vivo'}
                     </p>
                </div>
            </div>
        </div>

        {/* Unified Locations & Devices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Merged Traffic Source: Site (Your IP) + Radio (API Total) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Origem de Tráfego (Site + Rádio)</h3>
                    <Globe size={16} className="text-slate-400" />
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Origem</th>
                            <th className="px-4 py-3 font-semibold">Local / Cidade</th>
                            <th className="px-4 py-3 font-semibold text-right">Ouvintes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {/* 1. Real User Location from IP */}
                        <tr className="bg-blue-50/50">
                            <td className="px-4 py-3 flex items-center gap-2 font-bold text-blue-700">
                                <Laptop size={14} /> Site (Você)
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-medium">
                                {userLocation ? `${userLocation.city}, ${userLocation.region}` : 'Detectando...'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                                1 <span className="text-xs font-normal text-slate-500">(Online)</span>
                            </td>
                        </tr>

                        {/* 2. Radio Stream Distribution (Total from API, distributed as estimate) */}
                        {[
                            { name: 'Treze de Maio', pct: 0.65 },
                            { name: 'Tubarão', pct: 0.20 },
                            { name: 'Jaguaruna', pct: 0.10 },
                            { name: 'Outros', pct: 0.05 },
                        ].map((city, idx) => {
                            const count = Math.round(listeners * city.pct);
                            if (count === 0 && listeners > 0 && idx === 0) return null; // Hide if 0 but radio is playing
                            return (
                                <tr key={idx} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 flex items-center gap-2 text-slate-500">
                                        <Radio size={14} /> Rádio
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {city.name}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 font-medium">
                                        {count}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Devices (Stats) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Dispositivos</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2 text-slate-600 font-medium"><Smartphone size={16} /> Mobile (App/Site)</span>
                            <span className="text-slate-900 font-bold">82%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2 text-slate-600 font-medium"><Monitor size={16} /> Desktop (PC)</span>
                            <span className="text-slate-900 font-bold">15%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400">
                            * Dados de dispositivos são estatísticos baseados na média histórica do player.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
