import { describe, expect, it } from 'vitest';
import {
  buildReviewSessionResponse,
  normalizeCollectionPage,
  normalizeFlashcardStats,
  normalizeQuizSession,
  normalizeWrongAnswers,
} from './normalizers';

describe('api normalizers', () => {
  it('maps keyed collections to paginated items', () => {
    expect(normalizeCollectionPage(
      {
        courses: [{ id: 'course-1' }],
        total: 1,
        page: 2,
        limit: 12,
        totalPages: 3,
      },
      'courses',
    )).toEqual({
      items: [{ id: 'course-1' }],
      total: 1,
      page: 2,
      limit: 12,
      totalPages: 3,
    });
  });

  it('derives frontend-friendly quiz session fields', () => {
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

    expect(result.status).toBe('COMPLETED');
    expect(result.startTime).toBe('2026-04-18T10:00:00.000Z');
    expect(result.endTime).toBe('2026-04-18T10:05:00.000Z');
    expect(result.totalAnswers).toBe(4);
    expect(result.currentQuestionIndex).toBe(3);
  });

  it('unwraps wrong answer payloads', () => {
    expect(normalizeWrongAnswers({
      wrongAnswers: [
        {
          question: 'What is hola?',
          userAnswer: 'Bye',
          correctAnswer: 'Hello',
        },
      ],
      total: 1,
    })).toEqual([
      {
        question: 'What is hola?',
        userAnswer: 'Bye',
        correctAnswer: 'Hello',
      },
    ]);
  });

  it('maps backend flashcard counters to frontend stats', () => {
    expect(normalizeFlashcardStats({
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
    })).toEqual({
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

  it('combines review session and flashcards', () => {
    expect(buildReviewSessionResponse({ id: 'review-1' }, [{ id: 'card-1' }])).toEqual({
      session: { id: 'review-1' },
      flashcards: [{ id: 'card-1' }],
    });
  });
});
