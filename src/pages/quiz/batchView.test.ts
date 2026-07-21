import { describe, expect, it } from 'vitest';
import {
  QUIZ_BATCH_SIZE,
  getBatchRange,
  getQuizBatchView,
  getTotalBatches,
} from './batchView';

describe('quiz batch view', () => {
  it('splits questions into batches of 3 with a short final batch', () => {
    expect(getTotalBatches(10, QUIZ_BATCH_SIZE)).toBe(4);
    expect(getBatchRange(10, 0)).toEqual({ batchStart: 0, batchEnd: 3 });
    expect(getBatchRange(10, 3)).toEqual({ batchStart: 9, batchEnd: 10 });
  });

  it('tracks progress and frontier lock rules', () => {
    const questionIds = Array.from({ length: 10 }, (_, i) => `q${i + 1}`);
    const answers: Record<string, string> = {
      q1: 'A',
      q2: 'B',
      q3: 'C',
    };

    const frontier = getQuizBatchView({
      totalQuestions: 10,
      batchIndex: 0,
      questionIndexInBatch: 1,
      maxReachedBatchIndex: 0,
      answers,
      questionIds,
    });

    expect(frontier.totalBatches).toBe(4);
    expect(frontier.batchLength).toBe(3);
    expect(frontier.globalQuestionIndex).toBe(1);
    expect(frontier.isCurrentBatchComplete).toBe(true);
    expect(frontier.canGoNextBatch).toBe(true);
    expect(frontier.isEditable).toBe(true);
    expect(frontier.answeredCount).toBe(3);
    expect(frontier.progressPercent).toBe(30);

    const past = getQuizBatchView({
      totalQuestions: 10,
      batchIndex: 0,
      questionIndexInBatch: 0,
      maxReachedBatchIndex: 1,
      answers,
      questionIds,
    });

    expect(past.isEditable).toBe(false);
    expect(past.canGoNextBatch).toBe(false);
    expect(past.canGoPrevBatch).toBe(false);
  });

  it('enables submit only on last complete frontier batch', () => {
    const questionIds = Array.from({ length: 4 }, (_, i) => `q${i + 1}`);
    const partial = getQuizBatchView({
      totalQuestions: 4,
      batchIndex: 1,
      questionIndexInBatch: 0,
      maxReachedBatchIndex: 1,
      answers: { q1: 'A', q2: 'B', q3: 'C' },
      questionIds,
    });

    expect(partial.isLastBatch).toBe(true);
    expect(partial.batchLength).toBe(1);
    expect(partial.canSubmitQuiz).toBe(false);

    const complete = getQuizBatchView({
      totalQuestions: 4,
      batchIndex: 1,
      questionIndexInBatch: 0,
      maxReachedBatchIndex: 1,
      answers: { q1: 'A', q2: 'B', q3: 'C', q4: 'D' },
      questionIds,
    });

    expect(complete.isQuizComplete).toBe(true);
    expect(complete.canSubmitQuiz).toBe(true);
  });
});
