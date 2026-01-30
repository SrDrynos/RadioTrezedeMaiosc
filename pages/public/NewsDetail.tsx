
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { NewsItem } from '../../types';
import { Calendar, ChevronLeft, Share2, Tag, Clock, ExternalLink } from 'lucide-react';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const item = db.getNewsItem(id);
      setNewsItem(item);
      // Update Page Title for SEO
      if (item) {
          document.title = `${item.title} | Notícias de Treze de Maio`;
      }
    }
    return () => {
        document.title = "Rádio Treze de Maio";
    };
  }, [id]);

  const AdSpace = ({ label, height = "h-32" }: { label: string, height?: string }) => (
    <div className={`w-full bg-gray-100 border-2 border-dashed border-gray-300 ${height} flex flex-col items-center justify-center text-gray-500 my-8 rounded-lg`}>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Publicidade</span>
        <span className="font-semibold">{label}</span>
    </div>
  );

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Notícia não encontrada</h2>
        <Link to="/noticias" className="text-blue-600 hover:underline flex items-center">
            <ChevronLeft size={20} /> Voltar para notícias
        </Link>
      </div>
    );
  }

  // Determine if content is HTML (from webhook) or Plain Text (from manual admin)
  // Simple check: does it contain tags?
  const isHtml = /<[a-z][\s\S]*>/i.test(newsItem.content);

  return (
    <div className="bg-white min-h-screen pb-12 animate-fade-in">
        {/* Header Image */}
        <div className="relative h-[400px] md:h-[500px] w-full">
             <img src={newsItem.imageUrl} alt={newsItem.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
             <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 container mx-auto">
                <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-yellow-400 text-blue-900 text-xs font-black px-3 py-1 rounded uppercase tracking-wide shadow-md">
                            {newsItem.category}
                        </span>
                        {newsItem.source && (
                            <span className="text-gray-300 text-xs font-medium flex items-center bg-black/50 px-2 py-1 rounded">
                                <ExternalLink size={10} className="mr-1" /> Fonte: {newsItem.source}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4 shadow-sm leading-tight">
                        {newsItem.title}
                    </h1>
                    <div className="flex flex-wrap items-center text-gray-300 text-sm gap-6 mt-4 font-medium">
                        <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(newsItem.createdAt).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Clock size={16} /> Leitura estimada: 3 min</div>
                    </div>
                </div>
             </div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
            {/* Navigation & Breadcrumb */}
            <div className="py-6">
                <Link to="/noticias" className="inline-flex items-center text-gray-600 hover:text-blue-600 font-bold transition">
                    <ChevronLeft size={20} className="mr-1" /> Voltar para Notícias
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Main Content */}
                <div className="md:w-3/4">
                    {/* Article Body */}
                    <div className="bg-white text-gray-800 leading-relaxed text-lg">
                        {/* Excerpt Highlight */}
                        <div className="text-xl md:text-2xl font-serif text-gray-600 mb-8 border-l-4 border-blue-600 pl-6 italic">
                            {newsItem.excerpt}
                        </div>

                        {/* Ad Inside Content */}
                        <AdSpace label="Anúncio (Artigo)" />

                        {/* Content Rendering */}
                        <div className="prose prose-lg prose-blue max-w-none">
                            {isHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: newsItem.content }} />
                            ) : (
                                newsItem.content.split('\n').map((paragraph, index) => (
                                    <p key={index} className="mb-4">{paragraph}</p>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {newsItem.tags && newsItem.tags.length > 0 && (
                        <div className="mt-10 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Tag size={16}/> Tópicos Relacionados</h4>
                            <div className="flex flex-wrap gap-2">
                                {newsItem.tags.map(tag => (
                                    <Link key={tag} to="/noticias" className="bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 px-3 py-1 rounded text-sm transition">
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Share Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                            <Share2 size={18} /> Compartilhar no Facebook
                        </button>
                        <button className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                            <Share2 size={18} /> WhatsApp
                        </button>
                    </div>
                </div>

                {/* Sidebar (Ads & related) */}
                <aside className="md:w-1/4 space-y-8">
                    <AdSpace label="Sidebar Ad (300x250)" height="h-64" />
                    <AdSpace label="Sidebar Ad (300x600)" height="h-[600px]" />
                </aside>
            </div>
        </div>
    </div>
  );
};

export default NewsDetail;
