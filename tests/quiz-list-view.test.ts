import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCreateQuizDto,
  buildUpdateQuizDto,
  createDefaultQuizFormState,
  createQuizFormStateFromQuiz,
  extractAvailableTopics,
  getQuizDeleteErrorMessage,
  getQuizCreateErrorMessage,
  getQuizUpdateErrorMessage,
} from '../src/pages/quiz/quizListView.ts';

test('extractAvailableTopics keeps unique non-empty topics in source order', () => {
  const result = extractAvailableTopics([
    { topic: 'Grammar' },
    { topic: 'Vocabulary' },
    { topic: 'Grammar' },
    { topic: null },
    { topic: '' },
    {},
  ]);

  assert.deepEqual(result, ['Grammar', 'Vocabulary']);
});

test('getQuizCreateErrorMessage prefers backend string message', () => {
  const result = getQuizCreateErrorMessage({
    response: { data: { message: 'Quiz name already exists' } },
  });

  assert.equal(result, 'Quiz name already exists');
});

test('getQuizCreateErrorMessage falls back for unknown error shapes', () => {
  assert.equal(getQuizCreateErrorMessage(new Error('boom')), 'Failed to create quiz.');
  assert.equal(getQuizCreateErrorMessage(null), 'Failed to create quiz.');
});

test('buildUpdateQuizDto keeps only update-safe fields', () => {
  const dto = buildUpdateQuizDto({
    ...createDefaultQuizFormState(),
    name: 'Edited quiz',
    description: 'Updated description',
    topic: 'Grammar',
    difficulty: 'HARD',
    questionType: 'TRUE_FALSE',
    isPublic: true,
    shuffleQuestions: false,
    shuffleAnswers: true,
    showCorrectAnswer: false,
    allowRetry: true,
    maxRetries: 2,
    questionCount: 25,
    timeLimitMinutes: 20,
    passingScore: 80,
  });

  assert.deepEqual(dto, {
    name: 'Edited quiz',
    description: 'Updated description',
    topic: 'Grammar',
    difficulty: 'HARD',
    questionType: 'TRUE_FALSE',
    isPublic: true,
    shuffleQuestions: false,
    shuffleAnswers: true,
    showCorrectAnswer: false,
    allowRetry: true,
    maxRetries: 2,
  });
});

test('getQuizDeleteErrorMessage prefers backend string message', () => {
  const result = getQuizDeleteErrorMessage({
    response: { data: { message: 'Cannot delete this quiz' } },
  });

  assert.equal(result, 'Cannot delete this quiz');
});

test('createQuizFormStateFromQuiz hydrates edit form from quiz data', () => {
  const form = createQuizFormStateFromQuiz({
    id: 'quiz-1',
    name: 'Sample Quiz',
    description: 'Desc',
    topic: 'Vocabulary',
    questionType: 'MULTIPLE_CHOICE',
    questionCount: 12,
    timeLimit: 900,
    passingScore: 85,
    difficulty: 'EASY',
    isPublic: true,
    shuffleQuestions: false,
    shuffleAnswers: true,
    showCorrectAnswer: false,
    allowRetry: true,
    maxRetries: 3,
    userId: 1,
    createdAt: '2026-04-18T00:00:00.000Z',
    updatedAt: '2026-04-18T00:00:00.000Z',
  });

  assert.equal(form.timeLimitMinutes, 15);
  assert.equal(form.passingScore, 85);
  assert.equal(form.isPublic, true);
});

test('buildCreateQuizDto converts minutes to seconds', () => {
  const dto = buildCreateQuizDto({
    ...createDefaultQuizFormState(),
    name: 'Created Quiz',
    timeLimitMinutes: 12,
  });

  assert.equal(dto.timeLimit, 720);
});

test('getQuizUpdateErrorMessage prefers backend string message', () => {
  const result = getQuizUpdateErrorMessage({
    response: { data: { message: 'Cannot update this quiz' } },
  });

  assert.equal(result, 'Cannot update this quiz');
});
