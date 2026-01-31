
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { NewsItem } from '../../types';
import { Calendar, Tag, ChevronRight, Radio, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // SEO: Set Page Title
    document.title = "Notícias de Treze de Maio - SC | Portal Oficial da Rádio";
    setNews(db.getNews(true));
  }, []);

  const filteredNews = filter === 'all' ? news : news.filter(n => n.category === filter);

  const handleImageError = (id: string) => {
      setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  // Helper para pegar o domínio da fonte
  const getSourceFavicon = (url?: string) => {
      if (!url) return null;
      try {
          const domain = new URL(url).hostname;
          return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      } catch (e) {
          return null;
      }
  };

  // Mapeamento de categorias para exibição amigável
  const categories = [
      { id: 'all', label: 'Todas' },
      { id: 'Treze de Maio - SC', label: 'Treze de Maio' },
      { id: 'Cidades Vizinhas', label: 'Cidades Vizinhas' },
      { id: 'Região', label: 'Região' },
      { id: 'Avisos', label: 'Avisos' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 animate-fade-in">
      <div className="container mx-auto px-4">
        
        {/* Header SEO Otimizado */}
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-4 tracking-tight">
                Notícias de Treze de Maio
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Cobertura completa sobre obras, eventos, saúde e utilidade pública da nossa cidade.
            </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                        filter === cat.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredNews.map((item, index) => {
                const hasImgError = imgErrors[item.id] || !item.imageUrl;
                const favicon = getSourceFavicon(item.sourceUrl);

                return (
                    <React.Fragment key={item.id}>
                        <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100 group">
                            <Link to={`/noticias/${item.id}`} className="relative h-56 overflow-hidden block bg-slate-100">
                                {hasImgError ? (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-800 flex flex-col items-center justify-center text-white/80 p-6 text-center">
                                        <Radio size={48} className="mb-2 opacity-50" />
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Rádio Treze de Maio</span>
                                    </div>
                                ) : (
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.title} 
                                        onError={() => handleImageError(item.id)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                )}
                                
                                <div className="absolute top-4 left-4">
                                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded shadow uppercase">
                                        {item.category}
                                    </span>
                                </div>
                            </Link>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
                                    <div className="flex items-center">
                                        <Calendar size={12} className="mr-1" />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                    
                                    {/* Exibição da Fonte com Ícone */}
                                    {item.source && (
                                        <div className="flex items-center gap-1.5" title={`Fonte: ${item.source}`}>
                                            {favicon ? (
                                                <img src={favicon} alt="" className="w-4 h-4 rounded-sm" />
                                            ) : (
                                                <Globe size={12} className="text-blue-400" />
                                            )}
                                            <span className="text-blue-600 font-bold truncate max-w-[100px]">{item.source}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <Link to={`/noticias/${item.id}`} className="block mb-3">
                                    <h2 className="text-xl font-bold text-gray-800 leading-tight hover:text-blue-700 transition-colors">
                                        {item.title}
                                    </h2>
                                </Link>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                    {item.excerpt}
                                </p>
                                
                                {item.tags && item.tags.length > 0 && (
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {item.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                <Tag size={10} className="mr-1" /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <Link to={`/noticias/${item.id}`} className="mt-auto w-full text-center bg-blue-50 text-blue-700 font-bold py-2 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1 group-hover:bg-blue-600 group-hover:text-white">
                                    Ler Matéria Completa <ChevronRight size={16} />
                                </Link>
                            </div>
                        </article>
                    </React.Fragment>
                );
            })}
        </div>

        {filteredNews.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                Nenhuma notícia encontrada. Aguardando atualização automática.
            </div>
        )}
      </div>
    </div>
  );
};

export default News;
