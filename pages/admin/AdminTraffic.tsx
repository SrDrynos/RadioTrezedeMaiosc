
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Globe, Smartphone, Monitor, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from '../../services/db';
import { SiteSettings, ListenerSession } from '../../types';

interface TrafficStats {
  totalVisits: number;
  uniqueListeners: number;
  mobilePercent: number;
  desktopPercent: number;
  topCity: string;
  topCityPercent: number;
}

const AdminTraffic: React.FC = () => {
  const [stats, setStats] = useState<TrafficStats>({
      totalVisits: 0,
      uniqueListeners: 0,
      mobilePercent: 0,
      desktopPercent: 0,
      topCity: 'Carregando...',
      topCityPercent: 0
  });

  const [gaId, setGaId] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
      // 1. Load Settings (GA ID)
      const settings = db.getSettings();
      if (settings.googleAnalyticsId) {
          setGaId(settings.googleAnalyticsId);
      }

      // 2. Load Traffic Data (From listeners_log.json if available, or DB fallback)
      try {
          let sessions: ListenerSession[] = [];
          
          // Tenta buscar o log real do servidor PHP
          try {
             const res = await fetch('./listeners_log.json?t=' + Date.now());
             if (res.ok) {
                 sessions = await res.json();
             } else {
                 sessions = db.getSessions();
             }
          } catch(e) {
             sessions = db.getSessions();
          }

          if (sessions.length > 0) {
              // Calculate Stats
              const totalVisits = sessions.length;
              const uniqueListeners = new Set(sessions.map(s => s.ip)).size;
              
              const mobileCount = sessions.filter(s => s.device === 'Celular').length;
              const desktopCount = totalVisits - mobileCount;
              
              const mobilePercent = Math.round((mobileCount / totalVisits) * 100);
              const desktopPercent = 100 - mobilePercent;

              // Calculate Top City
              const cityCounts: Record<string, number> = {};
              sessions.forEach(s => {
                  const city = s.city || 'Desconhecido';
                  cityCounts[city] = (cityCounts[city] || 0) + 1;
              });

              const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
              const topCityName = sortedCities.length > 0 ? sortedCities[0][0] : 'N/A';
              const topCityCount = sortedCities.length > 0 ? sortedCities[0][1] : 0;
              const topCityPercent = Math.round((topCityCount / totalVisits) * 100);

              setStats({
                  totalVisits,
                  uniqueListeners,
                  mobilePercent,
                  desktopPercent,
                  topCity: topCityName,
                  topCityPercent
              });
          } else {
              setStats({
                  totalVisits: 0,
                  uniqueListeners: 0,
                  mobilePercent: 0,
                  desktopPercent: 0,
                  topCity: 'Sem dados',
                  topCityPercent: 0
              });
          }

      } catch (e) {
          console.error("Erro ao carregar estatísticas", e);
      } finally {
          setLoading(false);
      }
  };

  const handleSaveGA = (e: React.FormEvent) => {
      e.preventDefault();
      const currentSettings = db.getSettings();
      db.saveSettings({ ...currentSettings, googleAnalyticsId: gaId });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando dados de tráfego...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="text-green-600" /> Tráfego do Site
            </h1>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-bold text-gray-500 border border-gray-200">
                Dados em Tempo Real
            </div>
        </div>

        {/* Stats Cards (Now Real Data) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase">Visitas Registradas</p>
                        <h3 className="text-3xl font-black text-gray-800 mt-1">{stats.totalVisits}</h3>
                    </div>
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                        <TrendingUp size={20} />
                    </div>
                </div>
                <div className="text-xs text-green-600 font-bold flex items-center">
                   Baseado no log do servidor
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase">IPs Únicos</p>
                        <h3 className="text-3xl font-black text-gray-800 mt-1">{stats.uniqueListeners}</h3>
                    </div>
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <Users size={20} />
                    </div>
                </div>
                <div className="text-xs text-blue-600 font-bold flex items-center">
                    Dispositivos distintos conectados
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase">Cidade Principal</p>
                        <h3 className="text-2xl font-black text-gray-800 mt-1 truncate max-w-[180px]" title={stats.topCity}>{stats.topCity}</h3>
                    </div>
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                        <Globe size={20} />
                    </div>
                </div>
                 <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${stats.topCityPercent}%` }}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">{stats.topCityPercent}% do tráfego</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Origin Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-6">Origem dos Acessos (Dispositivos)</h3>
                
                {stats.totalVisits > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="text-gray-400" size={20} />
                                <span className="font-medium text-gray-600">Celular (Mobile)</span>
                            </div>
                            <span className="font-bold text-gray-800">{stats.mobilePercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.mobilePercent}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                                <Monitor className="text-gray-400" size={20} />
                                <span className="font-medium text-gray-600">Computador (Desktop)</span>
                            </div>
                            <span className="font-bold text-gray-800">{stats.desktopPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-300 h-2 rounded-full" style={{ width: `${stats.desktopPercent}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        Aguardando dados de acesso...
                    </div>
                )}
            </div>

            {/* Google Analytics Config */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="bg-orange-50 p-2 rounded-full">
                        <BarChart3 size={24} className="text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Google Analytics 4 (GA4)</h3>
                        <p className="text-xs text-gray-500">Conecte sua conta para dados oficiais.</p>
                    </div>
                 </div>

                 <form onSubmit={handleSaveGA} className="flex-1 flex flex-col justify-center">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ID da Métrica (Measurement ID)</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="G-XXXXXXXXXX"
                            value={gaId}
                            onChange={(e) => setGaId(e.target.value)}
                            className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm uppercase"
                        />
                        <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded font-bold hover:bg-orange-600 transition flex items-center gap-2">
                            <Save size={18} /> Salvar
                        </button>
                    </div>
                    
                    {isSaved && (
                        <div className="mt-3 text-green-600 text-sm font-bold flex items-center gap-1 animate-fade-in">
                            <CheckCircle size={14} /> ID Salvo! O rastreamento iniciará em instantes.
                        </div>
                    )}

                    <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-500 border border-gray-100 flex gap-2">
                        <AlertCircle size={16} className="text-blue-500 flex-shrink-0" />
                        <p>
                            Ao inserir o ID, o script do Google será injetado automaticamente na página pública ("PublicLayout"). 
                            Os dados completos aparecerão no seu painel do Google Analytics em até 24h.
                        </p>
                    </div>
                 </form>
            </div>
        </div>
    </div>
  );
};

export default AdminTraffic;
