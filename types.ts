
export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Can be HTML now
  category: 'Cidade' | 'Região' | 'Avisos';
  imageUrl: string;
  createdAt: string;
  published: boolean;
  source?: string; // Optional source attribution
  tags?: string[];
}

export interface IncomingWebhookData {
  cidade: string;
  titulo: string;
  conteudo_html: string;
  nota: number;
  tags: string[];
  fonte: string;
  data_publicacao: string;
}

export interface Program {
  id: string;
  name: string;
  host: string;
  description: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  days: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface SongRequest {
  id: string;
  listenerName: string;
  location: string;
  artist: string;
  song: string;
  message?: string;
  status: 'pending' | 'played';
  createdAt: string;
}

export interface SiteSettings {
  streamUrl: string;
  radioName: string;
  logoUrl?: string; // New field for custom logo
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  aboutText: string;
  aboutImageUrl: string;
  rssUrls: string[]; // New field for RSS/API sources
  // New Backend/Database Integration Fields
  apiUrl?: string; 
  apiKey?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
