
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
    'https://news.google.com/rss/search?q=Treze+de+Maio+Santa+Catarina&hl=pt-BR&gl=BR&ceid=BR:pt-419'
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
    excerpt: 'Evento tradicional movimentou o final de semana na cidade com desfiles e exposições.',
    content: 'A tradicional Festa do Agricultor de Treze de Maio superou as expectativas este ano. Mais de 5 mil pessoas passaram pelo parque de exposições para prestigiar o desfile de máquinas agrícolas, as exposições de produtos coloniais e os shows regionais. O prefeito destacou a importância do evento para a economia local.',
    category: 'Cidade',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-5848b4491178?q=80&w=1000&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
    published: true
  },
  {
    id: '2',
    title: 'Obras na estrada geral avançam',
    excerpt: 'Pavimentação asfáltica deve ser concluída até o próximo mês, segundo a prefeitura.',
    content: 'As obras de pavimentação que ligam o centro às comunidades do interior estão 80% concluídas. O prefeito visitou o local nesta manhã e garantiu que o cronograma está em dia. A melhoria vai facilitar o escoamento da produção agrícola e o transporte escolar.',
    category: 'Região',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    published: true
  },
  {
    id: '3',
    title: 'Campanha de Vacinação contra a Gripe inicia nesta segunda',
    excerpt: 'Todas as unidades de saúde estarão abertas das 8h às 17h para grupos prioritários.',
    content: 'A Secretaria de Saúde de Treze de Maio informa que a campanha de vacinação contra a Influenza começa nesta segunda-feira. Idosos acima de 60 anos e crianças menores de 5 anos devem comparecer ao posto de saúde central ou nas unidades dos bairros. É obrigatório apresentar a carteirinha de vacinação e o cartão do SUS.',
    category: 'Avisos',
    imageUrl: 'https://images.unsplash.com/photo-1632053009626-3f1396a92849?q=80&w=1000&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    published: true
  },
  {
    id: '4',
    title: 'Final do Campeonato Municipal de Futebol é adiada',
    excerpt: 'Devido às fortes chuvas, a partida decisiva acontecerá no próximo domingo.',
    content: 'O Departamento de Esportes comunica que a grande final do Campeonato Municipal, prevista para este domingo, foi transferida para a próxima semana. A decisão visa preservar o gramado do Estádio Municipal e garantir a segurança dos jogadores e torcedores. O horário permanece o mesmo: 15h30.',
    category: 'Cidade',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bde9be51?q=80&w=1000&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    published: true
  },
  {
    id: '5',
    title: 'Castelo Belvedere recebe visita de escolas da região',
    excerpt: 'Ponto turístico de Treze de Maio é destaque em projeto educativo sobre história local.',
    content: 'Nesta semana, o Castelo Belvedere recebeu mais de 200 alunos de escolas municipais de Tubarão e Jaguaruna. O projeto visa valorizar a arquitetura e a história da colonização local. Os alunos puderam conhecer o interior da capela e desfrutar da vista panorâmica da cidade.',
    category: 'Região',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Castelo_Belvedere_Treze_de_Maio_SC_01.jpg/600px-Castelo_Belvedere_Treze_de_Maio_SC_01.jpg',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    published: true
  },
  {
    id: '6',
    title: 'Comunicado: Interrupção no abastecimento de água',
    excerpt: 'Bairro Centro e São Gabriel ficarão sem água para manutenção na rede.',
    content: 'A companhia de águas informa que haverá corte no abastecimento nesta quarta-feira, das 13h às 17h, para reparos emergenciais na tubulação principal. Recomendamos que os moradores economizem água durante o período. O abastecimento deve normalizar até o início da noite.',
    category: 'Avisos',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1661910006766-3d2b2721869f?q=80&w=1000&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    published: true
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
            // This detects if the user has the old "hardcoded" base64 logo saved and clears it.
            // This forces the app to use the RadioLogo component SVG which is consistent everywhere.
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
                 // Suggest default if empty for testing
                 current.rssUrls = DEFAULT_SETTINGS.rssUrls;
                 updated = true;
            }

            // Fix 4: Ensure API fields exist
            if (current.apiUrl === undefined) {
                current.apiUrl = '';
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
