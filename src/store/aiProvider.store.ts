import { create } from 'zustand';

type AiProviderState = {
  apiKey: string;
  baseUrl: string;
  model: string;
  setApiKey: (key: string) => void;
  setBaseUrl: (url: string) => void;
  setModel: (model: string) => void;
};

export const useAiProviderStore = create<AiProviderState>((set) => ({
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  setApiKey: (key) => set({ apiKey: key }),
  setBaseUrl: (url) => set({ baseUrl: url }),
  setModel: (model) => set({ model }),
}));
