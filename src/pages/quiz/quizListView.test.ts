import { describe, expect, it } from 'vitest';
import {
  buildCreateQuizDto,
  buildUpdateQuizDto,
  createDefaultQuizFormState,
  createQuizFormStateFromQuiz,
  extractAvailableTopics,
  getQuizCreateErrorMessage,
  getQuizDeleteErrorMessage,
  getQuizUpdateErrorMessage,
} from './quizListView';

describe('quizListView', () => {
  it('keeps unique non-empty topics in source order', () => {
    expect(extractAvailableTopics([
      { topic: 'Grammar' },
      { topic: 'Vocabulary' },
      { topic: 'Grammar' },
      { topic: null },
      { topic: '' },
      {},
    ])).toEqual(['Grammar', 'Vocabulary']);
  });

  it('builds create DTO with time limit converted to seconds', () => {
    const dto = buildCreateQuizDto({
      ...createDefaultQuizFormState(),
      name: 'Created Quiz',
      timeLimitMinutes: 12,
    });

    expect(dto.timeLimit).toBe(720);
  });

  it('keeps only update-safe fields in update DTO', () => {
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

    expect(dto).toEqual({
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

  it('hydrates edit form from quiz data', () => {
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

    expect(form.timeLimitMinutes).toBe(15);
    expect(form.passingScore).toBe(85);
    expect(form.isPublic).toBe(true);
  });

  it('prefers backend string messages for quiz errors', () => {
    expect(getQuizCreateErrorMessage({ response: { data: { message: 'Quiz name already exists' } } })).toBe('Quiz name already exists');
    expect(getQuizUpdateErrorMessage({ response: { data: { message: 'Cannot update this quiz' } } })).toBe('Cannot update this quiz');
    expect(getQuizDeleteErrorMessage({ response: { data: { message: 'Cannot delete this quiz' } } })).toBe('Cannot delete this quiz');
  });

  it('falls back for unknown create error shapes', () => {
    expect(getQuizCreateErrorMessage(new Error('boom'))).toBe('Failed to create quiz.');
    expect(getQuizCreateErrorMessage(null)).toBe('Failed to create quiz.');
  });
});
