interface ResultSessionLike {
  correctAnswers?: number;
  totalAnswers?: number;
  passed?: boolean;
  timeSpent?: number;
  userRetries?: number;
}

interface ResultQuizLike {
  questionCount?: number;
  passingScore?: number;
  allowRetry?: boolean;
  maxRetries?: number;
  certificateUrl?: string | null;
}

export function getQuizResultView(
  session: ResultSessionLike,
  quiz: ResultQuizLike,
): {
  isPassed: boolean;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  passThreshold: number;
  canRetry: boolean;
  certificateUrl: string | null;
} {
  const totalQuestions = Math.max(
    0,
    typeof session.totalAnswers === 'number' ? session.totalAnswers : quiz.questionCount ?? 0,
  );
  const correctCount = Math.max(0, session.correctAnswers ?? 0);
  const incorrectCount = Math.max(0, totalQuestions - correctCount);
  const userRetries = Math.max(0, session.userRetries ?? 0);
  const maxRetries = Math.max(0, quiz.maxRetries ?? 0);

  return {
    isPassed: Boolean(session.passed),
    totalQuestions,
    correctCount,
    incorrectCount,
    passThreshold: quiz.passingScore ?? 0,
    canRetry: Boolean(quiz.allowRetry) && userRetries < maxRetries,
    certificateUrl: quiz.certificateUrl ?? null,
  };
}
