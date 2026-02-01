
import { NewsItem, Program, SiteSettings, SongRequest, ContactMessage, User, UserRole, ListenerSession, TVItem, Sponsor } from '../types';

const STORAGE_KEYS = {
  NEWS: 'radio_13_news',
  REJECTED_NEWS: 'radio_13_rejected_news', 
  PROGRAMS: 'radio_13_programs',
  REQUESTS: 'radio_13_requests',
  SETTINGS: 'radio_13_settings',
  MESSAGES: 'radio_13_messages',
  USERS: 'radio_13_users',
  SESSIONS: 'radio_13_active_sessions',
  SPONSORS: 'radio_13_sponsors'
};

// URL da API PHP
const API_URL = './api.php';

// ID Único da imagem de estúdio problemática no Unsplash
const STUDIO_IMG_ID = '1598488035139';

// NOVA IMAGEM PADRÃO: PAISAGEM (Horizonte/Campo)
const DEFAULT_LANDSCAPE = 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1920&auto=format&fit=crop';

const DEFAULT_TV_PLAYLIST: TVItem[] = [
  {
    id: '1',
    title: 'TV Fluxx - Transmissão 24h',
    type: 'live',
    url: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    duration: 'Ao Vivo'
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  streamUrl: 'http://stm4.xradios.com.br:6982/stream',
  radioName: 'Rádio Treze de Maio',
  
  // Imagens começam com a Paisagem Padrão
  logoUrl: '', 
  headerLogoUrl: '', 
  backgroundImageUrl: DEFAULT_LANDSCAPE, 
  heroLeftImageUrl: '', 
  heroRightImageUrl: '',
  aboutImageUrl: '', 
  
  phone: '(48) 3625-0000',
  whatsapp: '(48) 99999-0000',
  email: 'contato@radiotrezedemaio.com.br',
  address: 'Treze de Maio - SC',
  aboutText: 'A Rádio Treze de Maio é a voz da nossa comunidade. Conectando nossa terra, nossa cultura e nossa fé através das ondas do rádio e do streaming digital. Sintonize 24 horas por dia.',
  rssUrls: [
    'https://news.google.com/rss/search?q=Treze+de+Maio+Santa+Catarina&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    'https://notisul.com.br/feed/',
    'https://hcnoticias.com.br/feed/',
    'https://folharegionalwebtv.com/feed',
    'https://extra.sc/feed/',
    'https://www.engeplus.com.br/rss/'
  ],
  apiUrl: '',
  apiKey: '',
  facebookUrl: 'https://www.facebook.com/radiotrezedemaiosc/',
  instagramUrl: 'https://www.instagram.com/radio13demaio.sc/',
  xUrl: 'https://x.com/ProtoStreaming',
  telegramUrl: 'https://t.me/+Y-9-kyrRiQ8yOWFh',
  googleAnalyticsId: '',
  tvEnabled: true,
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

const syncToServer = async (key: string, data: any) => {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [key]: data })
        });
    } catch (e) {
        // Silently fail in production if API is missing
    }
};

const sendEmailNotification = async (type: 'request' | 'message', data: any) => {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'send_email',
                type: type,
                payload: data,
                to: 'drynos.com@gmail.com' 
            })
        });
    } catch (e) {
        // Silently fail
    }
};

export const db = {
  init: async () => {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const serverData = await response.json();
            if (serverData && serverData.status !== 'empty') {
                Object.keys(serverData).forEach(key => {
                    if (Object.values(STORAGE_KEYS).includes(key)) {
                        localStorage.setItem(key, JSON.stringify(serverData[key]));
                    }
                });
                window.dispatchEvent(new Event('radio-settings-update'));
                window.dispatchEvent(new Event('storage'));
            }
        }
    } catch (e) {
        // Offline mode or API missing - use local defaults silently
    }

    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } else {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
        let updated = false;

        // --- SCRIPT DE CORREÇÃO AGRESSIVA ---
        const bg = current.backgroundImageUrl || '';
        if (bg === '' || bg.includes(STUDIO_IMG_ID)) {
            current.backgroundImageUrl = DEFAULT_LANDSCAPE;
            updated = true;
        }
        
        const logo = current.logoUrl || '';
        if (logo.includes(STUDIO_IMG_ID)) {
             current.logoUrl = '';
             updated = true;
        }

        if (!Array.isArray(current.rssUrls) || current.rssUrls.length <= 2) { 
            current.rssUrls = DEFAULT_SETTINGS.rssUrls; 
            updated = true; 
        }
        
        if (!current.streamUrl) { current.streamUrl = DEFAULT_SETTINGS.streamUrl; updated = true; }
        if (!current.radioName) { current.radioName = DEFAULT_SETTINGS.radioName; updated = true; }
        
        if (current.tvEnabled === undefined) { current.tvEnabled = true; updated = true; }
        if (current.headerLogoUrl === undefined) { current.headerLogoUrl = ''; updated = true; }
        
        if (!current.tvPlaylist || current.tvPlaylist.length === 0) { 
             current.tvPlaylist = DEFAULT_TV_PLAYLIST; 
             updated = true; 
        }
        
        // Garante que campos opcionais existam
        if (current.heroLeftImageUrl === undefined) { current.heroLeftImageUrl = ''; updated = true; }
        if (current.heroRightImageUrl === undefined) { current.heroRightImageUrl = ''; updated = true; }
        if (current.logoUrl === undefined) { current.logoUrl = ''; updated = true; }

        if (updated) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(current));
        }
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROGRAMS)) {
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(DEFAULT_PROGRAMS));
    }
    
    const storedNews = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
    if (storedNews.length === 0) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.REJECTED_NEWS)) {
      localStorage.setItem(STORAGE_KEYS.REJECTED_NEWS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const admin: User = { id: '1', name: 'Administrador', email: 'drynos.com@gmail.com', role: UserRole.ADMIN };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([admin]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.SPONSORS)) {
        localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify([]));
    }
  },

  getSettings: (): SiteSettings => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
  },

  saveSettings: (settings: SiteSettings) => {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        syncToServer(STORAGE_KEYS.SETTINGS, settings);
        window.dispatchEvent(new Event('radio-settings-update'));
    } catch (e) {
        throw e;
    }
  },

  getNews: (onlyPublished = false): NewsItem[] => {
    const news: NewsItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
    news.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime() || 0;
        const dateB = new Date(b.createdAt).getTime() || 0;
        return dateB - dateA;
    });
    return onlyPublished ? news.filter(n => n.published) : news;
  },

  getNewsItem: (id: string): NewsItem | undefined => {
    const news: NewsItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
    return news.find(n => n.id === id);
  },

  saveNewsItem: (item: NewsItem) => {
    let news = db.getNews(false);
    const index = news.findIndex(n => n.id === item.id);
    
    if (index >= 0) {
      news[index] = item;
    } else {
      news.push(item);
    }

    news.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime() || 0;
        const dateB = new Date(b.createdAt).getTime() || 0;
        return dateB - dateA;
    });

    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
    syncToServer(STORAGE_KEYS.NEWS, news);
  },

  deleteNewsItem: (id: string) => {
    const news = db.getNews().filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
    syncToServer(STORAGE_KEYS.NEWS, news);
  },

  getRejectedNews: (): NewsItem[] => {
      const news: NewsItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REJECTED_NEWS) || '[]');
      news.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime() || 0;
        const dateB = new Date(b.createdAt).getTime() || 0;
        return dateB - dateA;
      });
      return news;
  },

  saveRejectedNews: (item: NewsItem) => {
      let rejected = db.getRejectedNews();
      if (rejected.some(r => r.title === item.title)) return;
      rejected.push(item);
      
      rejected.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime() || 0;
        const dateB = new Date(b.createdAt).getTime() || 0;
        return dateB - dateA;
      });

      localStorage.setItem(STORAGE_KEYS.REJECTED_NEWS, JSON.stringify(rejected));
      syncToServer(STORAGE_KEYS.REJECTED_NEWS, rejected); 
  },

  deleteRejectedNews: (id: string) => {
      const rejected = db.getRejectedNews().filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEYS.REJECTED_NEWS, JSON.stringify(rejected));
      syncToServer(STORAGE_KEYS.REJECTED_NEWS, rejected);
  },
  
  clearRejectedNews: () => {
      localStorage.setItem(STORAGE_KEYS.REJECTED_NEWS, JSON.stringify([]));
      syncToServer(STORAGE_KEYS.REJECTED_NEWS, []);
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
    syncToServer(STORAGE_KEYS.PROGRAMS, programs);
  },

  deleteProgram: (id: string) => {
    const programs = db.getPrograms().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    syncToServer(STORAGE_KEYS.PROGRAMS, programs);
  },

  getRequests: (): SongRequest[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
  },

  addRequest: (req: SongRequest) => {
    const requests = db.getRequests();
    requests.unshift(req);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    syncToServer(STORAGE_KEYS.REQUESTS, requests);
    sendEmailNotification('request', req);
  },

  updateRequestStatus: (id: string, status: 'pending' | 'played') => {
    const requests = db.getRequests();
    const req = requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
      syncToServer(STORAGE_KEYS.REQUESTS, requests);
    }
  },

  getMessages: (): ContactMessage[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  },

  addMessage: (msg: ContactMessage) => {
    const messages = db.getMessages();
    messages.unshift(msg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    syncToServer(STORAGE_KEYS.MESSAGES, messages);
    sendEmailNotification('message', msg);
  },

  getSponsors: (): Sponsor[] => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SPONSORS) || '[]');
  },
  
  saveSponsor: (sponsor: Sponsor) => {
      const sponsors = db.getSponsors();
      const index = sponsors.findIndex(s => s.id === sponsor.id);
      if (index >= 0) {
          sponsors[index] = sponsor;
      } else {
          sponsors.push(sponsor);
      }
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(sponsors));
      syncToServer(STORAGE_KEYS.SPONSORS, sponsors);
  },
  
  deleteSponsor: (id: string) => {
      const sponsors = db.getSponsors().filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(sponsors));
      syncToServer(STORAGE_KEYS.SPONSORS, sponsors);
  },

  getSessions: (): ListenerSession[] => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  },

  addSession: (session: ListenerSession) => {
      const sessions = db.getSessions();
      const filtered = sessions.filter(s => s.ip !== session.ip);
      filtered.push(session);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  },

  removeSession: (id: string) => {
      const sessions = db.getSessions();
      const filtered = sessions.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  },

  exportBackup: (): string => {
      const backup: Record<string, any> = {};
      Object.values(STORAGE_KEYS).forEach(key => {
          const data = localStorage.getItem(key);
          if (data) {
              try {
                  backup[key] = JSON.parse(data);
              } catch (e) {
                  backup[key] = data;
              }
          }
      });
      backup['backup_metadata'] = {
          date: new Date().toISOString(),
          version: '1.0'
      };
      return JSON.stringify(backup, null, 2);
  },

  importBackup: (jsonString: string): { success: boolean, message: string } => {
      try {
          const backup = JSON.parse(jsonString);
          let count = 0;

          if (!backup || typeof backup !== 'object') {
              return { success: false, message: 'Arquivo de backup inválido.' };
          }

          Object.keys(backup).forEach(key => {
              if (Object.values(STORAGE_KEYS).includes(key)) {
                  localStorage.setItem(key, JSON.stringify(backup[key]));
                  syncToServer(key, backup[key]);
                  count++;
              }
          });
          
          window.dispatchEvent(new Event('radio-settings-update'));
          
          return { success: true, message: `${count} bancos de dados restaurados e sincronizados.` };
      } catch (e) {
          return { success: false, message: 'Erro ao processar o arquivo.' };
      }
  }
};
