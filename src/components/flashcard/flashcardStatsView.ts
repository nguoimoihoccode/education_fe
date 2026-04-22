import type { DeckStats, FlashcardStats } from '@/types/flashcard.types';

export interface FlashcardStatItem {
  label: string;
  value: number | string;
  color: 'indigo' | 'orange' | 'green' | 'emerald' | 'red' | 'amber';
}

export interface FlashcardProgressItem {
  label: string;
  current: number;
  total: number;
  color: string;
}

export interface FlashcardDeckStatItem {
  deckId: string;
  deckName: string;
  totalCards: number;
  dueCards: number;
  masteredCards: number;
}

export interface FlashcardStatsView {
  overview: FlashcardStatItem[];
  progress: FlashcardProgressItem[];
  performance: FlashcardStatItem[];
  deckStats: FlashcardDeckStatItem[];
}

export function buildFlashcardStatsView(
  stats: FlashcardStats,
  deckStats: DeckStats[] = [],
): FlashcardStatsView {
  return {
    overview: [
      { label: 'Total Cards', value: stats.totalFlashcards, color: 'indigo' },
      { label: 'Due Today', value: stats.dueFlashcards, color: 'orange' },
      { label: 'Mastered', value: stats.masteredFlashcards, color: 'green' },
      { label: 'Day Streak', value: stats.currentStreak, color: 'red' },
    ],
    progress: [
      { label: 'New Cards', current: stats.newFlashcards, total: stats.totalFlashcards, color: 'bg-blue-500' },
      { label: 'Learning', current: stats.learningFlashcards, total: stats.totalFlashcards, color: 'bg-amber-500' },
      { label: 'Mastered', current: stats.masteredFlashcards, total: stats.totalFlashcards, color: 'bg-emerald-500' },
    ],
    performance: [
      { label: 'Reviews', value: stats.totalReviews, color: 'indigo' },
      { label: 'Accuracy', value: `${stats.averageAccuracy}%`, color: 'emerald' },
      { label: 'Best Streak', value: stats.longestStreak, color: 'indigo' },
      { label: 'Total XP', value: stats.totalXp, color: 'amber' },
    ],
    deckStats: deckStats.map((deck) => ({
      deckId: deck.deckId,
      deckName: deck.deckName,
      totalCards: deck.totalCards,
      dueCards: deck.dueCards,
      masteredCards: deck.masteredCards,
    })),
  };
}
