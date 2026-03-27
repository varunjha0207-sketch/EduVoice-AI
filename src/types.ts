
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Language = 'English' | 'Hindi';

export interface SessionConfig {
  type: string;
  topic: string;
  difficulty: Difficulty;
  language: Language;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface Session {
  id: string;
  config: SessionConfig;
  messages: Message[];
  feedback?: string;
  notes?: string[];
  timestamp: number;
}
