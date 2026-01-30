
import { IncomingWebhookData, NewsItem } from '../types';
import { db } from './db';

export const newsAutomationService = {
  /**
   * Processa o JSON recebido via API/Webhook
   */
  processIncomingData: (data: IncomingWebhookData) => {
    // 1. Validação da Cidade (Rigorosa)
    const normalizedCity = (data.cidade || "").toLowerCase();
    const normalizedContent = (data.titulo + " " + data.conteudo_html).toLowerCase();
    
    // Regra Crítica: Deve mencionar Treze de Maio
    if (!normalizedCity.includes("treze de maio") && !normalizedContent.includes("treze de maio")) {
      return { success: false, message: `FONTE NÃO AUTORIZADA – CONTEÚDO IGNORADO (Não menciona Treze de Maio)` };
    }

    // 2. Validação da Nota (Qualidade)
    if (data.nota < 7.5) {
      return { success: false, message: `NOTÍCIA REPROVADA – SCORE INSUFICIENTE (${data.nota}/10)` };
    }

    const excerpt = stripHtml(data.conteudo_html).substring(0, 160) + "...";
    
    // Tenta extrair imagem original do HTML
    const extractedImage = extractImageFromHtml(data.conteudo_html);
    const finalImage = extractedImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop';

    // Adiciona fonte ao final do conteúdo HTML se fornecida
    let finalContent = data.conteudo_html;
    if (data.fonte) {
        finalContent += `<p><em>Fonte: ${data.fonte}</em></p>`;
    }

    const newNewsItem: NewsItem = {
      id: Date.now().toString(),
      title: data.titulo,
      content: finalContent,
      excerpt: excerpt,
      category: 'Treze de Maio - SC',
      imageUrl: finalImage,
      createdAt: data.data_publicacao || new Date().toISOString(),
      published: true,
      source: data.fonte || "Redação Automática",
      tags: data.tags
    };

    db.saveNewsItem(newNewsItem);
    return { success: true, message: `APROVADA: Notícia publicada com sucesso! (Nota: ${data.nota})` };
  },

  /**
   * Syncs with RSS feeds using the strict rules
   */
  async syncRSSFeeds(urls: string[]) {
    if (!urls || urls.length === 0) return { count: 0, message: "Nenhuma URL RSS configurada." };

    let addedCount = 0;
    let rejectedCount = 0;
    let rejectedReason = "";
    
    const existingTitles = new Set(db.getNews().map(n => n.title));

    for (const url of urls) {
       try {
         const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
         const data = await res.json();
         const feedTitle = data.feed?.title || "Internet";
         
         if (data.status === 'ok' && Array.isArray(data.items)) {
           for (const item of data.items) {
             // Clean Content
             const cleanContent = item.content || item.description || "";
             const fullText = (item.title + " " + cleanContent).toLowerCase();

             // 1. FILTRO DE LOCALIZAÇÃO (REGRA CRÍTICA)
             if (!fullText.includes("treze de maio")) {
                 rejectedCount++;
                 rejectedReason = "Não menciona Treze de Maio";
                 continue;
             }

             // 2. DATE FILTER (Last 5 days to be safe)
             const pubDate = new Date(item.pubDate.replace(/-/g, '/'));
             const today = new Date();
             const timeDiff = today.getTime() - pubDate.getTime();
             const daysDiff = timeDiff / (1000 * 3600 * 24);
             
             if (daysDiff > 5) {
                 rejectedCount++;
                 rejectedReason = "Notícia antiga (> 5 dias)";
                 continue;
             }

             if (existingTitles.has(item.title)) continue;

             // 3. ANÁLISE E CLASSIFICAÇÃO (SCORE)
             const score = calculateScore(item, fullText);
             
             if (score < 7.5) {
                 console.log(`Rejected: ${item.title} (Score: ${score})`);
                 rejectedCount++;
                 rejectedReason = `Score Insuficiente (${score})`;
                 continue;
             }

             // 4. GERAR CONTEÚDO (ESTRUTURA SEO OBRIGATÓRIA + CITAÇÃO DE FONTE)
             const formattedHtml = generateSeoStructure(item, feedTitle);
             
             // 5. EXTRAÇÃO DE IMAGEM ORIGINAL (Prioridade Máxima)
             // Ordem: Enclosure (RSS padrão) > Thumbnail > Imagem dentro do HTML > Placeholder
             const image = item.enclosure?.link || item.thumbnail || extractImageFromHtml(cleanContent) || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1000';

             const newItem: NewsItem = {
                 id: Date.now().toString() + Math.random().toString().slice(2,5),
                 title: item.title, // Título jornalístico
                 content: formattedHtml, // Texto otimizado HTML com Fonte no final
                 excerpt: stripHtml(item.description || cleanContent).substring(0, 150) + "...",
                 category: determineCategory(fullText),
                 imageUrl: image,
                 createdAt: pubDate.toISOString(),
                 published: true,
                 source: feedTitle,
                 tags: ['Automático', 'Treze de Maio']
             };

             db.saveNewsItem(newItem);
             existingTitles.add(item.title);
             addedCount++;
           }
         }
       } catch(e) {
         console.error("Error fetching RSS:", url, e);
       }
    }
    
    if (addedCount === 0) {
        return { count: 0, message: `Nenhuma notícia aprovada. ${rejectedCount > 0 ? `(${rejectedCount} rejeitadas: ${rejectedReason})` : ''}` };
    }

    return { count: addedCount, message: `${addedCount} notícias geradas e publicadas com sucesso.` };
  }
};

// --- HELPER FUNCTIONS FOR LOGIC ---

function calculateScore(item: any, text: string): number {
    let score = 0;
    
    // Relevância Local (0-3)
    if (item.title.toLowerCase().includes("treze de maio")) score += 3;
    else if (text.includes("treze de maio")) score += 2;
    
    // Interesse Público / Palavras-chave (0-2)
    const keywords = ["incêndio", "obras", "saúde", "prefeitura", "festa", "acidente", "polícia", "bombeiros", "segurança", "evento", "comunicado", "falecimento", "nota"];
    const hasKeyword = keywords.some(k => text.includes(k));
    if (hasKeyword) score += 2;

    // Atualidade (0-2)
    score += 2; 

    // Clareza/Multimídia (0-1)
    if (item.thumbnail || item.enclosure) score += 1;

    // SEO Regional (0-2)
    if (text.includes("santa catarina") || text.includes("sc")) score += 2;

    return Math.min(score, 10);
}

function generateSeoStructure(item: any, sourceName: string): string {
    const rawDesc = stripHtml(item.description || item.content).trim();
    // Remove "Leia mais" artifacts typical in RSS
    const cleanDesc = rawDesc.replace(/Leia mais.*/i, '').replace(/\.\.\.$/, '');
    
    const sentences = cleanDesc.split('. ').filter(s => s.length > 10);
    const intro = sentences[0] ? sentences[0] + '.' : cleanDesc;
    const details = sentences.slice(1).join('. ') || "Mais informações estão sendo apuradas.";

    return `
      <p><strong>Introdução:</strong> ${intro} O fato ocorreu no município de Treze de Maio, Santa Catarina.</p>

      <h2>O que aconteceu</h2>
      <p>${details}</p>
      
      <h2>Detalhes da ocorrência</h2>
      <p>A situação mobilizou a atenção da comunidade local. De acordo com informações preliminares, o evento tem relevância direta para os moradores da região.</p>

      <h3>Atuação das equipes envolvidas</h3>
      <p>Equipes competentes e autoridades locais estão cientes e atuando conforme necessário para a gestão da situação.</p>

      <h2>Impacto para a comunidade</h2>
      <p>Este acontecimento reforça a importância de estar atento aos comunicados oficiais e eventos em nossa cidade.</p>

      <h2>Conclusão</h2>
      <p>A Rádio Treze de Maio segue acompanhando o caso e trará novas atualizações a qualquer momento em nossa programação.</p>
      
      <p><small><strong>Fonte:</strong> ${sourceName}</small></p>
    `;
}

function determineCategory(text: string): 'Treze de Maio - SC' | 'Região' | 'Avisos' {
    if (text.includes("aviso") || text.includes("comunicado") || text.includes("falecimento") || text.includes("nota")) return 'Avisos';
    if (text.includes("prefeitura") || text.includes("centro") || text.includes("bairro")) return 'Treze de Maio - SC';
    return 'Região';
}

function stripHtml(html: string) {
   if (!html) return "";
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

// Improved Extractor using DOM Parser instead of regex for better reliability
function extractImageFromHtml(html: string) {
    if(!html) return null;
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const img = doc.querySelector('img');
        if (img && img.src) {
            return img.src;
        }
        // Fallback for regex if DOMParser fails in non-standard environment (rare in browser)
        const match = html.match(/<img[^>]+src="([^">]+)"/);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}
