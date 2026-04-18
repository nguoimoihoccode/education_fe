import type { QuizQuestion } from '@/types/quiz.types';

interface QuizLike {
  questionCount?: number;
  questions?: QuizQuestion[];
}

interface SessionLike {
  currentQuestionIndex?: number;
}

export function getQuizSessionView(
  quiz: QuizLike,
  session: SessionLike,
  hasFeedback: boolean,
): {
  totalQuestions: number;
  displayQuestionIndex: number;
  currentQuestion: QuizQuestion | null;
  shouldFinishAfterFeedback: boolean;
  progress: number;
} {
  const totalQuestions = Math.max(
    0,
    Array.isArray(quiz.questions) && quiz.questions.length > 0
      ? quiz.questions.length
      : quiz.questionCount ?? 0,
  );
  const answeredCount = Math.max(0, session.currentQuestionIndex ?? 0);
  const shouldFinishAfterFeedback = hasFeedback && answeredCount >= totalQuestions;
  const displayQuestionIndex = totalQuestions === 0
    ? 0
    : clampIndex(hasFeedback ? answeredCount - 1 : answeredCount, totalQuestions - 1);
  const progress = totalQuestions > 0
    ? Math.min(100, (answeredCount / totalQuestions) * 100)
    : 0;

  return {
    totalQuestions,
    displayQuestionIndex,
    currentQuestion: quiz.questions?.[displayQuestionIndex] ?? null,
    shouldFinishAfterFeedback,
    progress,
  };
}

function clampIndex(index: number, max: number): number {
  if (max <= 0) return 0;
  if (index < 0) return 0;
  if (index > max) return max;
  return index;
}
