
import { IncomingWebhookData, NewsItem } from '../types';
import { db } from './db';

export const newsAutomationService = {
  /**
   * Processa o JSON recebido via API/Webhook (Integração direta)
   */
  processIncomingData: (data: IncomingWebhookData) => {
    const normalizedCity = (data.cidade || "").toLowerCase();
    const normalizedContent = (data.titulo + " " + data.conteudo_html).toLowerCase();
    
    if (!normalizedCity.includes("treze de maio") && !normalizedContent.includes("treze de maio")) {
      return { success: false, message: `FONTE NÃO AUTORIZADA – CONTEÚDO IGNORADO (Não menciona Treze de Maio)` };
    }

    // Duplication Check for Webhook
    const allNews = [...db.getNews(), ...db.getRejectedNews()];
    if (checkDuplication(data.titulo, allNews)) {
       return { success: false, message: `REJEITADA: Notícia similar já existe no sistema.` };
    }

    if (data.nota < 7.5) {
      return { success: false, message: `NOTÍCIA REPROVADA – SCORE INSUFICIENTE (${data.nota}/10)` };
    }

    // VERIFICAÇÃO DE PALAVRAS (MÍNIMO 500)
    const plainText = stripHtml(data.conteudo_html);
    const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount < 500) {
        return { success: false, message: `REJEITADA: Conteúdo muito curto (${wordCount} palavras). Mínimo exigido: 500.` };
    }

    const excerpt = stripHtml(data.conteudo_html).substring(0, 160) + "...";
    const extractedImage = findBestImage({ description: data.conteudo_html, content: data.conteudo_html });
    const finalImage = extractedImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop';

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
      published: false, // ALTERADO: Agora vai para Curadoria (Rascunho)
      source: data.fonte || "Redação Automática",
      tags: data.tags
    };

    db.saveNewsItem(newNewsItem);
    return { success: true, message: `SUCESSO: Notícia enviada para Curadoria para revisão. (Nota: ${data.nota})` };
  },

  /**
   * NOVA VERSÃO: Sincroniza feeds RSS usando Parser XML Nativo e Proxy Raw
   * Ignora limites de API de terceiros para garantir que tudo seja lido.
   */
  async syncRSSFeeds(urls: string[]) {
    if (!urls || urls.length === 0) return { count: 0, message: "Nenhuma URL RSS configurada." };

    let addedCount = 0;
    let rejectedCount = 0;
    
    // Carrega TODAS as notícias para comparação (inclusive as recém adicionadas no loop)
    // Otimização: Pegar apenas as últimas 200 para não pesar o navegador
    const allExistingItems = [...db.getNews(), ...db.getRejectedNews()].slice(0, 200);
    const processedInThisBatch: NewsItem[] = [];

    for (const url of urls) {
       try {
         // 1. Busca o XML Bruto (Bypassing CORS via Proxy)
         const xmlText = await fetchRawRSS(url);
         if (!xmlText) continue;

         // 2. Parseia o XML no Navegador
         const parser = new DOMParser();
         const xmlDoc = parser.parseFromString(xmlText, "text/xml");
         
         const feedTitle = xmlDoc.querySelector("channel > title")?.textContent || "Internet";
         const items = Array.from(xmlDoc.querySelectorAll("item"));

         for (const itemNode of items) {
             const title = itemNode.querySelector("title")?.textContent || "";
             
             // --- VERIFICAÇÃO DE DUPLICIDADE AVANÇADA ---
             // Verifica contra o banco de dados E contra itens processados neste ciclo
             if (checkDuplication(title, [...allExistingItems, ...processedInThisBatch])) {
                 continue; // Pula silenciosamente se for duplicata exata ou muito parecida
             }

             // Extração de Dados do XML
             const link = itemNode.querySelector("link")?.textContent || "";
             const pubDateStr = itemNode.querySelector("pubDate")?.textContent || "";
             
             // Content: Tenta pegar o content:encoded, senão description
             const encodedContent = itemNode.getElementsByTagNameNS("*", "encoded")[0]?.textContent;
             const description = itemNode.querySelector("description")?.textContent || "";
             const rawContent = encodedContent || description || "";
             
             const fullText = (title + " " + rawContent).toLowerCase();
             
             // Contagem de Palavras
             const plainText = stripHtml(rawContent);
             const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;

             // Data parsing robusto
             let pubDate = new Date();
             if (pubDateStr) {
                 pubDate = new Date(pubDateStr);
                 if (isNaN(pubDate.getTime())) pubDate = new Date();
             }

             // Extração de Imagem
             const image = extractImageFromXMLItem(itemNode, rawContent);

             // SEO Formatting
             const formattedHtml = generateSeoStructure({
                 title,
                 content: rawContent,
                 pubDate: pubDate.toISOString()
             }, feedTitle);

             const newItem: NewsItem = {
                 id: Date.now().toString() + Math.random().toString().slice(2,5),
                 title: title, 
                 subtitle: title, // Fallback
                 content: formattedHtml, 
                 excerpt: stripHtml(description).substring(0, 150) + "...",
                 category: determineCategory(fullText),
                 imageUrl: image,
                 gallery: [image],
                 createdAt: pubDate.toISOString(),
                 published: false, // ALTERADO: Agora vai para Curadoria (Rascunho)
                 source: feedTitle,
                 sourceUrl: link,
                 tags: ['Automático', 'RSS']
             };

             // --- REGRAS DE FILTRAGEM (ATUALIZADAS PARA 7 DIAS) ---
             let rejectionReason = null;

             const today = new Date();
             const timeDiff = today.getTime() - pubDate.getTime();
             const hoursDiff = timeDiff / (1000 * 3600); // Horas

             // REGRA 0: Contagem de Palavras (NOVO)
             if (wordCount < 500) {
                 rejectionReason = `Conteúdo muito curto (${wordCount} palavras). Mínimo 500.`;
             }

             // REGRA 1: Localização
             const isLocal = newItem.category === 'Treze de Maio - SC';
             const isNeighbor = newItem.category === 'Cidades Vizinhas';

             if (!rejectionReason) {
                if (!isLocal && !isNeighbor) {
                    // É Região Genérica ou Outros
                    // JANELA AUMENTADA PARA 168 HORAS (7 DIAS)
                    if (hoursDiff <= 168) {
                        rejectionReason = "Revisão: Notícia Regional Genérica (Verificar relevância)";
                    } else {
                        rejectionReason = "Localização (Fora da área de cobertura direta)";
                    }
                } else if (isNeighbor && hoursDiff > 120) {
                    // Cidades vizinhas tem uma tolerância um pouco menor que local (5 dias)
                    rejectionReason = "Notícia Vizinha Antiga (> 5 dias)";
                } else if (isLocal && hoursDiff > 168) {
                    rejectionReason = "Notícia Local Antiga (> 7 dias)";
                }
             }

             // REGRA 3: Score Baixo (Menos rigoroso para quarentena)
             if (!rejectionReason) {
                 const score = calculateScore(newItem, fullText);
                 if (score < 6.0) { 
                     rejectionReason = `Score Baixo (${score}/10)`;
                 }
             }

             // --- PERSISTÊNCIA ---
             if (rejectionReason) {
                 newItem.id = "REJ_" + newItem.id; 
                 newItem.rejectionReason = rejectionReason;
                 db.saveRejectedNews(newItem);
                 rejectedCount++;
                 
                 // Adiciona à lista temporária para evitar que o mesmo feed adicione a mesma rejeição 2x
                 processedInThisBatch.push(newItem);
             } else {
                 // Se passou, salva mas como Rascunho (published: false)
                 db.saveNewsItem(newItem);
                 addedCount++;
                 processedInThisBatch.push(newItem);
             }
         }

       } catch(e) {
         console.error("Error fetching RSS XML:", url, e);
       }
    }
    
    return { 
        count: addedCount, 
        message: `${addedCount} enviadas para Curadoria. ${rejectedCount} rejeitadas automaticamente.` 
    };
  }
};

// --- HELPER PARA BAIXAR XML VIA PROXY ---
async function fetchRawRSS(url: string): Promise<string | null> {
    try {
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        return data.contents;
    } catch (e) {
        try {
            const res2 = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
            return await res2.text();
        } catch (e2) {
            console.error("Falha em todos os proxies RSS", url);
            return null;
        }
    }
}

// --- DUPLICATION & SIMILARITY CHECKERS ---

function normalizeForComparison(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^\w\s]/g, "") // Remove pontuação
        .replace(/\s+/g, " ") // Remove espaços extras
        .trim();
}

function getTokens(str: string): Set<string> {
    // Palavras irrelevantes para comparação
    const stopWords = new Set(['a', 'o', 'as', 'os', 'de', 'da', 'do', 'em', 'na', 'no', 'e', 'para', 'com', 'por', 'um', 'uma']);
    const tokens = normalizeForComparison(str).split(" ");
    return new Set(tokens.filter(t => t.length > 2 && !stopWords.has(t)));
}

function calculateSimilarity(str1: string, str2: string): number {
    const tokens1 = getTokens(str1);
    const tokens2 = getTokens(str2);

    if (tokens1.size === 0 || tokens2.size === 0) return 0;

    // Jaccard Index: (Interseção) / (União)
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return intersection.size / union.size;
}

function checkDuplication(title: string, existingItems: NewsItem[]): boolean {
    // 1. Verificação Exata (Rápida)
    const exactMatch = existingItems.some(item => item.title === title);
    if (exactMatch) return true;

    // 2. Verificação de Similaridade (Lenta/Fuzzy)
    // Limite: 60% de similaridade nas palavras-chave considera duplicata
    const SIMILARITY_THRESHOLD = 0.6;
    
    return existingItems.some(item => {
        const sim = calculateSimilarity(title, item.title);
        return sim > SIMILARITY_THRESHOLD;
    });
}

// --- INTELLIGENCE FUNCTIONS ---

function extractImageFromXMLItem(itemNode: Element, htmlContent: string): string {
    const fallback = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1000';

    const enclosure = itemNode.querySelector("enclosure");
    if (enclosure) {
        const type = enclosure.getAttribute("type");
        const url = enclosure.getAttribute("url");
        if (type && type.startsWith("image") && url) return url;
        if (url && isImage(url)) return url;
    }

    const mediaContent = itemNode.getElementsByTagNameNS("*", "content");
    for(let i=0; i<mediaContent.length; i++) {
        const url = mediaContent[i].getAttribute("url");
        const type = mediaContent[i].getAttribute("type");
        if (url && (!type || type.startsWith("image") || isImage(url))) return url;
    }

    const mediaThumb = itemNode.getElementsByTagNameNS("*", "thumbnail");
    if (mediaThumb.length > 0) {
        const url = mediaThumb[0].getAttribute("url");
        if (url) return url;
    }

    const htmlImg = extractImageFromHtml(htmlContent);
    if (htmlImg) return htmlImg;

    return fallback;
}

function isImage(url: string) {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
}

function isValidImageUrl(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    const blacklist = ['pixel', 'tracker', 'analytics', 'facebook.com/tr', 'imp?', 'shim.gif', 'doubleclick', 'feedburner'];
    if (blacklist.some(term => lower.includes(term))) return false;
    if (lower.match(/\.(jpeg|jpg|gif|png|webp|bmp)/)) return true;
    if (url.length > 20 && url.includes('http')) return true;
    return false;
}

function calculateScore(item: any, text: string): number {
    let score = 0;
    const title = (item.title || "").toLowerCase();
    
    if (title.includes("treze de maio")) score += 4; 
    else if (text.includes("treze de maio")) score += 3;
    
    const keywords = ["incêndio", "obras", "saúde", "prefeitura", "festa", "acidente", "polícia", "bombeiros", "segurança", "evento", "comunicado", "falecimento", "nota", "censo", "ibge", "população", "vagas", "emprego", "processo seletivo", "concurso", "edital", "eleição", "clima"];
    
    if (keywords.some(k => text.includes(k))) score += 2;

    score += 2; 
    
    if (text.includes("santa catarina") || text.includes("sc")) score += 2;

    return Math.min(score, 10);
}

function generateSeoStructure(item: any, sourceName: string): string {
    const title = item.title || "";
    let rawDesc = stripHtml(item.content || item.description || "").trim();
    
    rawDesc = rawDesc.replace(/Leia mais.*/i, '').replace(/\.\.\.$/, '').replace(/&nbsp;/g, ' ');

    if (rawDesc.toLowerCase().startsWith(title.toLowerCase())) {
        rawDesc = rawDesc.substring(title.length).trim();
        rawDesc = rawDesc.replace(/^[\s\-\:\.]+/g, '');
    }

    const parts = rawDesc.split('. ').filter(s => s.length > 20);
    const intro = parts.slice(0, 2).join('. ') + (parts.length > 0 ? '.' : '');
    const remainder = parts.slice(2).join('. ') + (parts.length > 2 ? '.' : '');

    const dateObj = item.pubDate ? new Date(item.pubDate) : new Date();
    const dateStr = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    let html = "";
    
    if (intro.length > 10) html += `<p>${intro}</p>`;
    
    if (remainder.length > 50) {
        html += `<h2>Detalhes da Notícia</h2>`;
        html += `<p>${remainder}</p>`;
    } else if (rawDesc.length > intro.length) {
         html += `<p>${rawDesc}</p>`;
    }

    html += `
      <br/>
      <hr/>
      <p style="font-size: 0.9em; color: #666;">
      📅 <strong>Data:</strong> ${dateStr}<br/>
      📌 <strong>Fonte Original:</strong> ${sourceName}<br/>
      📰 <strong>Curadoria:</strong> Rádio Treze de Maio
      </p>
    `;

    return html;
}

function determineCategory(text: string): 'Treze de Maio - SC' | 'Cidades Vizinhas' | 'Região' | 'Avisos' {
    if (text.includes("aviso") || text.includes("comunicado") || text.includes("falecimento") || text.includes("nota") || text.includes("vaga") || text.includes("emprego") || text.includes("concurso")) return 'Avisos';
    
    if (text.includes("prefeitura de treze") || text.includes("treze de maio")) return 'Treze de Maio - SC';

    const vizinhas = ["tubarão", "jaguaruna", "sangão", "pedras grandes", "morro da fumaça", "cocal do sul", "urussanga", "capivari de baixo", "gravatal", "armazém"];
    if (vizinhas.some(city => text.includes(city))) return 'Cidades Vizinhas';

    return 'Região';
}

function stripHtml(html: string) {
   if (!html) return "";
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

function extractImageFromHtml(html: string) {
    if(!html) return null;
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const imgs = doc.querySelectorAll('img');
        for (let i = 0; i < imgs.length; i++) {
            const img = imgs[i];
            const src = img.src;
            if (!src || src.length < 10) continue;
            // Filtros anti-tracker
            const w = img.getAttribute('width');
            const h = img.getAttribute('height');
            if (w && parseInt(w) <= 1) continue;
            if (h && parseInt(h) <= 1) continue;
            
            if (isValidImageUrl(src)) return src;
        }
    } catch (e) {}
    
    const regexMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (regexMatch && regexMatch[1]) {
        if (isValidImageUrl(regexMatch[1])) return regexMatch[1];
    }
    return null;
}

function findBestImage(data: { description?: string, content?: string }): string | null {
    if (data.content) {
        const img = extractImageFromHtml(data.content);
        if (img) return img;
    }
    if (data.description) {
        const img = extractImageFromHtml(data.description);
        if (img) return img;
    }
    return null;
}
