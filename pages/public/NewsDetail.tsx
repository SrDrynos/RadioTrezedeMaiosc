
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { NewsItem } from '../../types';
import { Calendar, ChevronLeft, Share2, Tag, Clock, ExternalLink, PlayCircle } from 'lucide-react';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const item = db.getNewsItem(id);
      setNewsItem(item);
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

  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
  };

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

  // Gallery Logic: Combine `imageUrl` (main) + `gallery`
  // Some legacy items might only have `imageUrl`. New items have `gallery`[0] as main.
  const displayGallery = newsItem.gallery && newsItem.gallery.length > 0 
      ? newsItem.gallery 
      : (newsItem.imageUrl ? [newsItem.imageUrl] : []);

  const isHtml = /<[a-z][\s\S]*>/i.test(newsItem.content);
  const youtubeId = newsItem.videoUrl ? getYouTubeId(newsItem.videoUrl) : null;

  return (
    <div className="bg-white min-h-screen pb-12 animate-fade-in">
        {/* HERO SECTION */}
        <div className="relative h-[400px] md:h-[500px] w-full">
             <img src={newsItem.imageUrl || displayGallery[0]} alt={newsItem.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
             
             <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 container mx-auto">
                <div className="max-w-5xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-yellow-400 text-blue-900 text-xs font-black px-3 py-1 rounded uppercase tracking-wide shadow-md">
                            {newsItem.category}
                        </span>
                        {newsItem.source && (
                            <span className="text-gray-300 text-xs font-medium flex items-center bg-black/50 px-2 py-1 rounded border border-white/20">
                                Fonte: {newsItem.source}
                            </span>
                        )}
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2 shadow-sm leading-tight">
                        {newsItem.title}
                    </h1>
                    
                    {/* SUBTITLE (LEAD) */}
                    {newsItem.subtitle && (
                        <h2 className="text-xl md:text-2xl font-medium text-gray-200 mb-4 leading-snug font-sans">
                            {newsItem.subtitle}
                        </h2>
                    )}

                    <div className="flex flex-wrap items-center text-gray-400 text-sm gap-6 mt-6 font-medium border-t border-white/10 pt-4">
                        <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(newsItem.createdAt).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Clock size={16} /> Leitura: 3 min</div>
                    </div>
                </div>
             </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
            {/* Breadcrumb */}
            <div className="py-6 border-b border-gray-100 mb-8">
                <Link to="/noticias" className="inline-flex items-center text-gray-500 hover:text-blue-600 font-bold transition text-sm uppercase tracking-wide">
                    <ChevronLeft size={16} className="mr-1" /> Voltar
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Main Content */}
                <div className="lg:w-2/3">
                    
                    {/* Article Body */}
                    <div className="text-gray-800 leading-relaxed text-lg font-serif">
                        
                        {/* Mini Description (Excerpt) Highlight */}
                        {newsItem.excerpt && (
                            <p className="font-sans text-xl text-gray-600 mb-8 font-medium leading-relaxed">
                                {newsItem.excerpt}
                            </p>
                        )}

                        {/* Ad Inside Content */}
                        <AdSpace label="Anúncio (Artigo Topo)" />

                        {/* Video Embed */}
                        {youtubeId ? (
                            <div className="mb-8 aspect-video rounded-xl overflow-hidden shadow-lg">
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube.com/embed/${youtubeId}`} 
                                    title="YouTube video player" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : newsItem.videoUrl && (
                             <div className="mb-8 p-4 bg-gray-100 rounded-lg flex items-center gap-3">
                                <PlayCircle size={24} className="text-blue-600" />
                                <a href={newsItem.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                                    Assista ao vídeo da matéria (Link Externo)
                                </a>
                             </div>
                        )}

                        {/* Content Rendering */}
                        <div className="prose prose-lg prose-blue max-w-none text-gray-800">
                            {isHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: newsItem.content }} />
                            ) : (
                                newsItem.content.split('\n').map((paragraph, index) => (
                                    paragraph.trim() && <p key={index} className="mb-5">{paragraph}</p>
                                ))
                            )}
                        </div>

                        {/* Source Citation Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                             <p className="text-sm text-gray-500 font-sans">
                                <strong>Fonte:</strong> {newsItem.source}
                                {newsItem.sourceUrl && (
                                    <>
                                        {' — '}
                                        <a href={newsItem.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                                            Acessar original <ExternalLink size={12} className="ml-1" />
                                        </a>
                                    </>
                                )}
                             </p>
                        </div>
                    </div>

                    {/* Image Gallery Grid */}
                    {displayGallery.length > 1 && (
                        <div className="mt-12">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-600 block"></span> Galeria de Fotos
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                {displayGallery.map((img, idx) => (
                                    <div key={idx} className="relative aspect-[4/3] group overflow-hidden rounded-lg cursor-pointer bg-gray-100">
                                        <img src={img} alt={`Galeria ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {newsItem.tags && newsItem.tags.length > 0 && (
                        <div className="mt-10 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Tag size={16}/> Tópicos Relacionados</h4>
                            <div className="flex flex-wrap gap-2">
                                {newsItem.tags.map(tag => (
                                    <Link key={tag} to="/noticias" className="bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 px-3 py-1 rounded text-sm transition font-medium">
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Share Buttons */}
                    <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-700 mb-4 text-center">Compartilhe esta notícia</h4>
                        <div className="flex gap-4">
                            <button className="flex-1 bg-[#1877F2] text-white font-bold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm">
                                <Share2 size={18} /> Facebook
                            </button>
                            <button className="flex-1 bg-[#25D366] text-white font-bold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm">
                                <Share2 size={18} /> WhatsApp
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:w-1/3 space-y-8">
                    {/* Latest Widget could go here */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wide">Mais Lidas</h3>
                        <div className="space-y-4">
                             {/* Placeholder items since we don't have read count logic */}
                             {[1,2,3].map(i => (
                                 <div key={i} className="flex gap-3 items-start group cursor-pointer">
                                     <div className="text-3xl font-black text-gray-200 leading-none group-hover:text-blue-200">{i}</div>
                                     <div>
                                         <span className="text-xs text-blue-600 font-bold uppercase">Cidade</span>
                                         <p className="text-sm font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition">
                                            Notícia de destaque da semana em Treze de Maio...
                                         </p>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>

                    <AdSpace label="Publicidade Lateral (300x250)" height="h-64" />
                    <AdSpace label="Publicidade Vertical (300x600)" height="h-[600px]" />
                </aside>
            </div>
        </div>
    </div>
  );
};

export default NewsDetail;
