
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { SiteSettings } from '../../types';
import { Save, Upload, Image as ImageIcon, Trash2, AlertCircle, Rss, Plus, Database, Server, Key, Info, Camera } from 'lucide-react';
import { RadioLogo } from '../../components/RadioLogo';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // State for new RSS input
  const [newRssUrl, setNewRssUrl] = useState('');

  useEffect(() => {
    const s = db.getSettings();
    // Ensure array exists in state even if DB is fresh
    if(!s.rssUrls) s.rssUrls = [];
    setSettings(s);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
        setError(null);
        setSuccess(false);
        try {
            db.saveSettings(settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            window.scrollTo(0, 0);
        } catch (err) {
            console.error(err);
            setError('ERRO AO SALVAR: O navegador recusou salvar os dados. Provavelmente a imagem é muito pesada ou o armazenamento está cheio. Tente usar uma imagem menor.');
            window.scrollTo(0, 0);
        }
    }
  };

  const handleAddRss = () => {
      if (!settings) return;
      if (!newRssUrl.trim()) return;
      
      const updatedRss = [...(settings.rssUrls || []), newRssUrl.trim()];
      setSettings({ ...settings, rssUrls: updatedRss });
      setNewRssUrl('');
  };

  const handleRemoveRss = (index: number) => {
      if (!settings) return;
      const updatedRss = [...(settings.rssUrls || [])];
      updatedRss.splice(index, 1);
      setSettings({ ...settings, rssUrls: updatedRss });
  };

  // Modified to accept format parameter
  const compressImage = (file: File, format: 'image/png' | 'image/jpeg'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // Increased size for better quality (800px for photos)
          const MAX_WIDTH = 800; 
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             // Clean canvas to ensure transparency works for PNG
             ctx.clearRect(0, 0, width, height);
             ctx.drawImage(img, 0, 0, width, height);
             
             // Use the requested format (PNG for logos, JPEG for photos)
             // Quality 0.85 is ignored by PNG but used by JPEG
             const dataUrl = canvas.toDataURL(format, 0.85);
             resolve(dataUrl);
          } else {
             reject(new Error("Canvas context failed"));
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'aboutImageUrl') => {
    const file = e.target.files?.[0];
    setError(null);
    if (file && settings) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido.');
        return;
      }

      setIsProcessing(true);
      try {
        // Determine format based on field
        // logoUrl -> PNG (Preserve Transparency)
        // aboutImageUrl -> JPEG (Better Compression)
        const format = field === 'logoUrl' ? 'image/png' : 'image/jpeg';
        
        const compressedBase64 = await compressImage(file, format);
        
        // Check size (approx 2MB limit to be safe)
        if (compressedBase64.length > 2500000) {
            setError("A imagem ficou muito grande mesmo após processamento. Tente uma imagem mais leve.");
            setIsProcessing(false);
            return;
        }

        setSettings({ ...settings, [field]: compressedBase64 });
      } catch (error) {
        console.error("Erro ao processar imagem", error);
        setError("Erro técnico ao processar a imagem.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleRemoveImage = (field: 'logoUrl' | 'aboutImageUrl') => {
      if (settings) {
          if (window.confirm('Deseja remover esta imagem?')) {
              setSettings({ ...settings, [field]: '' });
          }
      }
  };

  if (!settings) return null;

  const isBase64Logo = settings.logoUrl?.startsWith('data:');
  const isBase64About = settings.aboutImageUrl?.startsWith('data:');

  return (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações do Site</h1>
        
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm flex items-start">
                <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-bold">Não foi possível salvar!</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        )}

        {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm animate-fade-in">
                <p className="font-bold">Sucesso!</p>
                <p>Configurações atualizadas corretamente.</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow space-y-12">
            
            {/* 1. Logo Settings */}
            <section>
                <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4 flex items-center gap-2">
                    <ImageIcon size={20} /> 1. Logo (Topo e Rodapé)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Pré-visualização</label>
                         <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center border border-gray-300 min-h-[200px] overflow-hidden relative">
                            {isProcessing ? (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <span className="text-blue-600 font-bold text-sm">Otimizando...</span>
                                </div>
                            ) : (
                                <RadioLogo src={settings.logoUrl} className="w-full max-w-[280px] h-auto object-contain" />
                            )}
                         </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-sm font-bold text-blue-900 mb-2">Enviar Arquivo</label>
                            <div className="flex items-center gap-2">
                                <label className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold flex items-center transition shadow-sm ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <Upload size={18} className="mr-2" /> 
                                    {isProcessing ? 'Processando...' : 'Carregar Logo'}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleImageUpload(e, 'logoUrl')} 
                                        className="hidden" 
                                        disabled={isProcessing}
                                    />
                                </label>
                                {settings.logoUrl && !isProcessing && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveImage('logoUrl')}
                                        className="text-red-500 hover:text-red-700 p-2 border border-red-100 hover:border-red-200 bg-white rounded transition"
                                        title="Remover logo"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-blue-700 mt-2">
                                Ideal: Fundo transparente (PNG).
                            </p>
                        </div>
                        
                        {/* URL Fallback */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ou Link Externo (URL)</label>
                            <input 
                                type="text" 
                                value={isBase64Logo ? '' : settings.logoUrl || ''} 
                                onChange={e => setSettings({...settings, logoUrl: e.target.value})}
                                placeholder={isBase64Logo ? "(Imagem carregada via upload)" : "https://..."}
                                disabled={isBase64Logo}
                                className={`w-full border border-gray-300 p-2 rounded text-sm ${isBase64Logo ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>
                </div>
            </section>

             {/* 2. About Image Settings */}
             <section>
                <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4 flex items-center gap-2">
                    <Camera size={20} /> 2. Imagem da Página "A Rádio"
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Pré-visualização</label>
                         <div className="bg-gray-100 p-2 rounded-lg flex items-center justify-center border border-gray-300 min-h-[200px] overflow-hidden relative">
                             {settings.aboutImageUrl ? (
                                <img src={settings.aboutImageUrl} alt="Sobre" className="w-full h-48 object-cover rounded" />
                             ) : (
                                <div className="text-gray-400 text-sm">Sem imagem selecionada</div>
                             )}
                         </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-sm font-bold text-blue-900 mb-2">Enviar Foto</label>
                            <div className="flex items-center gap-2">
                                <label className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold flex items-center transition shadow-sm ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <Upload size={18} className="mr-2" /> 
                                    {isProcessing ? 'Processando...' : 'Carregar Foto'}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleImageUpload(e, 'aboutImageUrl')} 
                                        className="hidden" 
                                        disabled={isProcessing}
                                    />
                                </label>
                                {settings.aboutImageUrl && !isProcessing && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveImage('aboutImageUrl')}
                                        className="text-red-500 hover:text-red-700 p-2 border border-red-100 hover:border-red-200 bg-white rounded transition"
                                        title="Remover imagem"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-blue-700 mt-2">
                                Ideal: Foto da equipe ou estúdio.
                            </p>
                        </div>

                         {/* URL Fallback */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ou Link Externo (URL)</label>
                            <input 
                                type="text" 
                                value={isBase64About ? '' : settings.aboutImageUrl || ''} 
                                onChange={e => setSettings({...settings, aboutImageUrl: e.target.value})}
                                placeholder={isBase64About ? "(Imagem carregada via upload)" : "https://..."}
                                disabled={isBase64About}
                                className={`w-full border border-gray-300 p-2 rounded text-sm ${isBase64About ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto Institucional</label>
                    <textarea 
                        rows={6}
                        value={settings.aboutText} 
                        onChange={e => setSettings({...settings, aboutText: e.target.value})}
                        className="w-full border border-gray-300 p-2 rounded"
                    />
                </div>
            </section>

            {/* Database & API Integration */}
            <section>
                <h3 className="text-lg font-bold text-purple-900 border-b pb-2 mb-4 flex items-center gap-2">
                    <Database size={20} /> Integração Externa (API / Banco de Dados)
                </h3>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-6">
                    <div className="flex items-start gap-3">
                         <Info className="text-purple-600 mt-1 flex-shrink-0" />
                         <div className="text-sm text-purple-900">
                             <p className="font-bold mb-1">Configuração para Banco de Dados Real (MongoDB)</p>
                             <p className="mb-2">
                                Insira abaixo a URL da sua API Backend.
                             </p>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                             <Server size={16} /> URL da API (Backend)
                        </label>
                        <input 
                            type="text" 
                            value={settings.apiUrl || ''} 
                            onChange={e => setSettings({...settings, apiUrl: e.target.value})}
                            placeholder="Ex: https://api.radiotrezedemaio.com.br"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                             <Key size={16} /> Chave de API (Token)
                        </label>
                        <input 
                            type="password" 
                            value={settings.apiKey || ''} 
                            onChange={e => setSettings({...settings, apiKey: e.target.value})}
                            placeholder="••••••••••••••••"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* RSS / API Sources */}
            <section>
                <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4 flex items-center gap-2">
                    <Rss size={20} /> Feeds de Notícias (RSS Automático)
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">
                        Adicione aqui as URLs dos feeds RSS.
                    </p>
                    
                    {settings.rssUrls && settings.rssUrls.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {settings.rssUrls.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                    <input 
                                        readOnly 
                                        value={url} 
                                        className="flex-1 bg-white border border-gray-300 p-2 rounded text-gray-600 text-sm" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveRss(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition"
                                        title="Remover URL"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={newRssUrl}
                            onChange={(e) => setNewRssUrl(e.target.value)}
                            placeholder="https://exemplo.com.br/feed/rss.xml"
                            className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button 
                            type="button" 
                            onClick={handleAddRss}
                            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={18} /> Adicionar
                        </button>
                    </div>
                </div>
            </section>

            {/* Streaming */}
            <section>
                <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4">Player de Áudio</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL do Streaming (MP3/AAC)</label>
                    <input 
                        type="text" 
                        value={settings.streamUrl} 
                        onChange={e => setSettings({...settings, streamUrl: e.target.value})}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </section>

            {/* General Info */}
            <section>
                <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4">Informações Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Rádio</label>
                        <input 
                            type="text" 
                            value={settings.radioName} 
                            onChange={e => setSettings({...settings, radioName: e.target.value})}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Fixo</label>
                        <input 
                            type="text" 
                            value={settings.phone} 
                            onChange={e => setSettings({...settings, phone: e.target.value})}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <input 
                            type="text" 
                            value={settings.whatsapp} 
                            onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input 
                            type="email" 
                            value={settings.email} 
                            onChange={e => setSettings({...settings, email: e.target.value})}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>
                </div>
                <div className="mt-4">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                     <input 
                            type="text" 
                            value={settings.address} 
                            onChange={e => setSettings({...settings, address: e.target.value})}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                </div>
            </section>

            <button 
                type="submit" 
                disabled={isProcessing}
                className={`w-full text-white font-bold py-4 rounded-lg flex justify-center items-center shadow-lg transition transform active:scale-95 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
                <Save size={20} className="mr-2" /> 
                {isProcessing ? 'Processando...' : 'Salvar Configurações'}
            </button>
        </form>
    </div>
  );
};

export default AdminSettings;
