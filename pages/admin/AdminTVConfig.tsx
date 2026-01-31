
import React, { useState, useEffect } from 'react';
import { Tv, Save, Youtube, Video, Play, Trash2, Plus, ArrowUp, ArrowDown, MonitorPlay, AlertCircle, Signal, Upload, FileVideo } from 'lucide-react';
import { db } from '../../services/db';
import { SiteSettings, TVItem } from '../../types';

const AdminTVConfig: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [playlist, setPlaylist] = useState<TVItem[]>([]);
  const [isTvEnabled, setIsTvEnabled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // State for new item
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<'video' | 'commercial' | 'live'>('commercial');
  const [inputMode, setInputMode] = useState<'youtube' | 'upload'>('youtube');
  const [newItemDuration, setNewItemDuration] = useState(''); // Agora usado como "Fonte"

  // Preview State
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
      const s = db.getSettings();
      setSettings(s);
      setPlaylist(s.tvPlaylist || []);
      setIsTvEnabled(s.tvEnabled || false);
  }, []);

  const handleSave = () => {
      if (settings) {
          const updatedSettings = {
              ...settings,
              tvEnabled: isTvEnabled,
              tvPlaylist: playlist
          };
          db.saveSettings(updatedSettings);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
      }
  };

  // Robust YouTube ID Extractor
  const getYoutubeId = (url: string) => {
      if(!url) return '';
      // ID Only
      if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
      // Standard Formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Cria uma URL temporária para o arquivo local
          const objUrl = URL.createObjectURL(file);
          setNewItemUrl(objUrl);
          if(!newItemTitle) setNewItemTitle(file.name);
          setNewItemDuration("Arquivo Local");
      }
  };

  const handleAddItem = () => {
      if (!newItemUrl || !newItemTitle) return;

      let finalUrl = newItemUrl;
      const ytId = getYoutubeId(newItemUrl);
      
      // Se for YouTube, normaliza. Se for upload (MP4), mantém a URL.
      if (inputMode === 'youtube' && ytId) {
          finalUrl = `https://www.youtube.com/embed/${ytId}`;
      }

      const newItem: TVItem = {
          id: Date.now().toString(),
          title: newItemTitle,
          type: newItemType,
          url: finalUrl,
          // Se for LIVE, força "Ao Vivo". Se não, usa o que o usuário digitou no campo Fonte (newItemDuration)
          duration: newItemType === 'live' ? 'Ao Vivo' : (newItemDuration || 'Própria')
      };

      setPlaylist([...playlist, newItem]);
      setNewItemUrl('');
      setNewItemTitle('');
      setNewItemDuration('');
      setInputMode('youtube'); // Reset to default
  };

  const handleRemoveItem = (index: number) => {
      const newPlaylist = [...playlist];
      newPlaylist.splice(index, 1);
      setPlaylist(newPlaylist);
      if (previewIndex >= newPlaylist.length) setPreviewIndex(0);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === playlist.length - 1) return;

      const newPlaylist = [...playlist];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newPlaylist[targetIndex];
      newPlaylist[targetIndex] = newPlaylist[index];
      newPlaylist[index] = temp;
      setPlaylist(newPlaylist);
  };
  
  // Helper to render preview source
  const getPreviewSrc = (item: TVItem) => {
      const id = getYoutubeId(item.url);
      if (id) {
          return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&showinfo=0&fs=1&disablekb=1&origin=${window.location.origin}`;
      }
      return item.url; // Return raw URL for video tags
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Tv className="text-purple-600" /> Configuração TV Online
            </h1>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <span className={`w-3 h-3 rounded-full ${isTvEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                <span className="text-sm font-bold text-gray-600">{isTvEnabled ? 'TRANSMISSÃO HABILITADA' : 'TRANSMISSÃO DESLIGADA'}</span>
                <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input type="checkbox" className="sr-only peer" checked={isTvEnabled} onChange={e => setIsTvEnabled(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: PREVIEW & ADD */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* PREVIEW PLAYER */}
                <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group">
                    {playlist.length > 0 && playlist[previewIndex] ? (
                        <div className="w-full h-full relative overflow-hidden">
                             {/* Preview Iframe Or Video */}
                             {getYoutubeId(playlist[previewIndex].url) ? (
                                 <div className="w-full h-full transform scale-[1.35]">
                                    <iframe 
                                        key={playlist[previewIndex].id}
                                        src={getPreviewSrc(playlist[previewIndex])} 
                                        className="w-full h-full"
                                        title="Preview"
                                        allow="autoplay; encrypted-media"
                                    />
                                 </div>
                             ) : (
                                <video
                                    key={playlist[previewIndex].id}
                                    src={playlist[previewIndex].url}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                    muted
                                />
                             )}
                            
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 z-20 pointer-events-none">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Preview
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                            <MonitorPlay size={48} className="mb-2 opacity-50" />
                            <p>Playlist Vazia</p>
                        </div>
                    )}
                </div>

                {/* ADD ITEM FORM */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <Plus size={18} className="text-purple-600" /> Adicionar à Programação
                    </h3>
                    
                    <div className="space-y-4">
                        {/* TYPE SELECTOR */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button onClick={() => { setNewItemType('commercial'); setInputMode('youtube'); }} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition ${newItemType === 'commercial' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}>COMERCIAL</button>
                            <button onClick={() => { setNewItemType('video'); setInputMode('youtube'); }} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition ${newItemType === 'video' && inputMode === 'youtube' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>YOUTUBE</button>
                            <button onClick={() => { setNewItemType('video'); setInputMode('upload'); }} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition flex items-center justify-center gap-1 ${inputMode === 'upload' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}><Upload size={10} /> UPLOAD</button>
                            <button onClick={() => { setNewItemType('live'); setInputMode('youtube'); setNewItemDuration('Ao Vivo'); }} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition flex items-center justify-center gap-1 ${newItemType === 'live' ? 'bg-red-600 shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}><Signal size={10} /> LIVE</button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Título</label>
                            <input 
                                className="w-full p-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                                placeholder="Título do vídeo..."
                                value={newItemTitle}
                                onChange={e => setNewItemTitle(e.target.value)}
                            />
                        </div>

                        {/* CONDITIONAL INPUT: YOUTUBE VS FILE */}
                        {inputMode === 'upload' ? (
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                                <label className="block text-xs font-bold text-green-800 mb-2">Arquivo de Vídeo (MP4/WebM)</label>
                                
                                <input 
                                    type="file" 
                                    accept="video/*" 
                                    onChange={handleFileUpload}
                                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 mb-2"
                                />
                                
                                <div className="text-center text-xs text-gray-400 font-bold my-1">- OU -</div>

                                <input 
                                    className="w-full p-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded text-xs focus:ring-2 focus:ring-green-500 outline-none" 
                                    placeholder="Cole link direto (ex: https://site.com/video.mp4)"
                                    value={newItemUrl}
                                    onChange={e => setNewItemUrl(e.target.value)}
                                />
                                <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                                    <AlertCircle size={10} /> Upload local funciona apenas nesta sessão.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Link do YouTube</label>
                                <div className="relative">
                                    <Youtube size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        className="w-full pl-9 p-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={newItemUrl}
                                        onChange={e => setNewItemUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Fonte / Cliente (Quem fez)</label>
                            <input 
                                className="w-full p-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100 disabled:text-gray-400" 
                                placeholder="Ex: Prefeitura, Comércio do João..."
                                value={newItemDuration}
                                onChange={e => setNewItemDuration(e.target.value)}
                                disabled={newItemType === 'live'}
                            />
                        </div>

                        <button 
                            onClick={handleAddItem}
                            disabled={!newItemUrl || !newItemTitle}
                            className={`w-full text-white font-bold py-2 rounded transition shadow ${inputMode === 'upload' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {inputMode === 'upload' ? 'Carregar Arquivo' : 'Inserir Link'}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: PLAYLIST MANAGER */}
            <div className="lg:col-span-2 flex flex-col h-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-800">Grade de Reprodução</h3>
                            <p className="text-xs text-gray-500">Sequência de reprodução automática</p>
                        </div>
                        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2 shadow transition">
                            <Save size={16} /> Salvar Alterações
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/50">
                        {playlist.length === 0 && (
                            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg m-4">
                                Nenhum item na playlist. A TV ficará fora do ar.
                            </div>
                        )}
                        
                        {playlist.map((item, index) => {
                            const tmbId = getYoutubeId(item.url);
                            return (
                                <div 
                                    key={item.id} 
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition group ${
                                        index === previewIndex 
                                        ? 'bg-purple-50 border-purple-200 shadow-sm' 
                                        : 'bg-white border-gray-100 hover:border-purple-200'
                                    }`}
                                    onClick={() => setPreviewIndex(index)}
                                >
                                    <div className="text-xs font-bold text-gray-400 w-6 text-center">{index + 1}</div>
                                    
                                    <div className="w-16 h-10 bg-black rounded overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                                        {tmbId ? (
                                            <img src={`https://img.youtube.com/vi/${tmbId}/default.jpg`} className="w-full h-full object-cover opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} alt="" />
                                        ) : (
                                            <FileVideo size={20} className="text-gray-500" />
                                        )}
                                        {item.type === 'commercial' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/20">
                                                <span className="text-[8px] font-black text-yellow-300 bg-black/50 px-1 rounded">AD</span>
                                            </div>
                                        )}
                                        {item.type === 'live' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-red-600/30">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                            </div>
                                        )}
                                        {/* File Indicator */}
                                        {!tmbId && (
                                             <div className="absolute bottom-0 right-0 bg-green-600 text-[6px] text-white px-1">FILE</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 cursor-pointer">
                                        <div className="font-bold text-gray-800 text-sm truncate">{item.title}</div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className={`uppercase font-bold px-1.5 py-0.5 rounded ${
                                                item.type === 'commercial' ? 'bg-yellow-100 text-yellow-700' : 
                                                item.type === 'live' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {item.type === 'live' ? 'AO VIVO' : item.type === 'commercial' ? 'COMERCIAL' : 'VÍDEO'}
                                            </span>
                                            <span>Fonte: {item.duration}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition">
                                        <button onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }} disabled={index === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowUp size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }} disabled={index === playlist.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowDown size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveItem(index); }} className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="p-3 bg-blue-50 border-t border-blue-100 text-xs text-blue-800 flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span><strong>Nota:</strong> Para arquivos locais (Upload), a reprodução funciona apenas neste computador. Para público geral, use Links MP4 hospedados.</span>
                    </div>
                </div>
            </div>
        </div>
        
        {isSaved && (
            <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl font-bold animate-bounce flex items-center gap-2">
                <Save size={20} /> Playlist Atualizada!
            </div>
        )}
    </div>
  );
};

export default AdminTVConfig;
