import assert from 'node:assert/strict';
import test from 'node:test';

import { buildFlashcardStatsView } from '../src/components/flashcard/flashcardStatsView.ts';

test('buildFlashcardStatsView uses backend accuracy and hides unsupported metrics', () => {
  const view = buildFlashcardStatsView({
    totalDecks: 0,
    totalFlashcards: 120,
    dueFlashcards: 18,
    masteredFlashcards: 40,
    learningFlashcards: 50,
    newFlashcards: 30,
    totalReviews: 250,
    averageAccuracy: 82,
    currentStreak: 0,
    longestStreak: 0,
    totalXp: 0,
  });

  assert.equal(view.overview.length, 4);
  assert.equal(view.performance.length, 4);
  assert.equal(view.performance[1]?.value, '82%');
  assert.equal(view.progress.length, 3);
  assert.equal(view.progress.some((item) => item.label === 'Reviewing'), false);
});

test('buildFlashcardStatsView removes deck accuracy from rendered deck stats', () => {
  const view = buildFlashcardStatsView(
    {
      totalDecks: 0,
      totalFlashcards: 10,
      dueFlashcards: 2,
      masteredFlashcards: 4,
      learningFlashcards: 3,
      newFlashcards: 3,
      totalReviews: 20,
      averageAccuracy: 70,
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
    },
    [
      {
        deckId: 'deck-1',
        deckName: 'Deck 1',
        totalCards: 10,
        dueCards: 2,
        masteredCards: 4,
        learningCards: 3,
        newCards: 3,
        totalReviews: 0,
        averageAccuracy: 0,
        lastReviewed: null,
      },
    ],
  );

  assert.deepEqual(view.deckStats, [
    {
      deckId: 'deck-1',
      deckName: 'Deck 1',
      totalCards: 10,
      dueCards: 2,
      masteredCards: 4,
    },
  ]);
});

test('buildFlashcardStatsView restores real streak and xp metrics only', () => {
  const view = buildFlashcardStatsView({
    totalDecks: 0,
    totalFlashcards: 120,
    dueFlashcards: 18,
    masteredFlashcards: 40,
    learningFlashcards: 50,
    newFlashcards: 30,
    totalReviews: 250,
    averageAccuracy: 82,
    currentStreak: 7,
    longestStreak: 14,
    totalXp: 880,
  });

  assert.deepEqual(view.overview, [
    { label: 'Total Cards', value: 120, color: 'indigo' },
    { label: 'Due Today', value: 18, color: 'orange' },
    { label: 'Mastered', value: 40, color: 'green' },
    { label: 'Day Streak', value: 7, color: 'red' },
  ]);

  assert.deepEqual(view.performance, [
    { label: 'Reviews', value: 250, color: 'indigo' },
    { label: 'Accuracy', value: '82%', color: 'emerald' },
    { label: 'Best Streak', value: 14, color: 'indigo' },
    { label: 'Total XP', value: 880, color: 'amber' },
  ]);
});
