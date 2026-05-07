import assert from 'node:assert/strict';
import test from 'node:test';

import { getQuizSessionQuestionsPath } from '../src/api/quizSessionQuestionsPath.ts';

test('uses session-specific questions endpoint when a session id exists', () => {
  assert.equal(
    getQuizSessionQuestionsPath('quiz-1', 'session-1'),
    '/quizzes/sessions/session-1/questions',
  );
});

test('falls back to quiz questions endpoint before a session exists', () => {
  assert.equal(
    getQuizSessionQuestionsPath('quiz-1'),
    '/quizzes/quiz-1/questions',
  );
});
