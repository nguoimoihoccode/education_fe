export function normalizeCollectionPage<T>(
  payload: Record<string, unknown>,
  collectionKey: string,
): {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const collection = payload[collectionKey];

  return {
    items: Array.isArray(collection) ? (collection as T[]) : [],
    total: typeof payload.total === 'number' ? payload.total : 0,
    page: typeof payload.page === 'number' ? payload.page : 1,
    limit: typeof payload.limit === 'number' ? payload.limit : 0,
    totalPages: typeof payload.totalPages === 'number' ? payload.totalPages : 1,
  };
}

export function normalizeQuizSession<T extends Record<string, unknown>>(
  payload: T,
): T & {
  status: 'IN_PROGRESS' | 'COMPLETED';
  startTime: unknown;
  endTime: unknown;
  totalAnswers: number;
  currentQuestionIndex: number;
} {
  const correctAnswers = toNumber(payload.correctAnswers);
  const wrongAnswers = toNumber(payload.wrongAnswers);
  const skippedAnswers = toNumber(payload.skippedAnswers);
  const answers = Array.isArray(payload.answers) ? payload.answers.length : 0;

  return {
    ...payload,
    status: payload.completed ? 'COMPLETED' : 'IN_PROGRESS',
    startTime: payload.startedAt,
    endTime: payload.completedAt,
    totalAnswers: correctAnswers + wrongAnswers + skippedAnswers,
    currentQuestionIndex: answers,
  };
}

export interface QuizSessionLike {
  completed?: boolean;
  startedAt?: unknown;
  completedAt?: unknown;
  correctAnswers?: number;
  wrongAnswers?: number;
  skippedAnswers?: number;
  answers?: unknown[];
}

export function normalizeQuizSessionObject<T extends QuizSessionLike>(
  payload: T,
): T & {
  status: 'IN_PROGRESS' | 'COMPLETED';
  startTime: unknown;
  endTime: unknown;
  totalAnswers: number;
  currentQuestionIndex: number;
} {
  return normalizeQuizSession(payload as Record<string, unknown>) as T & {
    status: 'IN_PROGRESS' | 'COMPLETED';
    startTime: unknown;
    endTime: unknown;
    totalAnswers: number;
    currentQuestionIndex: number;
  };
}

export function normalizeWrongAnswers<T>(payload: T): T extends unknown[] ? T : T[] {
  if (Array.isArray(payload)) {
    return payload as T extends unknown[] ? T : T[];
  }

  if (payload && typeof payload === 'object' && 'wrongAnswers' in payload) {
    const wrongAnswers = (payload as { wrongAnswers?: unknown }).wrongAnswers;
    return (Array.isArray(wrongAnswers) ? wrongAnswers : []) as T extends unknown[]
      ? T
      : T[];
  }

  return [] as T extends unknown[] ? T : T[];
}

export function normalizeFlashcardStats<T extends Record<string, unknown>>(
  payload: T,
): {
  totalFlashcards: number;
  totalDecks: number;
  dueFlashcards: number;
  masteredFlashcards: number;
  learningFlashcards: number;
  newFlashcards: number;
  totalReviews: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
} {
  const statusStats =
    payload.statusStats && typeof payload.statusStats === 'object'
      ? (payload.statusStats as Record<string, number>)
      : {};

  return {
    totalFlashcards: toNumber(payload.totalFlashcards),
    totalDecks: toNumber(payload.totalDecks),
    dueFlashcards: toNumber(payload.dueFlashcards ?? payload.dueCount),
    masteredFlashcards: toNumber(
      payload.masteredFlashcards ?? statusStats.MASTERED,
    ),
    learningFlashcards: toNumber(
      payload.learningFlashcards ?? statusStats.LEARNING,
    ),
    newFlashcards: toNumber(payload.newFlashcards ?? statusStats.NEW),
    totalReviews: toNumber(payload.totalReviews),
    averageAccuracy: Math.round(
      typeof payload.averageAccuracy === 'number'
        ? payload.averageAccuracy
        : toNumber(payload.correctRate) * 100,
    ),
    currentStreak: toNumber(payload.currentStreak),
    longestStreak: toNumber(payload.longestStreak),
    totalXp: toNumber(payload.totalXp),
  };
}

export function buildReviewSessionResponse<TSession, TFlashcard>(
  session: TSession,
  flashcards: TFlashcard[],
): { session: TSession; flashcards: TFlashcard[] } {
  return {
    session,
    flashcards,
  };
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
