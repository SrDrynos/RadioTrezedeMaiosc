
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { newsAutomationService } from '../../services/newsAutomation';
import { NewsItem, IncomingWebhookData } from '../../types';
import { Trash2, Edit, Plus, X, Zap, Code, AlertTriangle, Rss, RefreshCw } from 'lucide-react';

const AdminNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false); // Modal for automation simulation
  const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({});
  
  // State for automation simulation
  const [jsonInput, setJsonInput] = useState('');
  const [simulationResult, setSimulationResult] = useState<{success: boolean, message: string} | null>(null);

  // State for RSS Sync
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = () => setNews(db.getNews());

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta notícia?')) {
      db.deleteNewsItem(id);
      loadNews();
    }
  };

  const handleEdit = (item: NewsItem) => {
    setCurrentNews(item);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentNews({
      title: '', excerpt: '', content: '', category: 'Cidade', imageUrl: '', published: true
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave = {
        ...currentNews,
        id: currentNews.id || Date.now().toString(),
        createdAt: currentNews.createdAt || new Date().toISOString()
    } as NewsItem;

    db.saveNewsItem(itemToSave);
    setIsEditing(false);
    loadNews();
  };

  const handleSimulateWebhook = () => {
      try {
          const data: IncomingWebhookData = JSON.parse(jsonInput);
          const result = newsAutomationService.processIncomingData(data);
          setSimulationResult(result);
          if(result.success) loadNews();
      } catch (e) {
          setSimulationResult({ success: false, message: 'Erro: JSON inválido. Verifique a sintaxe.' });
      }
  };

  const handleSyncRSS = async () => {
      setIsSyncing(true);
      setSyncMessage(null);
      
      const settings = db.getSettings();
      const urls = settings.rssUrls || [];

      if (urls.length === 0) {
          setSyncMessage("Erro: Nenhuma URL de RSS configurada em Configurações.");
          setIsSyncing(false);
          return;
      }

      try {
          const result = await newsAutomationService.syncRSSFeeds(urls);
          setSyncMessage(result.message);
          if (result.count > 0) loadNews();
      } catch (e) {
          setSyncMessage("Erro ao sincronizar feeds.");
      } finally {
          setIsSyncing(false);
          // Clear message after 5 seconds
          setTimeout(() => setSyncMessage(null), 5000);
      }
  };

  // Pre-filled valid JSON for quick testing
  const loadValidExample = () => {
      const example = {
          cidade: "Treze de Maio - SC",
          titulo: "Prefeitura inaugura nova unidade de saúde no centro",
          conteudo_html: "<p>A <strong>Prefeitura de Treze de Maio</strong> inaugurou nesta manhã a nova UBS...</p><img src='https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000' />",
          nota: 8.5,
          tags: ["Saúde", "Obras", "Prefeitura"],
          fonte: "Assessoria de Imprensa",
          data_publicacao: new Date().toISOString()
      };
      setJsonInput(JSON.stringify(example, null, 2));
      setSimulationResult(null);
  };

  // Pre-filled invalid JSON (Wrong city or low score)
  const loadInvalidExample = () => {
    const example = {
        cidade: "Tubarão - SC",
        titulo: "Acidente na BR-101 causa congestionamento",
        conteudo_html: "<p>Trânsito lento na rodovia...</p>",
        nota: 6.0,
        tags: ["Trânsito"],
        fonte: "Polícia Rodoviária",
        data_publicacao: new Date().toISOString()
    };
    setJsonInput(JSON.stringify(example, null, 2));
    setSimulationResult(null);
  };

  if (isSimulating) {
      return (
        <div className="bg-white p-6 rounded-xl shadow animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                    <Zap size={24} fill="currentColor" /> Simulador de API / Webhook
                </h2>
                <button onClick={() => setIsSimulating(false)}><X className="text-gray-500" /></button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">Regras de Automação:</h4>
                <ul className="list-disc list-inside text-sm text-blue-800">
                    <li>Cidade deve ser obrigatoriamente <strong>Treze de Maio</strong>.</li>
                    <li>Nota de relevância deve ser <strong>maior ou igual a 7.5</strong>.</li>
                </ul>
            </div>

            <div className="mb-4 space-x-4">
                <button onClick={loadValidExample} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded font-bold hover:bg-green-200">Exemplo Válido</button>
                <button onClick={loadInvalidExample} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded font-bold hover:bg-red-200">Exemplo Inválido</button>
            </div>

            <textarea 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-64 bg-slate-900 text-green-400 font-mono text-sm p-4 rounded-lg outline-none mb-4"
                placeholder='Cole o JSON aqui...'
            />

            {simulationResult && (
                <div className={`p-4 rounded-lg mb-4 text-sm font-bold flex items-center gap-2 ${simulationResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {simulationResult.success ? <Zap size={18} /> : <AlertTriangle size={18} />}
                    {simulationResult.message}
                </div>
            )}

            <div className="flex justify-end gap-2">
                <button onClick={() => setIsSimulating(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button onClick={handleSimulateWebhook} className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700 flex items-center gap-2">
                    <Code size={18} /> Processar JSON
                </button>
            </div>
        </div>
      );
  }

  if (isEditing) {
    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{currentNews.id ? 'Editar Notícia Manual' : 'Nova Notícia Manual'}</h2>
                <button onClick={() => setIsEditing(false)}><X className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input className="w-full border p-2 rounded" value={currentNews.title || ''} onChange={e => setCurrentNews({...currentNews, title: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Resumo</label>
                    <input className="w-full border p-2 rounded" value={currentNews.excerpt || ''} onChange={e => setCurrentNews({...currentNews, excerpt: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <select className="w-full border p-2 rounded" value={currentNews.category} onChange={e => setCurrentNews({...currentNews, category: e.target.value as any})}>
                            <option value="Cidade">Cidade</option>
                            <option value="Região">Região</option>
                            <option value="Avisos">Avisos</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                        <input className="w-full border p-2 rounded" value={currentNews.imageUrl || ''} onChange={e => setCurrentNews({...currentNews, imageUrl: e.target.value})} placeholder="https://..." required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Conteúdo (Suporta HTML simples)</label>
                    <textarea className="w-full border p-2 rounded h-32" value={currentNews.content || ''} onChange={e => setCurrentNews({...currentNews, content: e.target.value})} required />
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" checked={currentNews.published} onChange={e => setCurrentNews({...currentNews, published: e.target.checked})} />
                    <label className="text-sm">Publicar Imediatamente</label>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Salvar Manualmente</button>
            </form>
        </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Notícias</h1>
            <p className="text-sm text-gray-500">Controle manual e automático</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
             <button 
                onClick={handleSyncRSS} 
                disabled={isSyncing}
                className={`text-white px-4 py-2 rounded flex items-center transition font-bold shadow-sm border border-orange-600 ${isSyncing ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
                <Rss size={18} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Buscando...' : 'Buscar RSS Hoje'}
            </button>

            <button onClick={() => setIsSimulating(true)} className="bg-purple-100 text-purple-700 px-4 py-2 rounded flex items-center hover:bg-purple-200 transition font-bold border border-purple-200">
                <Zap size={18} className="mr-2" /> Simular Webhook
            </button>
            <button onClick={handleAddNew} className="bg-green-600 text-white px-4 py-2 rounded flex items-center hover:bg-green-700 transition font-bold shadow-sm">
                <Plus size={18} className="mr-2" /> Nova Manual
            </button>
        </div>
      </div>
      
      {syncMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 font-bold animate-fade-in ${syncMessage.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <RefreshCw size={20} />
            {syncMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                    <th className="p-4">Título</th>
                    <th className="p-4">Origem</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                </tr>
            </thead>
            <tbody>
                {news.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">
                            {item.title}
                            <div className="text-xs text-gray-400 mt-1">{item.category}</div>
                        </td>
                        <td className="p-4 text-sm">
                            {item.source ? (
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1">
                                    <Rss size={10} /> {item.source}
                                </span>
                            ) : (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Manual</span>
                            )}
                        </td>
                        <td className="p-4 text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${item.published ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                {item.published ? 'Publicado' : 'Rascunho'}
                            </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                        </td>
                    </tr>
                ))}
                {news.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">Nenhuma notícia cadastrada.</td>
                    </tr>
                )}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default AdminNews;
