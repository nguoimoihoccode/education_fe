import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildReviewSessionResponse,
  normalizeCollectionPage,
  normalizeFlashcardStats,
  normalizeQuizSession,
  normalizeWrongAnswers,
} from '../src/api/normalizers.ts';

test('normalizeCollectionPage maps keyed collections to items', () => {
  const result = normalizeCollectionPage(
    {
      courses: [{ id: 'course-1' }],
      total: 1,
      page: 2,
      limit: 12,
      totalPages: 3,
    },
    'courses',
  );

  assert.deepEqual(result, {
    items: [{ id: 'course-1' }],
    total: 1,
    page: 2,
    limit: 12,
    totalPages: 3,
  });
});

test('normalizeQuizSession derives frontend-friendly fields', () => {
  const result = normalizeQuizSession({
    id: 'session-1',
    quizId: 'quiz-1',
    correctAnswers: 2,
    wrongAnswers: 1,
    skippedAnswers: 1,
    completed: true,
    startedAt: '2026-04-18T10:00:00.000Z',
    completedAt: '2026-04-18T10:05:00.000Z',
    answers: [{}, {}, {}],
  });

  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.startTime, '2026-04-18T10:00:00.000Z');
  assert.equal(result.endTime, '2026-04-18T10:05:00.000Z');
  assert.equal(result.totalAnswers, 4);
  assert.equal(result.currentQuestionIndex, 3);
});

test('normalizeWrongAnswers unwraps backend payloads', () => {
  const result = normalizeWrongAnswers({
    wrongAnswers: [
      {
        question: 'What is hola?',
        userAnswer: 'Bye',
        correctAnswer: 'Hello',
      },
    ],
    total: 1,
  });

  assert.deepEqual(result, [
    {
      question: 'What is hola?',
      userAnswer: 'Bye',
      correctAnswer: 'Hello',
    },
  ]);
});

test('normalizeFlashcardStats maps backend counters to frontend stats', () => {
  const result = normalizeFlashcardStats({
    totalFlashcards: 20,
    statusStats: {
      NEW: 5,
      LEARNING: 6,
      REVIEWING: 7,
      MASTERED: 2,
    },
    dueCount: 4,
    totalReviews: 10,
    correctRate: 0.75,
  });

  assert.deepEqual(result, {
    totalDecks: 0,
    totalFlashcards: 20,
    dueFlashcards: 4,
    masteredFlashcards: 2,
    learningFlashcards: 6,
    newFlashcards: 5,
    totalReviews: 10,
    averageAccuracy: 75,
    currentStreak: 0,
    longestStreak: 0,
    totalXp: 0,
  });
});

test('buildReviewSessionResponse combines session and flashcards', () => {
  const result = buildReviewSessionResponse({ id: 'review-1' }, [{ id: 'card-1' }]);

  assert.deepEqual(result, {
    session: { id: 'review-1' },
    flashcards: [{ id: 'card-1' }],
  });
});
