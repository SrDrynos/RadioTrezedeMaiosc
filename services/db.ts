
import { NewsItem, Program, SiteSettings, SongRequest, ContactMessage, User, UserRole, ListenerSession, TVItem } from '../types';

const STORAGE_KEYS = {
  NEWS: 'radio_13_news',
  REJECTED_NEWS: 'radio_13_rejected_news', 
  PROGRAMS: 'radio_13_programs',
  REQUESTS: 'radio_13_requests',
  SETTINGS: 'radio_13_settings',
  MESSAGES: 'radio_13_messages',
  USERS: 'radio_13_users',
  SESSIONS: 'radio_13_active_sessions' // New Key for Tracking
};

// VÍDEO PADRÃO (Solicitado pelo usuário)
// ID: r-B0VjT_KNc
const DEFAULT_TV_PLAYLIST: TVItem[] = [
    {
        id: '1',
        title: 'TV Fluxx - Transmissão Principal',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=r-B0VjT_KNc', 
        duration: 'Ao Vivo'
    }
];

const DEFAULT_SETTINGS: SiteSettings = {
  streamUrl: 'http://stm4.xradios.com.br:6982/stream',
  radioName: 'Rádio Treze de Maio',
  logoUrl: '', // Arte Central
  headerLogoUrl: '', // Logo Topo/Rodapé
  phone: '(48) 3625-0000',
  whatsapp: '(48) 99999-0000',
  email: 'contato@radiotrezedemaio.com.br',
  address: 'Treze de Maio - SC',
  aboutText: 'A Rádio Treze de Maio é a voz da nossa comunidade. Conectando nossa terra, nossa cultura e nossa fé através das ondas do rádio e do streaming digital. Sintonize 24 horas por dia.',
  aboutImageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=1920&auto=format&fit=crop',
  rssUrls: [
    'https://news.google.com/rss/search?q=Treze+de+Maio+Santa+Catarina&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    'https://folharegionalwebtv.com/feed'
  ],
  apiUrl: '',
  apiKey: '',
  facebookUrl: 'https://www.facebook.com/radiotrezedemaiosc/',
  instagramUrl: 'https://www.instagram.com/radio13demaio.sc/',
  googleAnalyticsId: '',
  tvEnabled: true, // Enable by default for better UX on first load
  tvPlaylist: DEFAULT_TV_PLAYLIST
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

export const db = {
  init: () => {
    // 1. Force Clean of Old Junk Data
    try {
        const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (rawSettings) {
            const settings = JSON.parse(rawSettings);
            if (settings.logoUrl && (settings.logoUrl.includes('PHN2Zy') || settings.logoUrl.includes('<svg'))) {
                settings.logoUrl = ''; // NUKE IT
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            }
        }
    } catch (e) {
        console.error("Cleanup error", e);
    }

    // 2. Standard Init
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } else {
        // Migration to ensure fields exist
        const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
        let updated = false;

        // Ensure array exists
        if (!Array.isArray(current.rssUrls)) {
            current.rssUrls = DEFAULT_SETTINGS.rssUrls;
            updated = true;
        }
        
        // Ensure defaults
        if (!current.streamUrl) { current.streamUrl = DEFAULT_SETTINGS.streamUrl; updated = true; }
        if (!current.radioName) { current.radioName = DEFAULT_SETTINGS.radioName; updated = true; }
        
        // Ensure social media defaults
        if (!current.facebookUrl) { current.facebookUrl = DEFAULT_SETTINGS.facebookUrl; updated = true; }
        if (!current.instagramUrl) { current.instagramUrl = DEFAULT_SETTINGS.instagramUrl; updated = true; }
        
        // Ensure GA defaults
        if (!current.googleAnalyticsId) { current.googleAnalyticsId = ''; updated = true; }
        
        // Ensure TV defaults
        if (current.tvEnabled === undefined) { current.tvEnabled = true; updated = true; }
        
        // Ensure New Logo Field
        if (current.headerLogoUrl === undefined) { current.headerLogoUrl = ''; updated = true; }

        // FIX: Ensure playlist has valid items if empty
        if (!current.tvPlaylist || current.tvPlaylist.length === 0) { 
            current.tvPlaylist = DEFAULT_TV_PLAYLIST; 
            updated = true; 
        }

        if (updated) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(current));
        }
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROGRAMS)) {
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(DEFAULT_PROGRAMS));
    }
    
    // News Init
    const storedNews = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
    if (storedNews.length === 0 || storedNews.length <= 2) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
    }

    // Rejected News Init
    if (!localStorage.getItem(STORAGE_KEYS.REJECTED_NEWS)) {
      localStorage.setItem(STORAGE_KEYS.REJECTED_NEWS, JSON.stringify([]));
    }

    // Auth Init
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const admin: User = { id: '1', name: 'Administrador', email: 'drynos.com@gmail.com', role: UserRole.ADMIN };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([admin]));
    }
    
    // Sessions Init (Clear old on refresh to prevent ghosts in this demo)
    // In production with real backend, this wouldn't be cleared here.
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    }
  },

  getSettings: (): SiteSettings => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
  },

  saveSettings: (settings: SiteSettings) => {
    // Safety check for quota
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        // FORCE UPDATE: Dispatch event so components like PublicLayout refresh immediately
        window.dispatchEvent(new Event('radio-settings-update'));
    } catch (e) {
        // If quota exceeded, try to clear the logo to save at least text data
        console.error("Quota exceeded, clearing logo to save settings", e);
        throw e;
    }
  },

  getNews: (onlyPublished = false): NewsItem[] => {
    const news: NewsItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
    return onlyPublished ? news.filter(n => n.published) : news;
  },

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

  getRejectedNews: (): NewsItem[] => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REJECTED_NEWS) || '[]');
  },

  saveRejectedNews: (item: NewsItem) => {
      const rejected = db.getRejectedNews();
      if (rejected.some(r => r.title === item.title)) return;
      rejected.unshift(item);
      localStorage.setItem(STORAGE_KEYS.REJECTED_NEWS, JSON.stringify(rejected));
  },

  deleteRejectedNews: (id: string) => {
      const rejected = db.getRejectedNews().filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEYS.REJECTED_NEWS, JSON.stringify(rejected));
  },
  
  clearRejectedNews: () => {
      localStorage.setItem(STORAGE_KEYS.REJECTED_NEWS, JSON.stringify([]));
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
  },

  // --- NEW SESSION TRACKING METHODS ---
  getSessions: (): ListenerSession[] => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  },

  addSession: (session: ListenerSession) => {
      const sessions = db.getSessions();
      // Remove existing if duplicate IP to prevent spam in demo
      const filtered = sessions.filter(s => s.ip !== session.ip);
      filtered.push(session);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  },

  removeSession: (id: string) => {
      const sessions = db.getSessions();
      const filtered = sessions.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  }
};
