// Flashcard Types

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  cardCount: number;
  type: 'SYSTEM' | 'USER';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  pronunciation: string | null;
  example: string | null;
  exampleTranslation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  notes: string | null;
  status: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED';
  difficulty: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  deckId: string;
  userId: number;
  sourceVocabularyId: string | null;
  tags: string[];
}

export interface UserFlashcard {
  id: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string | null;
  lastReviewed: string | null;
  correctCount: number;
  wrongCount: number;
  totalReviews: number;
  firstReviewed: string | null;
  streak: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  flashcardId: string;
  deckId: string;
}

export interface ReviewSession {
  id: string;
  type: 'DAILY' | 'DECK' | 'CUSTOM';
  totalCards: number;
  correctCards: number;
  wrongCards: number;
  skippedCards: number;
  timeSpent: number;
  xpEarned: number;
  results: ReviewResult[];
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
  userId: number;
  deckId: string | null;
}

export interface ReviewResult {
  flashcardId: string;
  quality: number;
  correct: boolean;
  timeSpent: number;
}

export interface FlashcardStats {
  totalDecks: number;
  totalFlashcards: number;
  dueFlashcards: number;
  masteredFlashcards: number;
  learningFlashcards: number;
  newFlashcards: number;
  totalReviews: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
}

export interface DeckStats {
  deckId: string;
  deckName: string;
  totalCards: number;
  dueCards: number;
  masteredCards: number;
  learningCards: number;
  newCards: number;
  totalReviews: number;
  averageAccuracy: number;
  lastReviewed: string | null;
}

// DTOs for API requests
export interface CreateFlashcardDeckDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic?: boolean;
}

export interface UpdateFlashcardDeckDto {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic?: boolean;
}

export interface CreateFlashcardDto {
  front: string;
  back: string;
  pronunciation?: string;
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
  imageUrl?: string;
  notes?: string;
  difficulty?: number;
  deckId?: string;
  tags?: string[];
}

export interface BulkCreateFlashcardDto {
  flashcards: CreateFlashcardDto[];
  deckId?: string;
}

export interface UpdateFlashcardDto {
  front?: string;
  back?: string;
  pronunciation?: string;
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
  imageUrl?: string;
  notes?: string;
  difficulty?: number;
  tags?: string[];
}

export interface ReviewFlashcardDto {
  flashcardId: string;
  quality: number; // 0=blackout, 1=forgot, 2=hard, 3=good, 4=easy, 5=perfect
}

export interface StartReviewSessionDto {
  deckId?: string;
  limit?: number;
  type?: 'DAILY' | 'DECK' | 'CUSTOM';
}

export interface CompleteReviewSessionDto {
  sessionId: string;
}

export interface ImportFromVocabularyDto {
  lessonId: string;
  deckId?: string;
  createDeck?: boolean;
}

export interface ImportFromVocabularyBulkDto {
  lessonIds: string[];
  deckId?: string;
}

// Response types
export interface FlashcardDecksResponse {
  items: FlashcardDeck[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FlashcardsResponse {
  items: Flashcard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewSessionResponse {
  session: ReviewSession;
  flashcards: Flashcard[];
}
