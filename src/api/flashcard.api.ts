import { apiClient, CACHE_PROFILES } from "./client";
import {
  buildReviewSessionResponse,
  normalizeCollectionPage,
  normalizeFlashcardStats,
} from "./normalizers";
import type {
  FlashcardDeck,
  Flashcard,
  ReviewSession,
  FlashcardStats,
  DeckStats,
  CreateFlashcardDeckDto,
  UpdateFlashcardDeckDto,
  CreateFlashcardDto,
  BulkCreateFlashcardDto,
  UpdateFlashcardDto,
  ReviewFlashcardDto,
  StartReviewSessionDto,
  CompleteReviewSessionDto,
  ImportFromVocabularyDto,
  ImportFromVocabularyBulkDto,
  FlashcardDecksResponse,
  FlashcardsResponse,
  ReviewSessionResponse,
} from "@/types/flashcard.types";

// ==================== DECK MANAGEMENT ====================

export const getFlashcardDecks = async (params?: {
  topic?: string;
  page?: number;
  limit?: number;
}): Promise<FlashcardDecksResponse> => {
  const response = await apiClient.get("/flashcards/decks", {
    params,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return normalizeCollectionPage<FlashcardDeck>(response.data, "decks");
};

export const getPublicFlashcardDecks = async (params?: {
  page?: number;
  limit?: number;
}): Promise<FlashcardDecksResponse> => {
  const response = await apiClient.get("/flashcards/decks/public", {
    params,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return normalizeCollectionPage<FlashcardDeck>(response.data, "decks");
};

export const getFlashcardDeckById = async (
  deckId: string,
): Promise<FlashcardDeck> => {
  const response = await apiClient.get(
    `/flashcards/decks/${deckId}`,
    CACHE_PROFILES.DYNAMIC,
  );
  return response.data;
};

// Get decks filtered by specific topic using path parameter
export const getDecksByTopic = async (
  topic: string,
  params?: {
    page?: number;
    limit?: number;
  },
): Promise<FlashcardDecksResponse> => {
  const response = await apiClient.get(`/flashcards/decks/topic/${topic}`, {
    params,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return normalizeCollectionPage<FlashcardDeck>(response.data, "decks");
};

// Get all available topics for flashcards
export const getAvailableTopics = async (): Promise<string[]> => {
  const response = await apiClient.get(
    "/flashcards/topics",
    CACHE_PROFILES.STATIC,
  );
  return response.data;
};

export const createFlashcardDeck = async (
  dto: CreateFlashcardDeckDto,
): Promise<FlashcardDeck> => {
  const response = await apiClient.post("/flashcards/decks", dto);
  return response.data;
};

export const updateFlashcardDeck = async (
  deckId: string,
  dto: UpdateFlashcardDeckDto,
): Promise<FlashcardDeck> => {
  const response = await apiClient.patch(`/flashcards/decks/${deckId}`, dto);
  return response.data;
};

export const deleteFlashcardDeck = async (deckId: string): Promise<void> => {
  await apiClient.delete(`/flashcards/decks/${deckId}`);
};

// ==================== FLASHCARD MANAGEMENT ====================

export const getFlashcards = async (params?: {
  deckId?: string;
  page?: number;
  limit?: number;
}): Promise<FlashcardsResponse> => {
  const response = await apiClient.get("/flashcards", {
    params,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return normalizeCollectionPage<Flashcard>(response.data, "flashcards");
};

export const getFlashcardById = async (
  flashcardId: string,
): Promise<Flashcard> => {
  const response = await apiClient.get(
    `/flashcards/${flashcardId}`,
    CACHE_PROFILES.DYNAMIC,
  );
  return response.data;
};

export const createFlashcard = async (
  dto: CreateFlashcardDto,
): Promise<Flashcard> => {
  const response = await apiClient.post("/flashcards", dto);
  return response.data;
};

export const bulkCreateFlashcards = async (
  dto: BulkCreateFlashcardDto,
): Promise<Flashcard[]> => {
  const response = await apiClient.post("/flashcards/bulk", dto);
  return Array.isArray(response.data?.created) ? response.data.created : [];
};

export const updateFlashcard = async (
  flashcardId: string,
  dto: UpdateFlashcardDto,
): Promise<Flashcard> => {
  const response = await apiClient.patch(`/flashcards/${flashcardId}`, dto);
  return response.data;
};

export const deleteFlashcard = async (flashcardId: string): Promise<void> => {
  await apiClient.delete(`/flashcards/${flashcardId}`);
};

export const searchFlashcards = async (params: {
  query: string;
  page?: number;
  limit?: number;
}): Promise<FlashcardsResponse> => {
  const response = await apiClient.get("/flashcards/search", {
    params,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return normalizeCollectionPage<Flashcard>(response.data, "flashcards");
};

// ==================== IMPORT FROM VOCABULARY ====================

export const importFromVocabulary = async (
  dto: ImportFromVocabularyDto,
): Promise<{ imported: number; skipped: number; deckId: string }> => {
  const response = await apiClient.post("/flashcards/import/vocabulary", dto);
  return response.data;
};

export const importFromVocabularyBulk = async (
  dto: ImportFromVocabularyBulkDto,
): Promise<{ imported: number; skipped: number; deckId: string }> => {
  const response = await apiClient.post(
    "/flashcards/import/vocabulary/bulk",
    dto,
  );
  return {
    imported: response.data?.totalImported ?? 0,
    skipped: response.data?.totalSkipped ?? 0,
    deckId:
      response.data?.results?.find?.((item: { deckId?: string }) => item.deckId)
        ?.deckId ?? "",
  };
};

// ==================== REVIEW SYSTEM ====================

export const startReviewSession = async (
  dto: StartReviewSessionDto,
): Promise<ReviewSessionResponse> => {
  const [sessionResponse, flashcards] = await Promise.all([
    apiClient.post("/flashcards/review/start", dto),
    getDueFlashcards({ deckId: dto.deckId, limit: dto.limit }),
  ]);

  return buildReviewSessionResponse(sessionResponse.data, flashcards);
};

export const reviewFlashcard = async (
  flashcardId: string,
  dto: ReviewFlashcardDto,
): Promise<{ success: boolean; nextReview: string | null }> => {
  const response = await apiClient.post(
    `/flashcards/review/${flashcardId}`,
    dto,
  );
  return response.data;
};

export const completeReviewSession = async (
  dto: CompleteReviewSessionDto,
): Promise<ReviewSession> => {
  const response = await apiClient.post("/flashcards/review/complete", dto);
  return response.data;
};

export const getDueFlashcards = async (params?: {
  deckId?: string;
  limit?: number;
}): Promise<Flashcard[]> => {
  const response = await apiClient.get("/flashcards/review/due", {
    params,
    ...CACHE_PROFILES.NO_CACHE,
  });
  return response.data;
};

export const getReviewStats = async (): Promise<FlashcardStats> => {
  const response = await apiClient.get(
    "/flashcards/review/stats",
    CACHE_PROFILES.USER,
  );
  return normalizeFlashcardStats(response.data);
};

// ==================== STATISTICS ====================

export const getFlashcardStats = async (): Promise<FlashcardStats> => {
  const response = await apiClient.get(
    "/flashcards/stats",
    CACHE_PROFILES.USER,
  );
  return normalizeFlashcardStats(response.data);
};

export const getDeckStats = async (deckId: string): Promise<DeckStats> => {
  const response = await apiClient.get(
    `/flashcards/decks/${deckId}/stats`,
    CACHE_PROFILES.USER,
  );
  const data = response.data;
  const statusStats = data?.statusStats ?? {};

  return {
    deckId: data?.deck?.id ?? deckId,
    deckName: data?.deck?.name ?? "",
    totalCards: data?.totalFlashcards ?? 0,
    dueCards: data?.dueCount ?? 0,
    masteredCards: statusStats.MASTERED ?? 0,
    learningCards: statusStats.LEARNING ?? 0,
    newCards: statusStats.NEW ?? 0,
    totalReviews: data?.totalReviews ?? 0,
    averageAccuracy: Math.round(
      typeof data?.averageAccuracy === "number"
        ? data.averageAccuracy
        : (data?.correctRate ?? 0) * 100,
    ),
    lastReviewed: data?.lastReviewed ?? null,
  };
};

export const getReviewHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  items: ReviewSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const response = await apiClient.get("/flashcards/history", {
    params,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return normalizeCollectionPage<ReviewSession>(response.data, "sessions");
};
