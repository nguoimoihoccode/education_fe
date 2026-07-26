import { describe, expect, it } from 'vitest';
import {
  QUIZ_BATCH_SIZE,
  getBatchRange,
  getQuizBatchView,
  getTotalBatches,
} from './batchView';

describe('quiz batch view', () => {
  it('splits questions into batches of 5 with a short final batch', () => {
    expect(QUIZ_BATCH_SIZE).toBe(5);
    expect(getTotalBatches(12, QUIZ_BATCH_SIZE)).toBe(3);
    expect(getBatchRange(12, 0)).toEqual({ batchStart: 0, batchEnd: 5 });
    expect(getBatchRange(12, 2)).toEqual({ batchStart: 10, batchEnd: 12 });
  });

  it('tracks progress and frontier lock rules', () => {
    const questionIds = Array.from({ length: 10 }, (_, i) => `q${i + 1}`);
    const answers: Record<string, string> = {
      q1: 'A',
      q2: 'B',
      q3: 'C',
      q4: 'D',
      q5: 'E',
    };

    const frontier = getQuizBatchView({
      totalQuestions: 10,
      batchIndex: 0,
      questionIndexInBatch: 1,
      maxReachedBatchIndex: 0,
      answers,
      questionIds,
    });

    expect(frontier.totalBatches).toBe(2);
    expect(frontier.batchLength).toBe(5);
    expect(frontier.globalQuestionIndex).toBe(1);
    expect(frontier.isCurrentBatchComplete).toBe(true);
    expect(frontier.canGoNextBatch).toBe(true);
    expect(frontier.isEditable).toBe(true);
    expect(frontier.answeredCount).toBe(5);
    expect(frontier.progressPercent).toBe(50);

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
    const questionIds = Array.from({ length: 7 }, (_, i) => `q${i + 1}`);
    const partial = getQuizBatchView({
      totalQuestions: 7,
      batchIndex: 1,
      questionIndexInBatch: 0,
      maxReachedBatchIndex: 1,
      answers: { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'E' },
      questionIds,
    });

    expect(partial.isLastBatch).toBe(true);
    expect(partial.batchLength).toBe(2);
    expect(partial.canSubmitQuiz).toBe(false);

    const complete = getQuizBatchView({
      totalQuestions: 7,
      batchIndex: 1,
      questionIndexInBatch: 0,
      maxReachedBatchIndex: 1,
      answers: { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'E', q6: 'F', q7: 'G' },
      questionIds,
    });

    expect(complete.isQuizComplete).toBe(true);
    expect(complete.canSubmitQuiz).toBe(true);
  });
});
