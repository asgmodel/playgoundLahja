
export type Dialect = 'najdi' | 'hijazi' | 'southern' | 'eastern';
export type AppMode = 'chat' | 'live';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // base64
  url: string; // object URL for preview
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  dialect: Dialect;
}

export interface AppConfig {
  dialect: Dialect;
  ttsEnabled: boolean;
  voice: string;
  speechSpeed: number;
  theme: 'light' | 'dark';
  mode: AppMode;
}
