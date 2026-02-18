export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  isError?: boolean;
  image?: string; // base64
}

export interface GenerationConfig {
  thinkingBudget?: number; // 0 to disable, > 0 to enable
}

export enum ModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
}

export interface Airdrop {
  id: string;
  name: string;
  value: string;
  status: 'Active' | 'Upcoming' | 'Ended';
  description: string;
  tags: string[];
  url?: string;
  requirements: string[];
}