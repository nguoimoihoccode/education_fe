import assert from 'node:assert/strict';
import test from 'node:test';

import { getQuizSessionView } from '../src/pages/quiz/sessionView.ts';

test('shows the next unanswered question when no feedback is visible', () => {
  const result = getQuizSessionView(
    {
      questionCount: 3,
      questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
    },
    { currentQuestionIndex: 1 },
    false,
  );

  assert.equal(result.totalQuestions, 3);
  assert.equal(result.displayQuestionIndex, 1);
  assert.equal(result.currentQuestion?.id, 'q2');
  assert.equal(result.shouldFinishAfterFeedback, false);
  assert.ok(Math.abs(result.progress - 100 / 3) < 0.000001);
});

test('keeps showing the answered question while feedback is visible', () => {
  const result = getQuizSessionView(
    {
      questionCount: 3,
      questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
    },
    { currentQuestionIndex: 1 },
    true,
  );

  assert.equal(result.displayQuestionIndex, 0);
  assert.equal(result.currentQuestion?.id, 'q1');
  assert.equal(result.shouldFinishAfterFeedback, false);
  assert.ok(Math.abs(result.progress - 100 / 3) < 0.000001);
});

test('marks the quiz ready to finish after the last answered question feedback', () => {
  const result = getQuizSessionView(
    {
      questionCount: 3,
      questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
    },
    { currentQuestionIndex: 3 },
    true,
  );

  assert.equal(result.displayQuestionIndex, 2);
  assert.equal(result.currentQuestion?.id, 'q3');
  assert.equal(result.shouldFinishAfterFeedback, true);
  assert.equal(result.progress, 100);
});

test('falls back to questionCount when questions are not loaded yet', () => {
  const result = getQuizSessionView(
    { questionCount: 5 },
    { currentQuestionIndex: 2 },
    false,
  );

  assert.equal(result.totalQuestions, 5);
  assert.equal(result.displayQuestionIndex, 2);
  assert.equal(result.currentQuestion, null);
  assert.equal(result.progress, 40);
});
