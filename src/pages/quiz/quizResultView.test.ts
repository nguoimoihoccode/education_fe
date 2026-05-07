import { describe, expect, it } from 'vitest';
import { getQuizResultView } from './quizResultView';

describe('quiz result view', () => {
  it('prefers session answer counts over quiz metadata for result summary', () => {
    const result = getQuizResultView(
      {
        correctAnswers: 7,
        totalAnswers: 10,
        passed: true,
        timeSpent: 125,
      },
      {
        questionCount: 12,
        passingScore: 70,
        allowRetry: true,
        maxRetries: 3,
      },
    );

    expect(result.correctCount).toBe(7);
    expect(result.incorrectCount).toBe(3);
    expect(result.totalQuestions).toBe(10);
    expect(result.isPassed).toBe(true);
    expect(result.passThreshold).toBe(70);
    expect(result.canRetry).toBe(true);
    expect(result.certificateUrl).toBeNull();
  });

  it('blocks retry when user retries reach the quiz max', () => {
    const result = getQuizResultView(
      {
        correctAnswers: 2,
        totalAnswers: 5,
        passed: false,
        timeSpent: 60,
        userRetries: 2,
      },
      {
        questionCount: 5,
        passingScore: 80,
        allowRetry: true,
        maxRetries: 2,
        certificateUrl: 'https://example.com/certificate.pdf',
      },
    );

    expect(result.canRetry).toBe(false);
    expect(result.certificateUrl).toBe('https://example.com/certificate.pdf');
  });

  it('falls back to quiz question count when session total answers is missing', () => {
    const result = getQuizResultView(
      {
        correctAnswers: 4,
        passed: false,
        timeSpent: 42,
      },
      {
        questionCount: 6,
        passingScore: 75,
        allowRetry: false,
        maxRetries: 0,
      },
    );

    expect(result.totalQuestions).toBe(6);
    expect(result.incorrectCount).toBe(2);
    expect(result.canRetry).toBe(false);
  });
});
