
import { NewsItem, Program, SiteSettings, SongRequest, ContactMessage, User, UserRole } from '../types';

const STORAGE_KEYS = {
  NEWS: 'radio_13_news',
  PROGRAMS: 'radio_13_programs',
  REQUESTS: 'radio_13_requests',
  SETTINGS: 'radio_13_settings',
  MESSAGES: 'radio_13_messages',
  USERS: 'radio_13_users'
};

// We leave this empty to force the usage of the <RadioLogo /> internal SVG.
// This ensures the logo is always high-quality vector and identical across the app.
const DEFAULT_LOGO = ""; 

const DEFAULT_SETTINGS: SiteSettings = {
  streamUrl: 'http://stm4.xradios.com.br:6982/stream',
  radioName: 'Rádio Treze de Maio',
  logoUrl: DEFAULT_LOGO, 
  phone: '(48) 3625-0000',
  whatsapp: '(48) 99999-0000',
  email: 'contato@radiotrezedemaio.com.br',
  address: 'Treze de Maio - SC',
  aboutText: 'A Rádio Treze de Maio é a voz da nossa comunidade. Conectando nossa terra, nossa cultura e nossa fé através das ondas do rádio e do streaming digital. Sintonize 24 horas por dia.',
  aboutImageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=1920&auto=format&fit=crop',
  rssUrls: [
    // Default Google News RSS for Treze de Maio
    'https://news.google.com/rss/search?q=Treze+de+Maio+Santa+Catarina&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    // Folha Regional Web TV (Fonte Regional)
    'https://folharegionalwebtv.com/feed'
  ],
  apiUrl: '',
  apiKey: ''
};

const DEFAULT_PROGRAMS: Program[] = [
  { id: '1', name: 'Acorda Treze de Maio', host: 'João da Silva', description: 'Música sertaneja raiz e notícias do agro.', startTime: '05:00', endTime: '08:00', days: [1, 2, 3, 4, 5] },
  { id: '2', name: 'Manhã Total', host: 'Maria Oliveira', description: 'Variedades, horóscopo e entrevistas.', startTime: '08:00', endTime: '12:00', days: [1, 2, 3, 4, 5] },
  { id: '3', name: 'Jornal do Meio Dia', host: 'Carlos Santos', description: 'As principais notícias da cidade e região.', startTime: '12:00', endTime: '13:00', days: [1, 2, 3, 4, 5] },
  { id: '4', name: 'Tarde Alegre', host: 'Pedro Souza', description: 'Pop, Rock e os sucessos do momento.', startTime: '13:00', endTime: '17:00', days: [1, 2, 3, 4, 5] },
  { id: '5', name: 'Missa Dominical', host: 'Padre Antônio', description: 'Transmissão ao vivo da Igreja Matriz.', startTime: '08:00', endTime: '09:30', days: [0] },
];

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Festa do Agricultor atrai multidão',
    subtitle: 'Evento superou expectativas de público no parque de exposições',
    excerpt: 'Evento tradicional movimentou o final de semana na cidade com desfiles e exposições.',
    content: 'A tradicional Festa do Agricultor de Treze de Maio superou as expectativas este ano. Mais de 5 mil pessoas passaram pelo parque de exposições para prestigiar o desfile de máquinas agrícolas, as exposições de produtos coloniais e os shows regionais. O prefeito destacou a importância do evento para a economia local.',
    category: 'Treze de Maio - SC',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-5848b4491178?q=80&w=1000&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1625246333195-5848b4491178?q=80&w=1000&auto=format&fit=crop'],
    createdAt: new Date().toISOString(),
    published: true,
    source: 'Assessoria de Imprensa',
    slug: 'festa-do-agricultor-atrai-multidao'
  },
  {
    id: '2',
    title: 'Obras na estrada geral avançam',
    subtitle: 'Pavimentação deve ser entregue antes do prazo previsto',
    excerpt: 'Pavimentação asfáltica deve ser concluída até o próximo mês, segundo a prefeitura.',
    content: 'As obras de pavimentação que ligam o centro às comunidades do interior estão 80% concluídas. O prefeito visitou o local nesta manhã e garantiu que o cronograma está em dia. A melhoria vai facilitar o escoamento da produção agrícola e o transporte escolar.',
    category: 'Região',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    published: true,
    source: 'Secretaria de Obras',
    slug: 'obras-na-estrada-geral-avancam'
  }
];

// Helper to simulate Database
export const db = {
  init: () => {
    // SETTINGS INIT
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } else {
        // MIGRATION & REPAIR
        try {
            const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
            let updated = false;

            // Fix 1: Auto-update old ZenoFM URL
            if (current.streamUrl === 'https://stream.zeno.fm/mn062547808tv') {
                current.streamUrl = DEFAULT_SETTINGS.streamUrl;
                updated = true;
            }

            // Fix 2: CLEANUP OLD BASE64 LOGO
            const OLD_DEFAULT_START = "data:image/svg+xml;base64,PHN2Zy";
            if (current.logoUrl && current.logoUrl.startsWith(OLD_DEFAULT_START)) {
                current.logoUrl = "";
                updated = true;
            }
            
            // Fix 3: Ensure rssUrls exists
            if (!Array.isArray(current.rssUrls)) {
                current.rssUrls = DEFAULT_SETTINGS.rssUrls; // Restore default RSS if missing
                updated = true;
            } else if (current.rssUrls.length === 0) {
                 current.rssUrls = DEFAULT_SETTINGS.rssUrls;
                 updated = true;
            }

            // Fix 4: Ensure API fields exist
            if (current.apiUrl === undefined) {
                current.apiUrl = '';
                updated = true;
            }

            // Fix 5: Add Folha Regional if missing
            if (current.rssUrls && !current.rssUrls.includes('https://folharegionalwebtv.com/feed')) {
                 current.rssUrls.push('https://folharegionalwebtv.com/feed');
                 updated = true;
            }

            if (updated) {
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(current));
            }
        } catch (e) {
            console.error("Migration error", e);
        }
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROGRAMS)) {
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(DEFAULT_PROGRAMS));
    }
    
    // Logic to populate or update news if only the old default (2 items) exists
    const storedNews = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
    if (storedNews.length === 0 || storedNews.length <= 2) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
    } else {
      // Migration for new fields
      const updatedNews = storedNews.map((n: any) => ({
          ...n,
          subtitle: n.subtitle || '',
          gallery: n.gallery || (n.imageUrl ? [n.imageUrl] : []),
          source: n.source || 'Redação'
      }));
      // Check if migration needed
      if (!storedNews[0].gallery) {
          localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(updatedNews));
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      // Default Admin
      const admin: User = { id: '1', name: 'Administrador', email: 'drynos.com@gmail.com', role: UserRole.ADMIN };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([admin]));
    }
  },

  getSettings: (): SiteSettings => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
  },

  saveSettings: (settings: SiteSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getNews: (onlyPublished = false): NewsItem[] => {
    const news: NewsItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
    return onlyPublished ? news.filter(n => n.published) : news;
  },

  // NEW METHOD
  getNewsItem: (id: string): NewsItem | undefined => {
    const news: NewsItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
    return news.find(n => n.id === id);
  },

  saveNewsItem: (item: NewsItem) => {
    const news = db.getNews();
    const index = news.findIndex(n => n.id === item.id);
    if (index >= 0) {
      news[index] = item;
    } else {
      news.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
  },

  deleteNewsItem: (id: string) => {
    const news = db.getNews().filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
  },

  getPrograms: (): Program[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRAMS) || '[]');
  },

  saveProgram: (program: Program) => {
    const programs = db.getPrograms();
    const index = programs.findIndex(p => p.id === program.id);
    if (index >= 0) {
      programs[index] = program;
    } else {
      programs.push(program);
    }
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
  },

  deleteProgram: (id: string) => {
    const programs = db.getPrograms().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
  },

  getRequests: (): SongRequest[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
  },

  addRequest: (req: SongRequest) => {
    const requests = db.getRequests();
    requests.unshift(req);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  updateRequestStatus: (id: string, status: 'pending' | 'played') => {
    const requests = db.getRequests();
    const req = requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    }
  },

  getMessages: (): ContactMessage[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  },

  addMessage: (msg: ContactMessage) => {
    const messages = db.getMessages();
    messages.unshift(msg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }
};
