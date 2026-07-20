import { apiClient, CACHE_PROFILES } from './client';
import type {
  AiConversationDetail,
  AiConversationSummary,
  AiProviderSettingsView,
  SendMessageResponse,
  UpdateAiSettingsRequest,
} from '@/types/ai.types';

export const listConversations = async (): Promise<AiConversationSummary[]> => {
  const res = await apiClient.get('/ai/conversations', CACHE_PROFILES.USER);
  return res.data;
};

export const createConversation = async (body?: {
  title?: string;
  lessonId?: string;
}): Promise<AiConversationSummary> => {
  const res = await apiClient.post('/ai/conversations', body ?? {}, { cache: false });
  return res.data;
};

export const getConversation = async (id: string): Promise<AiConversationDetail> => {
  const res = await apiClient.get(`/ai/conversations/${id}`, CACHE_PROFILES.NO_CACHE);
  return res.data;
};

export const deleteConversation = async (id: string): Promise<void> => {
  await apiClient.delete(`/ai/conversations/${id}`, { cache: false });
};

export const sendMessage = async (
  conversationId: string,
  message: string,
): Promise<SendMessageResponse> => {
  const res = await apiClient.post(
    `/ai/conversations/${conversationId}/messages`,
    { message },
    { cache: false },
  );
  return res.data;
};

export const getAiSettings = async (): Promise<AiProviderSettingsView> => {
  const res = await apiClient.get('/ai/settings', CACHE_PROFILES.NO_CACHE);
  return res.data;
};

export const updateAiSettings = async (
  body: UpdateAiSettingsRequest,
): Promise<AiProviderSettingsView> => {
  const res = await apiClient.put('/ai/settings', body, { cache: false });
  return res.data;
};

export const testAiSettings = async (): Promise<{ ok: boolean; latencyMs: number }> => {
  const res = await apiClient.post('/ai/settings/test', {}, { cache: false });
  return res.data;
};
