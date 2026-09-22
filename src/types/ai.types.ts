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

export interface AiEmbeddingSettingsView {
  baseUrl: string;
  model: string;
  /** Width of the stored vectors; must match the `embedding` column. */
  dimensions: number;
  apiKeyConfigured: boolean;
  apiKeyLast4: string | null;
  source: {
    baseUrl: ConfigSource;
    apiKey: ConfigSource;
    model: ConfigSource;
    dimensions: ConfigSource;
  };
  updatedAt: string | null;
}

export interface AiProviderSettingsView {
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  /** Effective system rules / prompt used for every tutor chat */
  systemRules: string;
  apiKeyConfigured: boolean;
  apiKeyLast4: string | null;
  source: {
    baseUrl: ConfigSource;
    apiKey: ConfigSource;
    model: ConfigSource;
    maxTokens: ConfigSource;
    temperature: ConfigSource;
    systemRules: ConfigSource;
  };
  updatedAt: string | null;
  /**
   * The embedding provider is configured separately from the chat provider —
   * the default chat provider (Groq) exposes no embeddings endpoint at all — so
   * it is reported alongside rather than folded into the fields above.
   */
  embedding: AiEmbeddingSettingsView;
}

export interface UpdateEmbeddingSettingsRequest {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  dimensions?: number;
  clearApiKey?: boolean;
  clearBaseUrl?: boolean;
  clearModel?: boolean;
  clearDimensions?: boolean;
}

export interface UpdateAiSettingsRequest {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemRules?: string;
  clearApiKey?: boolean;
  clearBaseUrl?: boolean;
  clearModel?: boolean;
  clearMaxTokens?: boolean;
  clearTemperature?: boolean;
  clearSystemRules?: boolean;
  embedding?: UpdateEmbeddingSettingsRequest;
}

/**
 * The embedding provider's outcome is reported rather than thrown by the server:
 * an admin checking the chat side must not be blocked by an embedding one that is
 * simply not set up yet.
 */
export interface AiTestResult {
  ok: boolean;
  latencyMs: number;
  embedding: { ok: boolean; latencyMs: number; error?: string };
}

/** Two shapes: one lesson reindexed, or the whole-corpus sweep. */
export interface ReindexKnowledgeResult {
  lessonId?: string;
  lessons?: number;
  chunks: number;
  embedded: number;
  removed: number;
  failed?: number;
}
