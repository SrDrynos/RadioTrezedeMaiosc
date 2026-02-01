
import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../services/db';
import { SiteSettings } from '../../types';
import { Save, Upload, Image as ImageIcon, Trash2, AlertCircle, Rss, Plus, Database, Server, Key, Info, Share2, PanelTop, Download, RefreshCcw, CheckCircle } from 'lucide-react';
import { RadioLogo } from '../../components/RadioLogo';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Backup State
  const [restoreStatus, setRestoreStatus] = useState<{success: boolean, message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- BACKUP FUNCTIONS ---
  const handleDownloadBackup = () => {
      const jsonString = db.exportBackup();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_radio_13_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          const result = db.importBackup(content);
          setRestoreStatus(result);
          
          if (result.success) {
              // Reload settings after restore
              setSettings(db.getSettings());
              setTimeout(() => window.location.reload(), 2000); // Reload page to apply everything
          }
      };
      reader.readAsText(file);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'aboutImageUrl' | 'headerLogoUrl' | 'heroLeftImageUrl' | 'heroRightImageUrl') => {
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
        // logoUrl / headerLogoUrl / heroImages -> PNG (Preserve Transparency)
        // aboutImageUrl -> JPEG (Better Compression)
        const format = field === 'aboutImageUrl' ? 'image/jpeg' : 'image/png';
        
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

  const handleRemoveImage = (field: 'logoUrl' | 'aboutImageUrl' | 'headerLogoUrl' | 'heroLeftImageUrl' | 'heroRightImageUrl') => {
      if (settings) {
          if (window.confirm('Deseja remover esta imagem?')) {
              setSettings({ ...settings, [field]: '' });
          }
      }
  };

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
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

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow space-y-12 mb-8">
            
            {/* 1. NEW: Header/Footer Logo */}
            <section>
                <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4 flex items-center gap-2">
                    <PanelTop size={20} /> 1. Logo Horizontal (Topo e Rodapé)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Pré-visualização (Fundo Claro)</label>
                         <div className="bg-white p-6 rounded-lg flex items-center justify-center border border-gray-300 min-h-[120px] overflow-hidden relative shadow-sm">
                            {isProcessing ? (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                </div>
                            ) : (
                                <RadioLogo src={settings.headerLogoUrl} className="w-full max-w-[200px] h-auto object-contain" />
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
                                        onChange={(e) => handleImageUpload(e, 'headerLogoUrl')} 
                                        className="hidden" 
                                        disabled={isProcessing}
                                    />
                                </label>
                                {settings.headerLogoUrl && !isProcessing && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveImage('headerLogoUrl')}
                                        className="text-red-500 hover:text-red-700 p-2 border border-red-100 hover:border-red-200 bg-white rounded transition"
                                        title="Remover logo"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-blue-700 mt-2">
                                <strong>Recomendado:</strong> 350x100px (PNG Transparente).
                                <br/>Usada na barra superior (celular/PC) e no rodapé.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Main Hero Logo */}
            <section>
                <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4 flex items-center gap-2">
                    <ImageIcon size={20} /> 2. Arte Central (Home/Hero)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Pré-visualização</label>
                         <div className="bg-gray-800 p-6 rounded-lg flex items-center justify-center border border-gray-600 min-h-[200px] overflow-hidden relative">
                            {isProcessing ? (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                </div>
                            ) : (
                                <RadioLogo src={settings.logoUrl} className="w-full max-w-[280px] h-auto object-contain" />
                            )}
                         </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-bold text-gray-900 mb-2">Enviar Arquivo</label>
                            <div className="flex items-center gap-2">
                                <label className={`cursor-pointer bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-bold flex items-center transition shadow-sm ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <Upload size={18} className="mr-2" /> 
                                    {isProcessing ? 'Processando...' : 'Carregar Arte'}
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
                            <p className="text-xs text-gray-600 mt-2">
                                Imagem grande exibida no centro da página inicial.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Hero Decor Images (Santa & Castelo) */}
            <section>
                <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4 flex items-center gap-2">
                    <ImageIcon size={20} /> 3. Imagens Decorativas (Topo/Hero)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Left Image (Castelo) */}
                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Imagem Esquerda (Ex: Castelo)</label>
                         <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center border border-gray-300 relative mb-4">
                            {settings.heroLeftImageUrl ? (
                                <img src={settings.heroLeftImageUrl} className="h-32 object-contain" />
                            ) : (
                                <div className="h-32 flex items-center text-gray-400 text-xs">Sem Imagem</div>
                            )}
                         </div>
                         <div className="flex items-center gap-2">
                            <label className={`flex-1 cursor-pointer bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 font-bold flex items-center justify-center transition text-sm ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                                <Upload size={16} className="mr-1" /> Alterar
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroLeftImageUrl')} className="hidden" disabled={isProcessing} />
                            </label>
                            {settings.heroLeftImageUrl && !isProcessing && (
                                <button type="button" onClick={() => handleRemoveImage('heroLeftImageUrl')} className="p-2 text-red-500 border rounded hover:bg-red-50"><Trash2 size={16} /></button>
                            )}
                         </div>
                    </div>

                    {/* Right Image (Santa) */}
                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Imagem Direita (Ex: Santa)</label>
                         <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center border border-gray-300 relative mb-4">
                            {settings.heroRightImageUrl ? (
                                <img src={settings.heroRightImageUrl} className="h-32 object-contain" />
                            ) : (
                                <div className="h-32 flex items-center text-gray-400 text-xs">Sem Imagem</div>
                            )}
                         </div>
                         <div className="flex items-center gap-2">
                            <label className={`flex-1 cursor-pointer bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 font-bold flex items-center justify-center transition text-sm ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                                <Upload size={16} className="mr-1" /> Alterar
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroRightImageUrl')} className="hidden" disabled={isProcessing} />
                            </label>
                            {settings.heroRightImageUrl && !isProcessing && (
                                <button type="button" onClick={() => handleRemoveImage('heroRightImageUrl')} className="p-2 text-red-500 border rounded hover:bg-red-50"><Trash2 size={16} /></button>
                            )}
                         </div>
                    </div>

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

                {/* Social Media Links - NEW SECTION */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                     <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Share2 size={16} /> Redes Sociais</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                            <input 
                                type="text" 
                                value={settings.facebookUrl || ''} 
                                onChange={e => setSettings({...settings, facebookUrl: e.target.value})}
                                placeholder="https://facebook.com/..."
                                className="w-full border border-gray-300 p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                            <input 
                                type="text" 
                                value={settings.instagramUrl || ''} 
                                onChange={e => setSettings({...settings, instagramUrl: e.target.value})}
                                placeholder="https://instagram.com/..."
                                className="w-full border border-gray-300 p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">X (Twitter) URL</label>
                            <input 
                                type="text" 
                                value={settings.xUrl || ''} 
                                onChange={e => setSettings({...settings, xUrl: e.target.value})}
                                placeholder="https://x.com/..."
                                className="w-full border border-gray-300 p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram (Comunidade)</label>
                            <input 
                                type="text" 
                                value={settings.telegramUrl || ''} 
                                onChange={e => setSettings({...settings, telegramUrl: e.target.value})}
                                placeholder="https://t.me/..."
                                className="w-full border border-gray-300 p-2 rounded"
                            />
                        </div>
                     </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto Institucional (Sobre a Rádio)</label>
                    <textarea 
                        rows={6}
                        value={settings.aboutText} 
                        onChange={e => setSettings({...settings, aboutText: e.target.value})}
                        className="w-full border border-gray-300 p-2 rounded"
                        placeholder="Descreva a história e missão da rádio..."
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

        {/* BACKUP & SECURITY SECTION */}
        <section className="bg-slate-800 text-white p-8 rounded-xl shadow-lg border border-slate-700">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-600 pb-4">
                 <div className="bg-yellow-500 p-2 rounded text-slate-900">
                     <Database size={24} />
                 </div>
                 <div>
                     <h3 className="text-xl font-bold">Backup e Segurança de Dados</h3>
                     <p className="text-slate-400 text-sm">Previna a perda de dados exportando o banco de dados local.</p>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                     <h4 className="font-bold flex items-center gap-2 mb-2 text-green-400">
                         <Download size={18} /> Exportar Dados
                     </h4>
                     <p className="text-sm text-slate-300 mb-4">
                         Gera um arquivo <code>.json</code> contendo todas as notícias, playlists da TV, configurações e pedidos musicais. Salve este arquivo no seu computador regularmente.
                     </p>
                     <button 
                        onClick={handleDownloadBackup}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition w-full shadow-md"
                     >
                         Baixar Backup Completo
                     </button>
                 </div>

                 <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                     <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-400">
                         <RefreshCcw size={18} /> Restaurar Dados
                     </h4>
                     <p className="text-sm text-slate-300 mb-4">
                         Tem um arquivo de backup? Carregue-o aqui para restaurar todo o site ao estado anterior.
                         <br/><span className="text-yellow-400 text-xs uppercase font-bold">Cuidado: Isso substituirá os dados atuais.</span>
                     </p>
                     
                     <div className="flex flex-col gap-3">
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition w-full shadow-md text-center block">
                             Selecionar Arquivo de Backup
                             <input 
                                type="file" 
                                ref={fileInputRef}
                                accept=".json"
                                onChange={handleRestoreBackup}
                                className="hidden"
                             />
                        </label>
                        
                        {restoreStatus && (
                            <div className={`p-3 rounded text-sm font-bold flex items-center gap-2 ${restoreStatus.success ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                                {restoreStatus.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {restoreStatus.message}
                            </div>
                        )}
                     </div>
                 </div>
             </div>
        </section>
    </div>
  );
};

export default AdminSettings;
