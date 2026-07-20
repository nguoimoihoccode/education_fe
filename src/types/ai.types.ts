export type AiMessageRole = 'user' | 'assistant';

export interface AiMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
}

export interface AiConversationSummary {
  id: string;
  title: string;
  lessonId: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface AiConversationDetail extends Omit<AiConversationSummary, 'messageCount'> {
  messages: AiMessage[];
}

export interface SendMessageResponse {
  userMessage: AiMessage;
  assistantMessage: AiMessage;
  conversation: { id: string; title: string; updatedAt: string };
}

export type ConfigSource = 'db' | 'env' | 'default';

export interface AiProviderSettingsView {
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  apiKeyConfigured: boolean;
  apiKeyLast4: string | null;
  source: {
    baseUrl: ConfigSource;
    apiKey: ConfigSource;
    model: ConfigSource;
    maxTokens: ConfigSource;
    temperature: ConfigSource;
  };
  updatedAt: string | null;
}

export interface UpdateAiSettingsRequest {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  clearApiKey?: boolean;
  clearBaseUrl?: boolean;
  clearModel?: boolean;
  clearMaxTokens?: boolean;
  clearTemperature?: boolean;
}
