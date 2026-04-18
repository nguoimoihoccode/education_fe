import assert from 'node:assert/strict';
import test from 'node:test';

import { getQuizResultView } from '../src/pages/quiz/quizResultView.ts';

test('prefers session answer counts over quiz metadata for result summary', () => {
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

  assert.equal(result.correctCount, 7);
  assert.equal(result.incorrectCount, 3);
  assert.equal(result.totalQuestions, 10);
  assert.equal(result.isPassed, true);
  assert.equal(result.passThreshold, 70);
  assert.equal(result.canRetry, true);
  assert.equal(result.certificateUrl, null);
});

test('blocks retry when user retries reach the quiz max', () => {
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

  assert.equal(result.canRetry, false);
  assert.equal(result.certificateUrl, 'https://example.com/certificate.pdf');
});

test('falls back to quiz question count when session total answers is missing', () => {
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

  assert.equal(result.totalQuestions, 6);
  assert.equal(result.incorrectCount, 2);
  assert.equal(result.canRetry, false);
});
