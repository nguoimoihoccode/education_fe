import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/utils/constants';

export interface LocalAiSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const DEFAULT_LOCAL_SETTINGS: LocalAiSettings = {
  apiKey: '',
  baseUrl: 'https://api.groq.com/openai/v1',
  model: 'llama-3.3-70b-versatile',
  maxTokens: 700,
  temperature: 0.4,
};

interface AiProviderState {
  settings: LocalAiSettings;
  isConfigured: boolean;
  saveSettings: (settings: Partial<LocalAiSettings>) => void;
  clearSettings: () => void;
}

export const useAiProviderStore = create<AiProviderState>()(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_LOCAL_SETTINGS },
      isConfigured: false,
      saveSettings: (partial) => {
        const next = { ...get().settings, ...partial };
        set({
          settings: next,
          isConfigured: !!next.apiKey.trim(),
        });
      },
      clearSettings: () => {
        set({
          settings: { ...DEFAULT_LOCAL_SETTINGS },
          isConfigured: false,
        });
      },
    }),
    {
      name: STORAGE_KEYS.AI_PROVIDER,
      version: 1,
      partialize: (state) => ({
        settings: state.settings,
        isConfigured: state.isConfigured,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AiProviderState>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_LOCAL_SETTINGS, ...(p.settings ?? {}) },
        };
      },
    },
  ),
);
