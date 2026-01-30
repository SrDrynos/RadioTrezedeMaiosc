
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

    // Formata o conteúdo seguindo o padrão estrito solicitado
    const formattedHtml = generateSeoStructure({
        title: data.titulo,
        content: data.conteudo_html,
        pubDate: data.data_publicacao
    }, data.fonte || "Redação Automática");

    const newNewsItem: NewsItem = {
      id: Date.now().toString(),
      title: data.titulo,
      content: formattedHtml,
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
    
    const existingTitles = new Set(db.getNews().map(n => n.title));
    const rejectedTitles = new Set(db.getRejectedNews().map(n => n.title));

    for (const url of urls) {
       try {
         const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
         const data = await res.json();
         const feedTitle = data.feed?.title || "Internet";
         
         if (data.status === 'ok' && Array.isArray(data.items)) {
           for (const item of data.items) {
             
             if (existingTitles.has(item.title) || rejectedTitles.has(item.title)) continue;

             // Clean Content
             const cleanContent = item.content || item.description || "";
             const fullText = (item.title + " " + cleanContent).toLowerCase();
             
             // Common Props for both Accepted and Rejected
             const pubDate = new Date(item.pubDate.replace(/-/g, '/'));
             const image = item.enclosure?.link || item.thumbnail || extractImageFromHtml(cleanContent) || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1000';
             
             // --- FORMATTING: APPLY STRICT TEMPLATE HERE ---
             const formattedHtml = generateSeoStructure(item, feedTitle);

             const newItem: NewsItem = {
                 id: Date.now().toString() + Math.random().toString().slice(2,5),
                 title: item.title, 
                 subtitle: item.title, 
                 content: formattedHtml, 
                 excerpt: stripHtml(item.description || cleanContent).substring(0, 150) + "...",
                 category: determineCategory(fullText),
                 imageUrl: image,
                 gallery: [image],
                 createdAt: pubDate.toISOString(),
                 published: true,
                 source: feedTitle,
                 tags: ['Automático', 'RSS']
             };

             // --- VALIDATION RULES ---
             
             let rejectionReason = null;

             // 1. FILTRO DE LOCALIZAÇÃO (REGRA CRÍTICA)
             if (!fullText.includes("treze de maio")) {
                 rejectionReason = "Localização (Não menciona Treze de Maio)";
             }

             // 2. DATE FILTER (Last 5 days to be safe)
             if (!rejectionReason) {
                const today = new Date();
                const timeDiff = today.getTime() - pubDate.getTime();
                const daysDiff = timeDiff / (1000 * 3600 * 24);
                if (daysDiff > 5) {
                    rejectionReason = "Notícia Antiga (> 5 dias)";
                }
             }

             // 3. ANÁLISE E CLASSIFICAÇÃO (SCORE)
             if (!rejectionReason) {
                 const score = calculateScore(item, fullText);
                 if (score < 7.5) {
                     rejectionReason = `Score Baixo (${score}/10)`;
                 }
             }

             // --- DECISION ---
             if (rejectionReason) {
                 // Save to Quarantine
                 newItem.published = false;
                 newItem.rejectionReason = rejectionReason;
                 newItem.id = "REJ_" + newItem.id; // Mark ID
                 db.saveRejectedNews(newItem);
                 rejectedCount++;
                 rejectedTitles.add(item.title);
             } else {
                 // Publish
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
    
    return { 
        count: addedCount, 
        message: `${addedCount} publicadas. ${rejectedCount} enviadas para análise (Rejeitadas).` 
    };
  }
};

// --- HELPER FUNCTIONS FOR LOGIC ---

function calculateScore(item: any, text: string): number {
    let score = 0;
    
    // Relevância Local (0-3)
    if (item.title.toLowerCase().includes("treze de maio")) score += 3;
    else if (text.includes("treze de maio")) score += 2;
    
    // Interesse Público / Palavras-chave (0-2)
    const keywords = ["incêndio", "obras", "saúde", "prefeitura", "festa", "acidente", "polícia", "bombeiros", "segurança", "evento", "comunicado", "falecimento", "nota", "censo", "ibge", "população"];
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
    const title = item.title || "";
    let rawDesc = stripHtml(item.description || item.content || "").trim();
    
    // Limpeza de artefatos comuns de RSS
    rawDesc = rawDesc.replace(/Leia mais.*/i, '').replace(/\.\.\.$/, '').replace(/&nbsp;/g, ' ');

    // CORREÇÃO CRÍTICA DE REPETIÇÃO:
    // Verifica se a descrição começa com o título (comum em RSS do Google News)
    if (rawDesc.toLowerCase().startsWith(title.toLowerCase())) {
        // Remove o título do início do texto
        rawDesc = rawDesc.substring(title.length).trim();
        // Remove pontuações soltas que sobram (ex: " - Texto...")
        rawDesc = rawDesc.replace(/^[\s\-\:\.]+/g, '');
    }

    // Quebra o texto em sentenças para tentar estruturar
    const parts = rawDesc.split('. ').filter(s => s.length > 20);
    
    // Introdução (1 ou 2 primeiras frases)
    const intro = parts.slice(0, 2).join('. ') + (parts.length > 0 ? '.' : '');
    
    // Restante do conteúdo
    const remainder = parts.slice(2).join('. ') + (parts.length > 2 ? '.' : '');

    // Formatação da Data em Português (Ex: 28 de junho de 2023)
    const dateObj = item.pubDate ? new Date(item.pubDate) : new Date();
    const dateStr = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    // REMOVIDO: let html = `<h1>${title}</h1>`; 
    // MOTIVO: O título já aparece no cabeçalho da página de notícias, causava duplicação.
    let html = "";
    
    // Só adiciona intro se tiver conteúdo real
    if (intro.length > 10) {
        html += `<p>${intro}</p>`;
    }

    if (remainder.length > 50) {
        html += `<h2>Detalhes da informação</h2>`;
        html += `<p>${remainder}</p>`;
        
        if (remainder.length > 400) {
             html += `<h3>Informações adicionais</h3>`;
             html += `<p>O fato repercute na região e mobiliza a atenção da comunidade de Treze de Maio.</p>`;
        }
    } else {
        html += `<h2>Contexto</h2>`;
        html += `<p>Esta informação é de vital importância para o dia a dia e o planejamento dos moradores de Treze de Maio e arredores.</p>`;
    }

    // Parágrafo Padrão de Encerramento e Rodapé
    html += `
      <br/>
      <p>A Rádio Treze de Maio segue acompanhando e divulgando informações de interesse público, mantendo a população informada sobre dados relevantes que impactam diretamente a vida no município.</p>
      
      <br/>
      <p>
      📅 Data: ${dateStr}<br/>
      📰 Redação: Rádio Treze de Maio<br/>
      📌 Fonte: ${sourceName}
      </p>
    `;

    return html;
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
