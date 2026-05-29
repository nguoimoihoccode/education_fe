import { apiClient, CACHE_PROFILES } from './client';
import type { GenerateSlideDeckRequest, SlideDeck, UpdateSlideDeckRequest } from '@/types/slides.types';

export const getSlideDecks = async (): Promise<SlideDeck[]> => {
  const response = await apiClient.get('/slides', CACHE_PROFILES.USER);
  return response.data;
};

export const getSlideDeck = async (id: string): Promise<SlideDeck> => {
  const response = await apiClient.get(`/slides/${id}`, CACHE_PROFILES.NO_CACHE);
  return response.data;
};

export const getPublishedLessonSlideDecks = async (lessonId: string): Promise<SlideDeck[]> => {
  const response = await apiClient.get(`/slides/lessons/${lessonId}`, CACHE_PROFILES.DYNAMIC);
  return response.data;
};

export const generateSlideDeck = async (data: GenerateSlideDeckRequest): Promise<SlideDeck> => {
  const response = await apiClient.post('/slides/generate', data, { cache: false });
  return response.data;
};

export const updateSlideDeck = async (id: string, data: UpdateSlideDeckRequest): Promise<SlideDeck> => {
  const response = await apiClient.patch(`/slides/${id}`, data, { cache: false });
  return response.data;
};

export const publishSlideDeck = async (id: string): Promise<SlideDeck> => {
  const response = await apiClient.post(`/slides/${id}/publish`, undefined, { cache: false });
  return response.data;
};

export const deleteSlideDeck = async (id: string): Promise<void> => {
  await apiClient.delete(`/slides/${id}`, { cache: false });
};
