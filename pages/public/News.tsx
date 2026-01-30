
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { NewsItem } from '../../types';
import { Calendar, Tag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // SEO: Set Page Title
    document.title = "Notícias de Treze de Maio - SC | Portal Oficial da Rádio";
    setNews(db.getNews(true));
  }, []);

  const filteredNews = filter === 'all' ? news : news.filter(n => n.category === filter);

  // AdSense Placeholder Component
  const AdSpace = ({ label }: { label: string }) => (
    <div className="w-full bg-gray-200 border-2 border-dashed border-gray-300 h-32 flex flex-col items-center justify-center text-gray-500 my-8 rounded-lg">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Publicidade</span>
        <span className="font-semibold">{label}</span>
        <span className="text-xs">(Espaço reservado para Google AdSense)</span>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
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
            {['all', 'Cidade', 'Região', 'Avisos'].map((cat) => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                        filter === cat
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {cat === 'all' ? 'Todas' : cat}
                </button>
            ))}
        </div>

        {/* AdSense Top */}
        <div className="max-w-4xl mx-auto">
            <AdSpace label="Banner Topo (728x90)" />
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredNews.map((item, index) => (
                <React.Fragment key={item.id}>
                    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100">
                        <Link to={`/noticias/${item.id}`} className="relative h-56 overflow-hidden group">
                            <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
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
                                {item.source && (
                                    <span className="text-blue-500 font-semibold">{item.source}</span>
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

                            <Link to={`/noticias/${item.id}`} className="mt-auto w-full text-center bg-blue-50 text-blue-700 font-bold py-2 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1">
                                Ler Matéria Completa <ChevronRight size={16} />
                            </Link>
                        </div>
                    </article>

                    {/* Insert Ad after every 3rd item or specific positions */}
                    {(index + 1) % 3 === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <AdSpace label="Banner In-Feed (Responsivo)" />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>

        {filteredNews.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                Nenhuma notícia encontrada. Aguardando atualização automática.
            </div>
        )}
        
        {/* AdSense Bottom */}
        <div className="max-w-4xl mx-auto mt-12">
             <AdSpace label="Banner Rodapé (728x90)" />
        </div>
      </div>
    </div>
  );
};

export default News;
