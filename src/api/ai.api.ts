import { apiClient, CACHE_PROFILES } from './client';
import {
  AI_CONVERSATIONS_PATH,
  AI_KNOWLEDGE_REINDEX_PATH,
  AI_SETTINGS_PATH,
  AI_SETTINGS_TEST_PATH,
  getAiConversationPath,
  getAiMessagesPath,
} from './aiPaths';
import type {
  AiConversationDetail,
  AiConversationSummary,
  AiProviderSettingsView,
  AiTestResult,
  ReindexKnowledgeResult,
  SendMessageResponse,
  UpdateAiSettingsRequest,
} from '@/types/ai.types';

export const listConversations = async (): Promise<AiConversationSummary[]> => {
  const res = await apiClient.get(AI_CONVERSATIONS_PATH, CACHE_PROFILES.USER);
  return res.data;
};

export const createConversation = async (body?: {
  title?: string;
  lessonId?: string;
}): Promise<AiConversationSummary> => {
  const res = await apiClient.post(AI_CONVERSATIONS_PATH, body ?? {}, { cache: false });
  return res.data;
};

export const getConversation = async (id: string): Promise<AiConversationDetail> => {
  const res = await apiClient.get(getAiConversationPath(id), CACHE_PROFILES.NO_CACHE);
  return res.data;
};

export const deleteConversation = async (id: string): Promise<void> => {
  await apiClient.delete(getAiConversationPath(id), { cache: false });
};

export const sendMessage = async (
  conversationId: string,
  message: string,
): Promise<SendMessageResponse> => {
  const res = await apiClient.post(
    getAiMessagesPath(conversationId),
    { message },
    { cache: false },
  );
  return res.data;
};

export const getAiSettings = async (): Promise<AiProviderSettingsView> => {
  const res = await apiClient.get(AI_SETTINGS_PATH, CACHE_PROFILES.NO_CACHE);
  return res.data;
};

export const updateAiSettings = async (
  body: UpdateAiSettingsRequest,
): Promise<AiProviderSettingsView> => {
  const res = await apiClient.put(AI_SETTINGS_PATH, body, { cache: false });
  return res.data;
};

export const testAiSettings = async (): Promise<AiTestResult> => {
  const res = await apiClient.post(AI_SETTINGS_TEST_PATH, {}, { cache: false });
  return res.data;
};

/**
 * Rebuilds the RAG index the tutor retrieves from. With no `lessonId` this walks
 * the whole corpus, which is incremental — unchanged content is skipped by hash —
 * but can still take a while, so the caller should show progress.
 *
 * `force` re-embeds unchanged content, which is required after changing the
 * embedding model or its width.
 */
export const reindexKnowledge = async (body?: {
  lessonId?: string;
  force?: boolean;
}): Promise<ReindexKnowledgeResult> => {
  const res = await apiClient.post(AI_KNOWLEDGE_REINDEX_PATH, body ?? {}, { cache: false });
  return res.data;
};
