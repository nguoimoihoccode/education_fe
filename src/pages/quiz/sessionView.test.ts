import { describe, expect, it } from 'vitest';
import { getQuizSessionView } from './sessionView';
import type { QuizQuestion } from '@/types/quiz.types';

const question = (id: string): QuizQuestion => ({
  id,
  question: `Question ${id}`,
  type: 'MULTIPLE_CHOICE',
  options: ['A', 'B'],
  correctAnswer: 'A',
  explanation: null,
  points: 1,
  flashcardId: null,
  quizId: 'quiz-1',
  createdAt: '2026-04-18T00:00:00.000Z',
  updatedAt: '2026-04-18T00:00:00.000Z',
});

describe('quiz session view', () => {
  it('shows the next unanswered question when no feedback is visible', () => {
    const result = getQuizSessionView(
      {
        questionCount: 3,
        questions: [question('q1'), question('q2'), question('q3')],
      },
      { currentQuestionIndex: 1 },
      false,
    );

    expect(result.totalQuestions).toBe(3);
    expect(result.displayQuestionIndex).toBe(1);
    expect(result.currentQuestion?.id).toBe('q2');
    expect(result.shouldFinishAfterFeedback).toBe(false);
    expect(result.progress).toBeCloseTo(100 / 3);
  });

  it('keeps showing the answered question while feedback is visible', () => {
    const result = getQuizSessionView(
      {
        questionCount: 3,
        questions: [question('q1'), question('q2'), question('q3')],
      },
      { currentQuestionIndex: 1 },
      true,
    );

    expect(result.displayQuestionIndex).toBe(0);
    expect(result.currentQuestion?.id).toBe('q1');
    expect(result.shouldFinishAfterFeedback).toBe(false);
    expect(result.progress).toBeCloseTo(100 / 3);
  });

  it('marks the quiz ready to finish after the last answered question feedback', () => {
    const result = getQuizSessionView(
      {
        questionCount: 3,
        questions: [question('q1'), question('q2'), question('q3')],
      },
      { currentQuestionIndex: 3 },
      true,
    );

    expect(result.displayQuestionIndex).toBe(2);
    expect(result.currentQuestion?.id).toBe('q3');
    expect(result.shouldFinishAfterFeedback).toBe(true);
    expect(result.progress).toBe(100);
  });

  it('falls back to questionCount when questions are not loaded yet', () => {
    const result = getQuizSessionView(
      { questionCount: 5 },
      { currentQuestionIndex: 2 },
      false,
    );

    expect(result.totalQuestions).toBe(5);
    expect(result.displayQuestionIndex).toBe(2);
    expect(result.currentQuestion).toBeNull();
    expect(result.progress).toBe(40);
  });
});
