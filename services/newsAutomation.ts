
import { IncomingWebhookData, NewsItem } from '../types';
import { db } from './db';

export const newsAutomationService = {
  /**
   * Processa o JSON recebido via API/Webhook (Integração direta)
   */
  processIncomingData: (data: IncomingWebhookData) => {
    const normalizedCity = (data.cidade || "").toLowerCase();
    const normalizedContent = (data.titulo + " " + data.conteudo_html).toLowerCase();
    
    // Regra 1: Relevância Geográfica
    if (!normalizedCity.includes("treze de maio") && !normalizedContent.includes("treze de maio")) {
      return { success: false, message: `FONTE NÃO AUTORIZADA – CONTEÚDO IGNORADO (Não menciona Treze de Maio)` };
    }

    // Regra 2: Score Mínimo 7.5
    if (data.nota < 7.5) {
      return { success: false, message: `NOTÍCIA REPROVADA – SCORE INSUFICIENTE (${data.nota}/10). Mínimo exigido: 7.5` };
    }

    // Regra 3: 24 Horas
    const pubDate = data.data_publicacao ? new Date(data.data_publicacao) : new Date();
    const hoursDiff = (new Date().getTime() - pubDate.getTime()) / (1000 * 3600);
    if (hoursDiff > 24) {
        return { success: false, message: `REJEITADA: Notícia antiga (> 24h).` };
    }

    // Duplication Check
    const allNews = [...db.getNews(), ...db.getRejectedNews()];
    if (checkDuplication(data.titulo, allNews)) {
       return { success: false, message: `REJEITADA: Notícia similar já existe no sistema.` };
    }

    const excerpt = stripHtml(data.conteudo_html).substring(0, 160) + "...";
    const extractedImage = findBestImage({ description: data.conteudo_html, content: data.conteudo_html });
    const finalImage = extractedImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop';

    // Gera estrutura SEO completa
    const formattedHtml = expandContentForSeo(data.titulo, data.conteudo_html, data.fonte || "Redação", pubDate);

    const newNewsItem: NewsItem = {
      id: Date.now().toString(),
      title: data.titulo,
      subtitle: "Confira os detalhes completos desta ocorrência em nossa cidade", // Subtítulo padrão
      content: formattedHtml,
      excerpt: excerpt,
      category: 'Treze de Maio - SC',
      imageUrl: finalImage,
      gallery: [finalImage],
      createdAt: data.data_publicacao || new Date().toISOString(),
      published: false, // Vai para Curadoria
      source: data.fonte || "Redação Automática",
      sourceUrl: "https://radiotrezedemaio.com.br", // Webhook geralmente é interno
      tags: data.tags || ['Notícia', 'Treze de Maio']
    };

    db.saveNewsItem(newNewsItem);
    return { success: true, message: `SUCESSO: Notícia enviada para Curadoria. (Nota: ${data.nota})` };
  },

  /**
   * Sincroniza feeds RSS aplicando regras estritas de 24h e Score 7.5
   */
  async syncRSSFeeds(urls: string[]) {
    if (!urls || urls.length === 0) return { count: 0, message: "Nenhuma URL RSS configurada." };

    let addedCount = 0;
    let rejectedCount = 0;
    
    const allExistingItems = [...db.getNews(), ...db.getRejectedNews()].slice(0, 200);
    const processedInThisBatch: NewsItem[] = [];

    for (const url of urls) {
       try {
         const xmlText = await fetchRawRSS(url);
         if (!xmlText) continue;

         const parser = new DOMParser();
         const xmlDoc = parser.parseFromString(xmlText, "text/xml");
         
         const feedTitle = xmlDoc.querySelector("channel > title")?.textContent || "Internet";
         const items = Array.from(xmlDoc.querySelectorAll("item"));

         for (const itemNode of items) {
             const title = itemNode.querySelector("title")?.textContent || "";
             const link = itemNode.querySelector("link")?.textContent || "";
             const pubDateStr = itemNode.querySelector("pubDate")?.textContent || "";
             
             // Content Extraction
             const encodedContent = itemNode.getElementsByTagNameNS("*", "encoded")[0]?.textContent;
             const description = itemNode.querySelector("description")?.textContent || "";
             const rawContent = encodedContent || description || "";
             
             const fullText = (title + " " + rawContent).toLowerCase();

             // Parsing Data
             let pubDate = new Date();
             if (pubDateStr) {
                 pubDate = new Date(pubDateStr);
                 if (isNaN(pubDate.getTime())) pubDate = new Date();
             }

             // --- REGRA DE OURO: 24 HORAS ---
             const hoursDiff = (new Date().getTime() - pubDate.getTime()) / (1000 * 3600);
             if (hoursDiff > 24) {
                 // Salva como rejeitada para log, mas não processa
                 const rejItem = createNewsObject(title, rawContent, pubDate, feedTitle, link, "Notícia Antiga (> 24h)", 0);
                 if (!checkDuplication(title, allExistingItems)) {
                    db.saveRejectedNews(rejItem);
                    rejectedCount++;
                 }
                 continue; 
             }

             // --- DUPLICIDADE ---
             if (checkDuplication(title, [...allExistingItems, ...processedInThisBatch])) {
                 continue;
             }

             // --- CÁLCULO DE SCORE (0 a 10) ---
             const score = calculateStrictScore(title, fullText);
             
             // --- REGRA DE OURO: NOTA 7.5 ---
             if (score < 7.5) {
                 const rejItem = createNewsObject(title, rawContent, pubDate, feedTitle, link, `Score Baixo (${score.toFixed(1)}/10). Mínimo 7.5`, score);
                 db.saveRejectedNews(rejItem);
                 rejectedCount++;
                 continue;
             }

             // SE PASSOU: GERAÇÃO DE CONTEÚDO (SEO WRITER)
             // Transforma o resumo em um artigo estruturado
             const formattedHtml = expandContentForSeo(title, rawContent, feedTitle, pubDate);
             const image = extractImageFromXMLItem(itemNode, rawContent);

             const newItem: NewsItem = {
                 id: Date.now().toString() + Math.random().toString().slice(2,5),
                 title: title, 
                 subtitle: generateSubtitle(title, rawContent), 
                 content: formattedHtml, 
                 excerpt: stripHtml(description).substring(0, 160) + "...",
                 category: determineCategory(fullText), // Lógica ajustada para Região
                 imageUrl: image,
                 gallery: [image],
                 createdAt: pubDate.toISOString(),
                 published: false, // VAI PARA CURADORIA
                 source: feedTitle,
                 sourceUrl: link,
                 tags: extractTags(fullText),
                 rejectionReason: undefined // Aprovado
             };

             db.saveNewsItem(newItem);
             addedCount++;
             processedInThisBatch.push(newItem);
         }

       } catch(e) {
         console.error("RSS Error:", url, e);
       }
    }
    
    return { 
        count: addedCount, 
        message: `${addedCount} aprovadas para Curadoria (Score > 7.5). ${rejectedCount} rejeitadas.` 
    };
  }
};

// --- HELPER FACTORY ---
function createNewsObject(title: string, content: string, date: Date, source: string, url: string, reason: string, score: number): NewsItem {
    return {
        id: "REJ_" + Date.now() + Math.random().toString().slice(2,5),
        title,
        content,
        excerpt: "Rejeitada",
        category: 'Avisos',
        imageUrl: "",
        createdAt: date.toISOString(),
        published: false,
        source,
        sourceUrl: url,
        rejectionReason: reason
    };
}

// --- INTELLIGENT CONTENT GENERATOR (SEO WRITER) ---
function expandContentForSeo(title: string, rawInput: string, sourceName: string, date: Date): string {
    const cleanText = stripHtml(rawInput).trim();
    const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Tentativa de dividir o texto em partes para redistribuição
    const sentences = cleanText.split('. ');
    const intro = sentences.slice(0, 2).join('. ') + '.';
    const body = sentences.slice(2).join('. ');

    return `
        <p class="lead"><strong>TREZE DE MAIO E REGIÃO:</strong> ${intro}</p>
        
        <p>A redação da Rádio Treze de Maio traz detalhes sobre este acontecimento que movimenta nossa região. A notícia, originalmente veiculada por <em>${sourceName}</em>, destaca pontos importantes para a comunidade local.</p>

        <h2>Detalhes da Ocorrência</h2>
        <p>${body || cleanText}</p>
        <p>Isso demonstra a relevância do tema para os moradores e autoridades locais.</p>
        
        <h2>Contexto Regional</h2>
        <p>A situação requer atenção e acompanhamento. Fatos como este influenciam diretamente o cotidiano da cidade e de municípios vizinhos como Sangão, Jaguaruna e Tubarão.</p>

        <h3>Posicionamento e Próximos Passos</h3>
        <p>De acordo com as informações apuradas, este evento pode trazer desdobramentos nos próximos dias. A Rádio Treze de Maio segue monitorando a situação para trazer atualizações em tempo real.</p>
        
        <p>Até o fechamento desta edição, novas informações estão sendo aguardadas. É fundamental que a população acompanhe os canais oficiais e nossa programação ao vivo para mais detalhes.</p>

        <hr />
        <p><em>Esta matéria foi processada automaticamente pela nossa central de jornalismo digital com base em informações públicas de ${sourceName}. Para conferir a fonte original na íntegra, utilize o link disponível no final desta página.</em></p>
        
        <p><strong>Data da Publicação:</strong> ${dateStr}</p>
    `;
}

function generateSubtitle(title: string, content: string): string {
    const clean = stripHtml(content);
    if (clean.length > 20 && clean.length < 150) return clean;
    return `Saiba tudo sobre: ${title} - Detalhes exclusivos na Rádio Treze de Maio.`;
}

// --- STRICT SCORING SYSTEM ---
function calculateStrictScore(title: string, text: string): number {
    let score = 5.0; // Base start
    const lowerTitle = title.toLowerCase();
    const lowerText = text.toLowerCase();

    // 1. Localização Principal (Peso Alto)
    if (lowerTitle.includes("treze de maio")) score += 4.0;
    else if (lowerText.includes("treze de maio")) score += 3.0;
    else if (lowerText.includes("prefeitura de treze")) score += 3.5;
    
    // 2. Cidades Vizinhas e Região (Lista Expandida)
    const neighbors = [
        "tubarão", 
        "jaguaruna", 
        "sangão", 
        "pedras grandes", "pedra grandes",
        "morro da fumaça", 
        "laguna", 
        "içara", 
        "rincão"
    ];
    
    // Boost para cidades da região
    if (neighbors.some(n => lowerTitle.includes(n))) score += 2.5; 
    else if (neighbors.some(n => lowerText.includes(n))) score += 1.5;

    // 3. Palavras-Chave de Urgência/Interesse
    const urgentKeywords = ["urgente", "acidente", "incêndio", "morte", "falecimento", "homicídio", "polícia", "prisão", "alerta", "assalto", "colisão"];
    if (urgentKeywords.some(k => lowerTitle.includes(k))) score += 2.5;

    const publicInterest = ["concurso", "vagas", "emprego", "saúde", "vacinação", "obras", "interdição", "festa", "show", "inauguração", "bolsa família", "auxílio"];
    if (publicInterest.some(k => lowerTitle.includes(k))) score += 1.5;

    // 4. Penalidades (Conteúdo Genérico)
    if (lowerTitle.includes("horóscopo") || lowerTitle.includes("novela") || lowerTitle.includes("famosos")) score -= 5.0;
    if (lowerTitle.includes("brasil") && !lowerText.includes("sc")) score -= 1.0; 

    return Math.min(Math.max(score, 0), 10);
}

// --- UTILS ---

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
            console.error("Proxy Error", url);
            return null;
        }
    }
}

function checkDuplication(title: string, existingItems: NewsItem[]): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const t1 = normalize(title);
    return existingItems.some(item => {
        const t2 = normalize(item.title);
        return t1.includes(t2) || t2.includes(t1) || (t1 === t2);
    });
}

function stripHtml(html: string) {
   if (!html) return "";
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

function determineCategory(text: string): 'Treze de Maio - SC' | 'Cidades Vizinhas' | 'Região' | 'Avisos' {
    if (text.includes("falecimento") || text.includes("vaga") || text.includes("concurso")) return 'Avisos';
    if (text.includes("treze de maio")) return 'Treze de Maio - SC';
    
    // Lista de cidades vizinhas agora mapeia para "Região" conforme solicitado
    const vizinhas = [
        "tubarão", 
        "jaguaruna", 
        "sangão", 
        "pedras grandes", "pedra grandes",
        "morro da fumaça", 
        "laguna", 
        "içara", 
        "rincão"
    ];

    if (vizinhas.some(city => text.includes(city))) return 'Região';
    return 'Região';
}

function extractTags(text: string): string[] {
    const possibleTags = ["acidente", "polícia", "saúde", "educação", "esporte", "política", "economia", "cultura", "obras", "trânsito"];
    return possibleTags.filter(tag => text.includes(tag));
}

function extractImageFromXMLItem(itemNode: Element, htmlContent: string): string {
    const fallback = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1000';
    
    // Tenta Enclosure
    const enclosure = itemNode.querySelector("enclosure");
    if (enclosure?.getAttribute("type")?.startsWith("image")) return enclosure.getAttribute("url") || fallback;

    // Tenta Media Content
    const media = itemNode.getElementsByTagNameNS("*", "content");
    if (media.length > 0 && media[0].getAttribute("type")?.startsWith("image")) return media[0].getAttribute("url") || fallback;

    // Tenta HTML
    const regexMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (regexMatch && regexMatch[1]) return regexMatch[1];

    return fallback;
}

function findBestImage(data: any): string | null { return null; }
