
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { newsAutomationService } from '../../services/newsAutomation';
import { NewsItem, IncomingWebhookData } from '../../types';
import { Trash2, Edit, Plus, X, Zap, Code, AlertTriangle, Rss, Save, Upload, Image as ImageIcon, Video, Link as LinkIcon, Eye, CheckCircle, ArrowLeft, Archive, Ban, ExternalLink } from 'lucide-react';

const AdminNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [rejectedNews, setRejectedNews] = useState<NewsItem[]>([]);
  const [viewMode, setViewMode] = useState<'active' | 'rejected'>('active');

  const [isEditing, setIsEditing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Preview State (For reading rejected news)
  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null);

  // CMS State
  const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // RSS State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Simulation State
  const [jsonInput, setJsonInput] = useState('');
  const [simulationResult, setSimulationResult] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = () => {
      setNews(db.getNews());
      setRejectedNews(db.getRejectedNews());
  };

  const handleDelete = (id: string, fromRejected = false) => {
    if (window.confirm('Tem certeza que deseja excluir esta notícia permanentemente?')) {
      if (fromRejected) {
          db.deleteRejectedNews(id);
          if (previewItem?.id === id) setPreviewItem(null); // Close modal if open
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
    // Close preview if open
    setPreviewItem(null);

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
    loadNews(); // Refresh lists to show it moved (or removed from rejected)
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
      published: true
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Validate Mandatory Category
    if (currentNews.category !== 'Treze de Maio - SC') {
        setValidationError("Erro: A categoria 'Treze de Maio - SC' é obrigatória para notícias oficiais.");
        window.scrollTo(0,0);
        return;
    }

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
        setValidationError("Erro: Citar a Fonte é obrigatório.");
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
        createdAt: currentNews.createdAt || new Date().toISOString()
    } as NewsItem;

    try {
        db.saveNewsItem(itemToSave);
        setIsEditing(false);
        loadNews();
    } catch (e) {
        setValidationError("Erro ao salvar: Espaço de armazenamento cheio. Remova notícias antigas ou use imagens menores.");
    }
  };

  // --- RSS & SIMULATION HANDLERS (UNCHANGED LOGIC, JUST HIDDEN IN EDIT MODE) ---
  const handleSimulateWebhook = () => {
      try {
          const data: IncomingWebhookData = JSON.parse(jsonInput);
          const result = newsAutomationService.processIncomingData(data);
          setSimulationResult(result);
          if(result.success) loadNews();
      } catch (e) {
          setSimulationResult({ success: false, message: 'JSON Inválido.' });
      }
  };

  const handleSyncRSS = async () => {
      setIsSyncing(true);
      try {
          const urls = db.getSettings().rssUrls || [];
          const result = await newsAutomationService.syncRSSFeeds(urls);
          setSyncMessage(result.message);
          loadNews();
      } catch (e) { setSyncMessage("Erro no Sync."); } 
      finally { setIsSyncing(false); }
  };


  // --- EDITOR VIEW (CMS) ---
  if (isEditing) {
    return (
        <div className="bg-white min-h-screen pb-20 animate-fade-in absolute top-0 left-0 w-full z-50">
            {/* Top Bar */}
            <div className="bg-slate-900 text-white p-4 sticky top-0 z-40 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsEditing(false)} className="hover:bg-slate-700 p-2 rounded-full transition">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold">Editor de Redação</h2>
                        <span className="text-xs text-slate-400">Novo Artigo - Treze de Maio SC</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-400">Status</p>
                        <p className="text-sm font-bold text-green-400">Rascunho</p>
                    </div>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2 shadow-lg transition">
                        <Save size={18} /> Publicar Notícia
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {validationError && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow flex items-start">
                            <AlertTriangle className="mr-2 flex-shrink-0" />
                            <div>
                                <p className="font-bold">Atenção!</p>
                                <p>{validationError}</p>
                            </div>
                        </div>
                    )}

                    {/* Section 1: Headers */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                            Manchetes
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Título da Notícia <span className="text-red-500">*</span></label>
                                <input 
                                    className="w-full text-xl font-bold p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="Ex: Prefeitura inaugura nova ponte no centro"
                                    value={currentNews.title || ''} 
                                    onChange={e => setCurrentNews({...currentNews, title: e.target.value})} 
                                    maxLength={75}
                                />
                                <div className="text-right text-xs text-slate-400 mt-1">{(currentNews.title?.length || 0)}/75</div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Subtítulo (Linha Fina) <span className="text-red-500">*</span></label>
                                <input 
                                    className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="Complemento que resume o fato em uma frase..."
                                    value={currentNews.subtitle || ''} 
                                    onChange={e => setCurrentNews({...currentNews, subtitle: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Content */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                             Corpo do Texto
                        </h3>
                        
                        <div className="bg-yellow-50 p-3 mb-4 rounded text-sm text-yellow-800 border border-yellow-200 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Política Editorial: Sem sensacionalismo, sem violência gráfica. Texto neutro.
                        </div>

                        <textarea 
                            className="w-full h-96 p-4 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-serif text-lg leading-relaxed" 
                            placeholder="Escreva o texto jornalístico aqui..."
                            value={currentNews.content || ''} 
                            onChange={e => setCurrentNews({...currentNews, content: e.target.value})} 
                        />
                         <div className="text-right text-xs text-slate-400 mt-1">Mínimo recomendado: 500 palavras</div>
                    </div>

                    {/* Section 3: Media */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs">3</span>
                             Multimídia (Imagens e Vídeo)
                        </h3>

                        {/* Image Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Galeria de Fotos (Upload) <span className="text-red-500">*</span></label>
                            
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                                {currentNews.gallery?.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-square bg-slate-100 rounded overflow-hidden border">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                        <button 
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X size={12} />
                                        </button>
                                        {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center py-0.5">Capa</span>}
                                    </div>
                                ))}
                                {(currentNews.gallery?.length || 0) < 5 && (
                                    <label className={`border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition aspect-square ${uploading ? 'opacity-50' : ''}`}>
                                        <Upload size={24} className="text-slate-400 mb-1" />
                                        <span className="text-xs text-slate-500 font-bold">Adicionar</span>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-slate-500">Formatos: JPG, PNG. Máximo 5 fotos. A primeira será a capa.</p>
                        </div>

                        {/* Video Embed */}
                        <div>
                             <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Video size={16} /> Vídeo (Opcional)
                             </label>
                             <input 
                                className="w-full p-2 border border-slate-300 rounded text-sm" 
                                placeholder="Link do YouTube, Instagram ou Facebook"
                                value={currentNews.videoUrl || ''} 
                                onChange={e => setCurrentNews({...currentNews, videoUrl: e.target.value})} 
                             />
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    
                    {/* Publishing Options */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Publicação</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Categoria <span className="text-red-500">*</span></label>
                            <select 
                                className="w-full p-2 border border-slate-300 rounded bg-slate-50 font-bold text-blue-900" 
                                value={currentNews.category} 
                                disabled
                            >
                                <option value="Treze de Maio - SC">Treze de Maio - SC</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Categoria obrigatória.</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Fonte da Notícia <span className="text-red-500">*</span></label>
                            <input 
                                className="w-full p-2 border border-slate-300 rounded" 
                                placeholder="Ex: Prefeitura, Bombeiros, etc."
                                value={currentNews.source || ''} 
                                onChange={e => setCurrentNews({...currentNews, source: e.target.value})} 
                            />
                        </div>

                         <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Link da Fonte (Opcional)</label>
                            <input 
                                className="w-full p-2 border border-slate-300 rounded text-sm" 
                                placeholder="https://..."
                                value={currentNews.sourceUrl || ''} 
                                onChange={e => setCurrentNews({...currentNews, sourceUrl: e.target.value})} 
                            />
                        </div>

                        <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                            <input 
                                type="checkbox" 
                                id="published"
                                className="w-4 h-4 text-blue-600 rounded"
                                checked={currentNews.published} 
                                onChange={e => setCurrentNews({...currentNews, published: e.target.checked})} 
                            />
                            <label htmlFor="published" className="text-sm font-medium text-slate-700">Visível no Site</label>
                        </div>
                    </div>

                    {/* SEO Preview */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <Eye size={16} /> SEO Preview
                        </h3>
                        
                        <div className="mb-4">
                             <label className="block text-sm font-bold text-slate-700 mb-1">Mini Descrição (SEO) <span className="text-red-500">*</span></label>
                             <textarea 
                                className="w-full p-2 border border-slate-300 rounded text-sm h-24" 
                                placeholder="Resumo curto para o Google (max 160 carac)..."
                                value={currentNews.excerpt || ''} 
                                onChange={e => setCurrentNews({...currentNews, excerpt: e.target.value})} 
                                maxLength={160}
                             />
                             <div className="text-right text-xs text-slate-400">{(currentNews.excerpt?.length || 0)}/160</div>
                        </div>

                        <div className="bg-white p-3 rounded border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Como aparece no Google:</div>
                            <div className="font-arial">
                                <div className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                                    {currentNews.title || 'Título da Notícia'} - Treze de Maio SC
                                </div>
                                <div className="text-[#006621] text-sm truncate">
                                    radiotrezedemaio.com.br › noticias › {currentNews.title?.slice(0,20).toLowerCase().replace(/ /g,'-')}...
                                </div>
                                <div className="text-[#545454] text-sm leading-snug line-clamp-2">
                                    {new Date().toLocaleDateString()} — {currentNews.excerpt || 'Descrição da notícia aparecerá aqui...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div>
      {/* Simulation Modal */}
      {isSimulating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
                 <div className="bg-purple-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Zap size={18} /> Simulador Webhook</h3>
                    <button onClick={() => setIsSimulating(false)}><X size={20} /></button>
                 </div>
                 <div className="p-6">
                    <div className="space-x-2 mb-4">
                         <button onClick={() => setJsonInput(JSON.stringify({cidade:"Treze de Maio - SC", titulo:"Teste Auto", conteudo_html:"<p>Conteúdo...</p>", nota: 8, tags:[], fonte:"Teste", data_publicacao: new Date().toISOString()}, null, 2))} className="text-xs bg-gray-100 px-2 py-1 rounded">Ex. Válido</button>
                    </div>
                    <textarea 
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full h-48 bg-slate-900 text-green-400 font-mono text-sm p-3 rounded"
                    />
                    {simulationResult && (
                        <div className={`mt-4 p-2 rounded text-sm ${simulationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {simulationResult.message}
                        </div>
                    )}
                 </div>
                 <div className="bg-gray-50 p-4 flex justify-end gap-2">
                     <button onClick={handleSimulateWebhook} className="bg-purple-600 text-white px-4 py-2 rounded font-bold">Executar</button>
                 </div>
             </div>
        </div>
      )}

      {/* REJECTED PREVIEW MODAL */}
      {previewItem && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle size={20} />
                          <span className="font-bold">Notícia Rejeitada: {previewItem.rejectionReason}</span>
                      </div>
                      <button onClick={() => setPreviewItem(null)} className="text-gray-500 hover:text-gray-800">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Body Scroll */}
                  <div className="overflow-y-auto p-8">
                      <h2 className="text-2xl font-black text-gray-900 mb-2">{previewItem.title}</h2>
                      <p className="text-lg text-gray-600 font-medium mb-6 leading-snug">{previewItem.subtitle || previewItem.excerpt}</p>
                      
                      {previewItem.imageUrl && (
                          <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                              <img src={previewItem.imageUrl} className="w-full h-64 object-cover" alt="Preview" />
                          </div>
                      )}
                      
                      <div className="prose prose-sm max-w-none text-gray-800 border-t border-gray-100 pt-6">
                           <div dangerouslySetInnerHTML={{ __html: previewItem.content }} />
                      </div>

                      <div className="mt-8 flex items-center justify-between text-xs text-gray-400 uppercase font-bold tracking-widest border-t pt-4">
                          <span>Data: {new Date(previewItem.createdAt).toLocaleDateString()}</span>
                          <span>Fonte: {previewItem.source}</span>
                      </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3">
                      <button 
                        onClick={() => handleDelete(previewItem.id, true)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-bold border border-transparent hover:border-red-200 transition"
                      >
                          Excluir Definitivamente
                      </button>
                      <button 
                        onClick={() => handleEdit(previewItem)}
                        className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
                      >
                          <Edit size={16} /> Editar e Aprovar
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Redação Jornalística</h1>
            <p className="text-sm text-gray-500">Gerenciamento profissional de conteúdo</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
             <button 
                onClick={handleSyncRSS} 
                disabled={isSyncing}
                className={`text-white px-4 py-2 rounded flex items-center transition font-bold shadow-sm border border-orange-600 ${isSyncing ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
                <Rss size={18} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sync...' : 'RSS Auto'}
            </button>

            <button onClick={() => setIsSimulating(true)} className="bg-purple-100 text-purple-700 px-4 py-2 rounded flex items-center hover:bg-purple-200 transition font-bold border border-purple-200">
                <Code size={18} className="mr-2" /> Webhook
            </button>
            <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition font-bold shadow-lg">
                <Plus size={18} className="mr-2" /> Criar Notícia
            </button>
        </div>
      </div>
      
      {syncMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 font-bold animate-fade-in ${syncMessage.includes('Rejeitadas') ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}`}>
            <CheckCircle size={20} /> {syncMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
          <button 
            onClick={() => setViewMode('active')}
            className={`pb-2 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${viewMode === 'active' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              <Archive size={16} />
              Publicadas / Rascunhos ({news.length})
          </button>
          <button 
            onClick={() => setViewMode('rejected')}
            className={`pb-2 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${viewMode === 'rejected' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              <Ban size={16} />
              Rejeitadas pela IA ({rejectedNews.length})
          </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
          {viewMode === 'active' ? (
              /* ACTIVE TABLE */
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="p-4">Manchete</th>
                        <th className="p-4">Fonte</th>
                        <th className="p-4">Publicação</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {news.map(item => (
                        <tr key={item.id} className="border-b hover:bg-slate-50 transition">
                            <td className="p-4">
                                <div className="font-bold text-slate-800">{item.title}</div>
                                <div className="text-xs text-slate-500 truncate max-w-xs">{item.subtitle || item.excerpt}</div>
                            </td>
                            <td className="p-4 text-sm text-slate-600">
                                {item.source}
                            </td>
                            <td className="p-4 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 text-xs rounded-full font-bold ${item.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {item.published ? 'NO AR' : 'RASCUNHO'}
                                </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    ))}
                    {news.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-400">
                                <div className="flex flex-col items-center">
                                    <Zap size={48} className="mb-2 opacity-20" />
                                    Nenhuma notícia ativa.
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
              </table>
          ) : (
             /* REJECTED TABLE */
             <div>
                <div className="bg-red-50 p-3 text-xs text-red-700 flex justify-between items-center border-b border-red-100">
                    <span className="flex items-center gap-2"><AlertTriangle size={14} /> Estas notícias não passaram nos filtros automáticos (Localização, Score ou Data).</span>
                    {rejectedNews.length > 0 && (
                        <button onClick={handleClearRejected} className="text-red-600 underline font-bold hover:text-red-800">Limpar Tudo</button>
                    )}
                </div>
                <table className="w-full text-left border-collapse bg-slate-50">
                    <thead className="bg-red-100 text-red-800 uppercase text-xs">
                        <tr>
                            <th className="p-4">Título</th>
                            <th className="p-4">Motivo da Rejeição</th>
                            <th className="p-4">Data Original</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rejectedNews.map(item => (
                            <tr key={item.id} className="border-b border-red-100 hover:bg-red-50 transition opacity-80 hover:opacity-100">
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{item.title}</div>
                                    <div className="text-xs text-slate-500">{item.source}</div>
                                </td>
                                <td className="p-4">
                                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-bold">
                                        {item.rejectionReason}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 text-right space-x-2">
                                    {/* PREVIEW BUTTON (EYE) */}
                                    <button 
                                        onClick={() => setPreviewItem(item)}
                                        className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-xs font-bold shadow-sm inline-flex items-center gap-1"
                                        title="Ler Notícia"
                                    >
                                        <Eye size={14} /> Ler
                                    </button>

                                    <button 
                                        onClick={() => handleEdit(item)} 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm inline-flex items-center gap-1"
                                    >
                                        <Edit size={14} /> Aprovar
                                    </button>
                                    <button onClick={() => handleDelete(item.id, true)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                         {rejectedNews.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle size={48} className="mb-2 opacity-20 text-green-500" />
                                        Nenhuma notícia rejeitada. O filtro está limpo.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
          )}
      </div>
    </div>
  );
};

export default AdminNews;
