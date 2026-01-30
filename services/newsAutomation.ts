
import { IncomingWebhookData, NewsItem } from '../types';
import { db } from './db';

export const newsAutomationService = {
  /**
   * Processa o JSON recebido via API/Webhook
   * Retorna { success: boolean, message: string }
   */
  processIncomingData: (data: IncomingWebhookData) => {
    // 1. Validação da Cidade (Rigorosa)
    const validCity = "Treze de Maio";
    // Normaliza para comparar (remove acentos básicos e lowercase)
    const inputCity = data.cidade.toLowerCase();
    
    if (!inputCity.includes("treze de maio")) {
      return { success: false, message: `REJEITADA: Notícia de outra cidade (${data.cidade}). Permitido apenas Treze de Maio - SC.` };
    }

    // 2. Validação da Nota (Qualidade)
    if (data.nota < 7.5) {
      return { success: false, message: `REJEITADA: Nota de relevância baixa (${data.nota}). Mínimo exigido: 7.5` };
    }

    // 3. Processamento de Conteúdo (HTML -> Excerpt & Image extraction)
    const excerpt = stripHtml(data.conteudo_html).substring(0, 150) + "...";
    const extractedImage = extractImageSrc(data.conteudo_html);
    
    // Fallback image se não houver imagem no HTML
    const finalImage = extractedImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop';

    // 4. Mapeamento para o formato interno
    const newNewsItem: NewsItem = {
      id: Date.now().toString(),
      title: data.titulo,
      content: data.conteudo_html, // Mantém o HTML original para a página de detalhes
      excerpt: excerpt,
      category: 'Cidade', // Default para automação local
      imageUrl: finalImage,
      createdAt: data.data_publicacao || new Date().toISOString(),
      published: true,
      source: data.fonte,
      tags: data.tags
    };

    // 5. Salvar no Banco de Dados
    db.saveNewsItem(newNewsItem);

    return { success: true, message: `APROVADA: Notícia publicada com sucesso! (Nota: ${data.nota})` };
  },

  /**
   * Syncs with configured RSS feeds.
   * Fetches data via a proxy, filters for TODAY's news, and saves.
   */
  async syncRSSFeeds(urls: string[]) {
    if (!urls || urls.length === 0) return { count: 0, message: "Nenhuma URL RSS configurada." };

    let addedCount = 0;
    const existingTitles = new Set(db.getNews().map(n => n.title));

    for (const url of urls) {
       try {
         // Using rss2json as a CORS proxy and XML parser
         const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
         const data = await res.json();
         
         if (data.status === 'ok' && Array.isArray(data.items)) {
           for (const item of data.items) {
             // Check if published TODAY (or recently if timezone differs slightly)
             // item.pubDate format: "2024-05-20 14:30:00"
             const pubDate = new Date(item.pubDate.replace(/-/g, '/')); // Fix for some browsers
             const today = new Date();
             
             // Check if dates match (ignoring time)
             const isToday = pubDate.toDateString() === today.toDateString();
             
             // Check duplication
             if (isToday && !existingTitles.has(item.title)) {
               
               const image = item.enclosure?.link || item.thumbnail || extractFirstImage(item.content) || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1000';
               const cleanContent = item.content || item.description || "";

               const newItem: NewsItem = {
                 id: Date.now().toString() + Math.random().toString().slice(2,5),
                 title: item.title,
                 content: cleanContent,
                 excerpt: stripHtml(item.description || cleanContent).substring(0, 150) + "...",
                 category: 'Região', // RSS defaults to region usually
                 imageUrl: image,
                 createdAt: new Date().toISOString(), // Use current time of import
                 published: true,
                 source: data.feed?.title || 'RSS Automático',
                 tags: ['RSS', 'Automático']
               };

               db.saveNewsItem(newItem);
               existingTitles.add(item.title);
               addedCount++;
             }
           }
         }
       } catch(e) {
         console.error("Error fetching RSS:", url, e);
       }
    }
    
    if (addedCount === 0) {
        return { count: 0, message: "Nenhuma notícia nova de HOJE encontrada nos feeds." };
    }

    return { count: addedCount, message: `${addedCount} notícias importadas com sucesso.` };
  }
};

// Helpers
function stripHtml(html: string) {
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

function extractImageSrc(html: string) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const img = tmp.querySelector('img');
    return img ? img.src : null;
}

function extractFirstImage(html: string) {
    if(!html) return null;
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
}
