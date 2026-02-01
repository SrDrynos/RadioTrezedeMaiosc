
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { newsAutomationService } from '../../services/newsAutomation';
import { NewsItem } from '../../types';
import { Trash2, Edit, Plus, X, Zap, AlertTriangle, Rss, Save, Upload, Image as ImageIcon, CheckCircle, ArrowLeft, Ban, ExternalLink, Calendar, FileEdit, Eye, Link as LinkIcon, Filter, Search } from 'lucide-react';

const AdminNews: React.FC = () => {
  const [activeNews, setActiveNews] = useState<NewsItem[]>([]);
  const [curationNews, setCurationNews] = useState<NewsItem[]>([]); // New State for Curation
  const [rejectedNews, setRejectedNews] = useState<NewsItem[]>([]);
  
  // View Modes: 'active' | 'curation' | 'rejected'
  const [viewMode, setViewMode] = useState<'active' | 'curation' | 'rejected'>('active');

  const [isEditing, setIsEditing] = useState(false);
  
  // CMS State
  const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // RSS State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = () => {
      // Get all news (both published and unpublished) from main DB
      const allNews = db.getNews(false);
      
      setActiveNews(allNews.filter(n => n.published));
      setCurationNews(allNews.filter(n => !n.published)); // Not published = Curation/Draft
      
      setRejectedNews(db.getRejectedNews());
  };

  // Filter Logic for Active News
  const filteredActiveNews = activeNews.filter(item => {
      if (!startDate && !endDate) return true;
      
      const itemDate = new Date(item.createdAt).getTime();
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      
      return true;
  });

  const handleDelete = (id: string, fromRejected = false) => {
    if (window.confirm('Tem certeza que deseja excluir esta notícia permanentemente?')) {
      if (fromRejected) {
          db.deleteRejectedNews(id);
      } else {
          db.deleteNewsItem(id);
      }
      loadNews();
    }
  };

  const handleClearRejected = () => {
      if (window.confirm("Isso apagará TODAS as notícias rejeitadas. Tem certeza?")) {
          db.clearRejectedNews();
          loadNews();
      }
  };

  const handleEdit = (item: NewsItem) => {
    const isRejected = !!item.rejectionReason;
    
    // Prepare data for editor
    setCurrentNews({
        ...item,
        id: isRejected ? Date.now().toString() : item.id, // Generate new ID if it was rejected (treat as new)
        gallery: item.gallery || (item.imageUrl ? [item.imageUrl] : []),
        rejectionReason: undefined // Clear reason so it can be saved as clean news
    });

    if (isRejected) {
        // If it was rejected, we remove it from the "Quarantine" list immediately 
        // because the user is taking responsibility for it now.
        db.deleteRejectedNews(item.id); 
    }

    setIsEditing(true);
    setValidationError(null);
    loadNews(); 
  };

  const handleAddNew = () => {
    setCurrentNews({
      title: '',
      subtitle: '',
      excerpt: '',
      content: '',
      category: 'Treze de Maio - SC', // Default Mandatory
      imageUrl: '',
      gallery: [],
      videoUrl: '',
      source: '',
      sourceUrl: '',
      published: false, // Default to Draft/Curadoria
      createdAt: new Date().toISOString()
    });
    setIsEditing(true);
    setValidationError(null);
  };

  // Image Compression Helper
  const compressImage = (file: File): Promise<string> => {
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
          // CMS Optimization: Max 800px width for news images
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
             ctx.drawImage(img, 0, 0, width, height);
             // JPEG 70% quality for efficient storage
             resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
             reject(new Error("Canvas failed"));
          }
        };
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          setUploading(true);
          const newImages: string[] = [];
          
          try {
              for (let i = 0; i < files.length; i++) {
                  if (files[i].size > 5000000) {
                       alert(`Arquivo ${files[i].name} muito grande. Máximo 5MB.`);
                       continue;
                  }
                  const compressed = await compressImage(files[i]);
                  newImages.push(compressed);
              }
              
              const updatedGallery = [...(currentNews.gallery || []), ...newImages].slice(0, 5); // Max 5
              setCurrentNews({ 
                  ...currentNews, 
                  gallery: updatedGallery,
                  imageUrl: updatedGallery[0] // First image is main
              });

          } catch (err) {
              console.error(err);
              alert("Erro ao processar imagem.");
          } finally {
              setUploading(false);
          }
      }
  };

  const removeImage = (index: number) => {
      const updatedGallery = [...(currentNews.gallery || [])];
      updatedGallery.splice(index, 1);
      setCurrentNews({ 
          ...currentNews, 
          gallery: updatedGallery,
          imageUrl: updatedGallery.length > 0 ? updatedGallery[0] : ''
      });
  };

  const handleSave = (e: React.FormEvent, forcePublish: boolean) => {
    e.preventDefault();
    setValidationError(null);

    // 2. Validate Fields
    if (!currentNews.title || currentNews.title.length > 75) {
        setValidationError("Erro: Título obrigatório (máximo 75 caracteres).");
        window.scrollTo(0,0);
        return;
    }
    if (!currentNews.subtitle) {
         setValidationError("Erro: Subtítulo é obrigatório para jornalismo profissional.");
         window.scrollTo(0,0);
         return;
    }
    if (!currentNews.excerpt || currentNews.excerpt.length > 170) {
        setValidationError("Erro: Mini descrição obrigatória (máx 170 carac).");
        window.scrollTo(0,0);
        return;
    }
    if (!currentNews.content || currentNews.content.length < 100) {
        setValidationError("Erro: Conteúdo muito curto. Escreva um artigo completo.");
        window.scrollTo(0,0);
        return;
    }
    if (!currentNews.gallery || currentNews.gallery.length === 0) {
        setValidationError("Erro: Pelo menos 1 imagem deve ser enviada (Upload).");
        window.scrollTo(0,0);
        return;
    }
    if (!currentNews.source) {
        setValidationError("Erro: Citar a Fonte (Nome) é obrigatório.");
        window.scrollTo(0,0);
        return;
    }
    if (!currentNews.sourceUrl) {
        setValidationError("Erro: Link da Fonte (URL) é obrigatório para verificação.");
        window.scrollTo(0,0);
        return;
    }

    // Generate Slug
    const slug = currentNews.title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

    const itemToSave = {
        ...currentNews,
        id: currentNews.id || Date.now().toString(),
        slug: slug,
        published: forcePublish, // Controls if it goes to Site or Curadoria
        createdAt: currentNews.createdAt || new Date().toISOString()
    } as NewsItem;

    try {
        db.saveNewsItem(itemToSave);
        setIsEditing(false);
        loadNews();
        // Switch view to where the item went
        setViewMode(forcePublish ? 'active' : 'curation');
    } catch(err) {
        console.error(err);
        setValidationError("Erro ao salvar no banco de dados.");
    }
  };

  const handleQuickPublish = (item: NewsItem) => {
      // Validação Extra ao Publicar via Lista
      if (!item.sourceUrl) {
          alert("ERRO: Esta notícia não tem Link da Fonte. Edite e adicione a URL antes de publicar.");
          return;
      }
      const updated = { ...item, published: true };
      db.saveNewsItem(updated);
      loadNews();
  };

  const handleUnpublish = (item: NewsItem) => {
      const updated = { ...item, published: false };
      db.saveNewsItem(updated);
      loadNews();
  };

  const handleSyncRSS = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
        const settings = db.getSettings();
        const result = await newsAutomationService.syncRSSFeeds(settings.rssUrls || []);
        setSyncMessage(result.message);
        loadNews();
    } catch(e) {
        setSyncMessage("Erro ao sincronizar RSS.");
    } finally {
        setIsSyncing(false);
    }
  };

  // RENDER EDITOR
  if (isEditing) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Edit className="text-blue-600" /> Editor de Notícias (CMS)
                </h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
            </div>

            {validationError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-200">
                    <AlertTriangle size={20} />
                    <span className="font-bold">{validationError}</span>
                </div>
            )}

            <form className="space-y-6">
                
                {/* 1. IMAGES */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Imagens da Galeria (Max 5)</label>
                    <div className="flex flex-wrap gap-4">
                        {currentNews.gallery?.map((img, idx) => (
                            <div key={idx} className="relative w-24 h-24 group">
                                <img src={img} className="w-full h-full object-cover rounded-md border border-gray-300" />
                                <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                                    <X size={12} />
                                </button>
                                {idx === 0 && <span className="absolute bottom-0 left-0 bg-blue-600 text-white text-[10px] px-1 rounded-tr">Capa</span>}
                            </div>
                        ))}
                        {(!currentNews.gallery || currentNews.gallery.length < 5) && (
                            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                                <Upload size={20} className="text-gray-400" />
                                <span className="text-xs text-gray-500 mt-1">{uploading ? '...' : 'Upload'}</span>
                                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                            </label>
                        )}
                    </div>
                </div>

                {/* 2. BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                         <label className="block text-sm font-bold text-gray-700 mb-1">Título da Manchete</label>
                         <input 
                            value={currentNews.title} 
                            onChange={e => setCurrentNews({...currentNews, title: e.target.value})} 
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                            placeholder="Ex: Obra na praça central é finalizada"
                            maxLength={75}
                        />
                        <p className="text-xs text-right text-gray-400 mt-1">{currentNews.title?.length || 0}/75</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Subtítulo (Linha Fina)</label>
                        <input 
                            value={currentNews.subtitle || ''} 
                            onChange={e => setCurrentNews({...currentNews, subtitle: e.target.value})} 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Complemento curto que aparece abaixo do título"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                        <select 
                            value={currentNews.category} 
                            onChange={e => setCurrentNews({...currentNews, category: e.target.value as any})}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Treze de Maio - SC">Treze de Maio - SC</option>
                            <option value="Cidades Vizinhas">Cidades Vizinhas</option>
                            <option value="Região">Região</option>
                            <option value="Avisos">Avisos</option>
                        </select>
                    </div>

                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Fonte</label>
                         <input 
                            value={currentNews.source || ''} 
                            onChange={e => setCurrentNews({...currentNews, source: e.target.value})} 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex: Prefeitura Municipal"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                     <label className="block text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                        <LinkIcon size={16} /> Link Original da Fonte (URL) - Obrigatório
                     </label>
                     <input 
                        type="url"
                        value={currentNews.sourceUrl || ''} 
                        onChange={e => setCurrentNews({...currentNews, sourceUrl: e.target.value})} 
                        className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        placeholder="https://..."
                    />
                    <p className="text-xs text-blue-700 mt-1">O link é necessário para verificação de autenticidade.</p>
                </div>

                {/* 3. CONTENT */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mini Descrição (SEO / Capa)</label>
                    <textarea 
                        value={currentNews.excerpt || ''} 
                        onChange={e => setCurrentNews({...currentNews, excerpt: e.target.value})} 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={2}
                        maxLength={170}
                    ></textarea>
                     <p className="text-xs text-right text-gray-400 mt-1">{currentNews.excerpt?.length || 0}/170</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Conteúdo Completo (HTML suportado)</label>
                    <textarea 
                        value={currentNews.content || ''} 
                        onChange={e => setCurrentNews({...currentNews, content: e.target.value})} 
                        className="w-full p-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                        rows={15}
                        placeholder="<p>Escreva aqui o texto da notícia...</p>"
                    ></textarea>
                </div>

                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Link de Vídeo (Opcional)</label>
                     <input 
                        value={currentNews.videoUrl || ''} 
                        onChange={e => setCurrentNews({...currentNews, videoUrl: e.target.value})} 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://youtube.com/..."
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-100">
                     <button onClick={(e) => handleSave(e, false)} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-sm">
                        <Save size={20} /> Salvar para Aprovação (Curadoria)
                     </button>
                     
                     <button type="button" onClick={() => setIsEditing(false)} className="px-6 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition">
                        Cancelar
                     </button>
                </div>
                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded border border-yellow-200 text-center flex items-center justify-center gap-2">
                    <AlertTriangle size={14} />
                    <strong>Regra de Publicação:</strong> Não é permitido publicar diretamente. A notícia ficará salva na aba "Curadoria" aguardando aprovação final.
                </div>
            </form>
        </div>
    );
  }

  // RENDER MAIN LIST
  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Gerenciador de Notícias</h1>
            <div className="flex gap-2">
                <button 
                    onClick={handleSyncRSS} 
                    className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm transition ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSyncing}
                >
                    <Rss size={16} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Buscando...' : 'Buscar RSS'}
                </button>
                <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm transition">
                    <Plus size={18} /> Nova Notícia
                </button>
            </div>
        </div>

        {syncMessage && (
            <div className="bg-blue-50 text-blue-800 p-3 rounded border border-blue-200 text-sm font-bold flex items-center gap-2 animate-fade-in">
                <Rss size={16} /> {syncMessage}
            </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
            <button 
                onClick={() => setViewMode('active')}
                className={`px-6 py-3 font-bold text-sm border-b-2 transition whitespace-nowrap ${viewMode === 'active' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Publicadas ({activeNews.length})
            </button>
            <button 
                onClick={() => setViewMode('curation')}
                className={`px-6 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${viewMode === 'curation' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <FileEdit size={16} /> Curadoria / Rascunhos ({curationNews.length})
            </button>
            <button 
                onClick={() => setViewMode('rejected')}
                className={`px-6 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${viewMode === 'rejected' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Ban size={16} /> Rejeitadas ({rejectedNews.length})
            </button>
        </div>

        {/* LIST */}
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            
            {/* VIEW MODE: PUBLISHED */}
            {viewMode === 'active' && (
                 <>
                     {/* FILTER BAR */}
                     <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-4">
                        <div className="text-sm font-bold text-gray-500 flex items-center gap-2">
                            <Filter size={16} /> Filtrar por Data:
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
                            </div>
                            <span className="text-gray-400 text-xs">até</span>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        
                        {(startDate || endDate) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1"
                            >
                                <X size={12} /> Limpar Filtros
                            </button>
                        )}

                        <div className="ml-auto text-xs font-bold text-gray-500">
                            Exibindo {filteredActiveNews.length} de {activeNews.length}
                        </div>
                     </div>

                     {filteredActiveNews.length === 0 ? (
                         <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                             <Search size={32} className="mb-2 opacity-50" />
                             Nenhuma notícia encontrada com os filtros selecionados.
                         </div>
                     ) : (
                         <div className="divide-y divide-gray-100">
                             {filteredActiveNews.map(item => (
                                 <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 transition">
                                     <img src={item.imageUrl} className="w-24 h-24 object-cover rounded-lg bg-gray-200 flex-shrink-0" />
                                     <div className="flex-1 min-w-0">
                                         <div className="flex items-center gap-2 mb-1">
                                             <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                                <CheckCircle size={10} /> Publicada
                                             </span>
                                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                 item.category === 'Treze de Maio - SC' ? 'bg-blue-100 text-blue-800' :
                                                 'bg-gray-100 text-gray-800'
                                             }`}>{item.category}</span>
                                             <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                         </div>
                                         <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
                                         <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.excerpt}</p>
                                         {!item.sourceUrl && (
                                             <span className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1"><AlertTriangle size={10} /> REQUER LINK DA FONTE</span>
                                         )}
                                     </div>
                                     <div className="flex flex-col gap-2 justify-center">
                                         <button onClick={() => handleUnpublish(item)} className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded hover:bg-yellow-200" title="Mover para Curadoria">
                                            Despublicar
                                         </button>
                                         <div className="flex gap-1 justify-end">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </>
            )}

            {/* VIEW MODE: CURATION (DRAFTS) */}
            {viewMode === 'curation' && (
                <>
                    <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
                        <p className="text-sm text-yellow-800">
                            <strong>Área de Curadoria:</strong> Estas notícias estão salvas mas <strong>não aparecem no site</strong>. Revise e publique quando estiverem prontas.
                        </p>
                    </div>
                    {curationNews.length === 0 ? (
                         <div className="p-8 text-center text-gray-400">Nenhum rascunho em curadoria.</div>
                    ) : (
                         <div className="divide-y divide-gray-100">
                             {curationNews.map(item => (
                                 <div key={item.id} className="p-4 flex gap-4 hover:bg-yellow-50/50 transition">
                                     <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative border border-yellow-200">
                                        <img src={item.imageUrl} className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-bl">RASCUNHO</div>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <div className="flex items-center gap-2 mb-1">
                                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                 item.category === 'Treze de Maio - SC' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                             }`}>{item.category}</span>
                                             <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                         </div>
                                         <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
                                         <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.excerpt}</p>
                                         {!item.sourceUrl && (
                                             <span className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1"><AlertTriangle size={10} /> REQUER LINK DA FONTE</span>
                                         )}
                                     </div>
                                     <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                                         <button onClick={() => handleQuickPublish(item)} className="px-3 py-2 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 shadow-sm flex items-center justify-center gap-1">
                                            <Zap size={14} /> PUBLICAR
                                         </button>
                                         <div className="flex gap-1 justify-center">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    )}
                </>
            )}

            {/* VIEW MODE: REJECTED */}
            {viewMode === 'rejected' && (
                <>
                    <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
                        <p className="text-sm text-red-800">
                            <strong>Atenção:</strong> Notícias rejeitadas automaticamente. Elas não serão publicadas a menos que você as edite.
                        </p>
                        {rejectedNews.length > 0 && (
                            <button onClick={handleClearRejected} className="text-xs text-red-600 font-bold hover:underline">Limpar Tudo</button>
                        )}
                    </div>
                    {rejectedNews.length === 0 ? (
                         <div className="p-8 text-center text-gray-400">Nenhuma notícia rejeitada.</div>
                    ) : (
                         <div className="divide-y divide-gray-100">
                             {rejectedNews.map(item => (
                                 <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 transition opacity-80">
                                     <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                                        <img src={item.imageUrl} className="w-full h-full object-cover grayscale" />
                                        <div className="absolute inset-0 bg-red-900/20"></div>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <div className="flex items-center gap-2 mb-1">
                                             <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">REJEITADA</span>
                                             <span className="text-xs text-red-600 font-bold">Motivo: {item.rejectionReason}</span>
                                         </div>
                                         <h3 className="font-bold text-gray-700 truncate">{item.title}</h3>
                                         <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.excerpt}</p>
                                     </div>
                                     <div className="flex flex-col gap-2 justify-center">
                                         <button onClick={() => handleEdit(item)} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">Revisar & Mover p/ Curadoria</button>
                                         <button onClick={() => handleDelete(item.id, true)} className="p-2 text-red-600 hover:bg-red-50 rounded self-end"><Trash2 size={18} /></button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    )}
                </>
            )}
        </div>
    </div>
  );
};

export default AdminNews;
