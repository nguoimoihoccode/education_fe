export const QUIZ_BATCH_SIZE = 3;

export interface QuizBatchViewInput {
  totalQuestions: number;
  batchSize?: number;
  batchIndex: number;
  questionIndexInBatch: number;
  maxReachedBatchIndex: number;
  answers: Record<string, string>;
  questionIds: string[];
}

export interface QuizBatchView {
  batchSize: number;
  totalQuestions: number;
  totalBatches: number;
  batchIndex: number;
  batchStart: number;
  batchEnd: number;
  batchLength: number;
  questionIndexInBatch: number;
  globalQuestionIndex: number;
  isLastBatch: boolean;
  isEditable: boolean;
  answeredCount: number;
  progressPercent: number;
  batchQuestionIds: string[];
  isCurrentBatchComplete: boolean;
  isQuizComplete: boolean;
  canGoPrevBatch: boolean;
  canGoNextBatch: boolean;
  canGoPrevQuestion: boolean;
  canGoNextQuestion: boolean;
  canSubmitQuiz: boolean;
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

export function getTotalBatches(totalQuestions: number, batchSize = QUIZ_BATCH_SIZE): number {
  if (totalQuestions <= 0) return 0;
  return Math.ceil(totalQuestions / batchSize);
}

export function getBatchRange(
  totalQuestions: number,
  batchIndex: number,
  batchSize = QUIZ_BATCH_SIZE,
): { batchStart: number; batchEnd: number } {
  const totalBatches = getTotalBatches(totalQuestions, batchSize);
  if (totalBatches === 0) {
    return { batchStart: 0, batchEnd: 0 };
  }

  const safeBatchIndex = clamp(batchIndex, 0, totalBatches - 1);
  const batchStart = safeBatchIndex * batchSize;
  const batchEnd = Math.min(batchStart + batchSize, totalQuestions);
  return { batchStart, batchEnd };
}

export function isAnswered(answer: string | undefined): boolean {
  return typeof answer === 'string' && answer.trim().length > 0;
}

export function getQuizBatchView(input: QuizBatchViewInput): QuizBatchView {
  const batchSize = input.batchSize ?? QUIZ_BATCH_SIZE;
  const totalQuestions = Math.max(0, input.totalQuestions);
  const totalBatches = getTotalBatches(totalQuestions, batchSize);
  const batchIndex = totalBatches === 0 ? 0 : clamp(input.batchIndex, 0, totalBatches - 1);
  const maxReachedBatchIndex =
    totalBatches === 0 ? 0 : clamp(input.maxReachedBatchIndex, 0, totalBatches - 1);

  const { batchStart, batchEnd } = getBatchRange(totalQuestions, batchIndex, batchSize);
  const batchLength = Math.max(0, batchEnd - batchStart);
  const questionIndexInBatch =
    batchLength === 0 ? 0 : clamp(input.questionIndexInBatch, 0, batchLength - 1);
  const globalQuestionIndex = batchStart + questionIndexInBatch;

  const batchQuestionIds = input.questionIds.slice(batchStart, batchEnd);
  const answeredCount = input.questionIds.filter((id) => isAnswered(input.answers[id])).length;
  const isCurrentBatchComplete =
    batchQuestionIds.length > 0 &&
    batchQuestionIds.every((id) => isAnswered(input.answers[id]));
  const isQuizComplete =
    totalQuestions > 0 &&
    input.questionIds.length === totalQuestions &&
    input.questionIds.every((id) => isAnswered(input.answers[id]));

  const isLastBatch = totalBatches > 0 && batchIndex === totalBatches - 1;
  const isEditable = batchIndex === maxReachedBatchIndex;
  const viewingFrontier = batchIndex === maxReachedBatchIndex;

  return {
    batchSize,
    totalQuestions,
    totalBatches,
    batchIndex,
    batchStart,
    batchEnd,
    batchLength,
    questionIndexInBatch,
    globalQuestionIndex,
    isLastBatch,
    isEditable,
    answeredCount,
    progressPercent: totalQuestions > 0 ? Math.min(100, (answeredCount / totalQuestions) * 100) : 0,
    batchQuestionIds,
    isCurrentBatchComplete,
    isQuizComplete,
    canGoPrevBatch: batchIndex > 0,
    canGoNextBatch:
      viewingFrontier &&
      !isLastBatch &&
      isCurrentBatchComplete &&
      maxReachedBatchIndex === batchIndex,
    canGoPrevQuestion: questionIndexInBatch > 0,
    canGoNextQuestion: questionIndexInBatch < batchLength - 1,
    canSubmitQuiz: isLastBatch && isQuizComplete && viewingFrontier,
  };
}
