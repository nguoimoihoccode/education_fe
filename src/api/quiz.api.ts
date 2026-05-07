import { apiClient, CACHE_PROFILES } from './client';
import { getQuizSessionQuestionsPath } from './quizSessionQuestionsPath';
import {
  normalizeCollectionPage,
  normalizeQuizSessionObject,
  normalizeWrongAnswers,
} from './normalizers';
import { createQuizOfflineProvider } from '@/mocks/quizOffline';
import type {
  Quiz,
  QuizQuestion,
  QuizSession,
  QuizStats,
  TopicStats,
  QuizHistoryItem,
  WrongAnswer,
  LeaderboardEntry,
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuizQuestionDto,
  BulkCreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  StartQuizSessionDto,
  GenerateQuizFromFlashcardsDto,
  PaginatedQuizResponse,
  PaginatedQuizSessionResponse,
  PaginatedQuizHistoryResponse,
  PaginatedLeaderboardResponse,
  SubmitAnswerResult,
} from '@/types/quiz.types';

const quizOfflineMode = import.meta.env.VITE_QUIZ_OFFLINE_MODE === 'true';
const offlineQuizProvider = createQuizOfflineProvider();

// ==================== QUIZ MANAGEMENT ====================

export const getQuizzes = async (params?: {
  topic?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedQuizResponse> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.getQuizzes();
  }
  const response = await apiClient.get('/quizzes', { params, ...CACHE_PROFILES.DYNAMIC });
  return normalizeCollectionPage<Quiz>(response.data, 'quizzes');
};

export const getPublicQuizzes = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedQuizResponse> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.getQuizzes();
  }
  const response = await apiClient.get('/quizzes/public', { params, ...CACHE_PROFILES.DYNAMIC });
  return normalizeCollectionPage<Quiz>(response.data, 'quizzes');
};

export const getQuizById = async (id: string): Promise<Quiz> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.getQuizById(id);
  }
  const [quizResponse, questions] = await Promise.all([
    apiClient.get(`/quizzes/${id}`, CACHE_PROFILES.DYNAMIC),
    getQuizQuestions(id),
  ]);

  return {
    ...quizResponse.data,
    questions,
  };
};

export const createQuiz = async (dto: CreateQuizDto): Promise<Quiz> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.createQuiz(dto);
  }
  const response = await apiClient.post('/quizzes', dto);
  return response.data;
};

export const updateQuiz = async (id: string, dto: UpdateQuizDto): Promise<Quiz> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.updateQuiz(id, dto);
  }
  const response = await apiClient.patch(`/quizzes/${id}`, dto);
  return response.data;
};

export const deleteQuiz = async (id: string): Promise<void> => {
  if (quizOfflineMode) {
    await offlineQuizProvider.deleteQuiz(id);
    return;
  }
  await apiClient.delete(`/quizzes/${id}`);
};

// ==================== QUESTION MANAGEMENT ====================

export const getQuizQuestions = async (quizId: string): Promise<QuizQuestion[]> => {
  if (quizOfflineMode) {
    const quiz = await offlineQuizProvider.getQuizById(quizId);
    return quiz.questions ?? [];
  }
  const response = await apiClient.get(`/quizzes/${quizId}/questions`, CACHE_PROFILES.DYNAMIC);
  return Array.isArray(response.data?.questions)
    ? response.data.questions
    : Array.isArray(response.data)
      ? response.data
      : [];
};

export const getQuizSessionQuestions = async (
  quizId: string,
  sessionId?: string,
): Promise<QuizQuestion[]> => {
  if (quizOfflineMode && sessionId) {
    return offlineQuizProvider.getSessionQuestions(sessionId);
  }

  const response = await apiClient.get(
    getQuizSessionQuestionsPath(quizId, sessionId),
    sessionId ? CACHE_PROFILES.NO_CACHE : CACHE_PROFILES.DYNAMIC,
  );

  return Array.isArray(response.data?.questions)
    ? response.data.questions
    : Array.isArray(response.data)
      ? response.data
      : [];
};

export const createQuizQuestion = async (
  quizId: string,
  dto: CreateQuizQuestionDto
): Promise<QuizQuestion> => {
  const response = await apiClient.post(`/quizzes/${quizId}/questions`, dto);
  return response.data;
};

export const bulkCreateQuizQuestions = async (
  quizId: string,
  dto: BulkCreateQuizQuestionDto
): Promise<QuizQuestion[]> => {
  const response = await apiClient.post(`/quizzes/${quizId}/questions/bulk`, dto);
  return Array.isArray(response.data?.created) ? response.data.created : [];
};

export const updateQuizQuestion = async (
  questionId: string,
  dto: UpdateQuizQuestionDto
): Promise<QuizQuestion> => {
  const response = await apiClient.patch(`/quizzes/questions/${questionId}`, dto);
  return response.data;
};

export const deleteQuizQuestion = async (questionId: string): Promise<void> => {
  await apiClient.delete(`/quizzes/questions/${questionId}`);
};

// ==================== QUIZ GENERATION ====================

export const generateQuizFromFlashcards = async (
  dto: GenerateQuizFromFlashcardsDto
): Promise<Quiz> => {
  const response = await apiClient.post('/quizzes/generate', dto);
  return response.data;
};

// ==================== QUIZ SESSIONS ====================

export const startQuizSession = async (
  quizId: string,
  dto?: StartQuizSessionDto
): Promise<QuizSession> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.startQuizSession(quizId, dto as {
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      questionCount?: 10 | 20 | 30;
    });
  }
  const response = await apiClient.post(`/quizzes/${quizId}/start`, dto);
  return normalizeQuizSessionObject(response.data as QuizSession);
};

export const submitQuizAnswer = async (
  sessionId: string,
  answerData: {
    questionId: string;
    answer: string;
    timeSpent?: number;
  }
): Promise<SubmitAnswerResult> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.submitQuizAnswer(sessionId, answerData);
  }
  const response = await apiClient.post(`/quizzes/sessions/${sessionId}/answer`, answerData);
  return response.data;
};

export const completeQuizSession = async (sessionId: string): Promise<QuizSession> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.completeQuizSession(sessionId);
  }
  const response = await apiClient.post(`/quizzes/sessions/${sessionId}/complete`);
  return normalizeQuizSessionObject(response.data as QuizSession);
};

export const getQuizSession = async (sessionId: string): Promise<QuizSession> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.getQuizSession(sessionId);
  }
  const response = await apiClient.get(`/quizzes/sessions/${sessionId}`, CACHE_PROFILES.NO_CACHE);
  return normalizeQuizSessionObject(response.data as QuizSession);
};

export const getQuizSessions = async (
  quizId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedQuizSessionResponse> => {
  const response = await apiClient.get(`/quizzes/${quizId}/sessions`, { params, ...CACHE_PROFILES.DYNAMIC });
  const normalized = normalizeCollectionPage<QuizSession>(response.data, 'sessions');
  return {
    ...normalized,
    items: normalized.items.map((session) => normalizeQuizSessionObject(session)),
  };
};

export const getAllQuizSessions = async (params?: { page?: number; limit?: number }): Promise<PaginatedQuizSessionResponse> => {
  const response = await apiClient.get('/quizzes/sessions', { params, ...CACHE_PROFILES.DYNAMIC });
  const normalized = normalizeCollectionPage<QuizSession>(response.data, 'sessions');
  return {
    ...normalized,
    items: normalized.items.map((session) => normalizeQuizSessionObject(session)),
  };
};

// ==================== STATISTICS & HISTORY ====================

export const getQuizStats = async (): Promise<QuizStats> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.getQuizStats();
  }
  const response = await apiClient.get('/quizzes/stats', CACHE_PROFILES.USER);
  const data = response.data;

  return {
    totalQuizzes: data?.totalQuizzes ?? 0,
    totalAttempts: data?.totalSessions ?? 0,
    averageScore: data?.averageScore ?? 0,
    highestScore: 0,
    lowestScore: 0,
    averageTimePerQuestion: 0,
    watchedTopics: [],
    completedQuizzes: data?.totalSessions ?? 0,
    passedQuizzes:
      typeof data?.passRate === 'number' && typeof data?.totalSessions === 'number'
        ? Math.round((data.totalSessions * data.passRate) / 100)
        : 0,
  };
};

export const getQuizStatsByTopic = async (topic: string): Promise<TopicStats> => {
  const response = await apiClient.get(`/quizzes/stats/topic/${topic}`, CACHE_PROFILES.USER);
  const data = response.data;

  return {
    topic: data?.topic ?? topic,
    totalAttempts: data?.totalSessions ?? 0,
    averageScore: data?.averageScore ?? 0,
    highestScore: 0,
    lowestScore: 0,
    favoriteQuestionTypes: [],
    strengths: [],
    weaknesses: [],
  };
};

export const getQuizHistory = async (params?: { page?: number; limit?: number }): Promise<PaginatedQuizHistoryResponse> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.getQuizHistory();
  }
  const response = await apiClient.get('/quizzes/history', { params, ...CACHE_PROFILES.DYNAMIC });
  const normalized = normalizeCollectionPage<QuizHistoryItem>(response.data, 'sessions');

  return {
    ...normalized,
    items: normalized.items.map((item: QuizHistoryItem & { quiz?: Quiz; startedAt?: string; completedAt?: string }) => ({
      ...item,
      quizName: item.quizName ?? item.quiz?.name ?? '',
      topic: item.topic ?? item.quiz?.topic ?? '',
      status: item.status ?? (item.completedAt ? 'COMPLETED' : 'IN_PROGRESS'),
      totalAnswers: item.totalAnswers ?? ((item.correctAnswers ?? 0) + ((item as { wrongAnswers?: number }).wrongAnswers ?? 0)),
      startTime: item.startTime ?? item.startedAt ?? '',
      endTime: item.endTime ?? item.completedAt ?? '',
      passed: item.passed ?? false,
    })),
  };
};

export const getWrongAnswers = async (
  sessionId?: string
): Promise<WrongAnswer[]> => {
  if (quizOfflineMode) {
    return offlineQuizProvider.getWrongAnswers(sessionId || '');
  }
  if (sessionId) {
    const response = await apiClient.get(`/quizzes/sessions/${sessionId}/wrong`, CACHE_PROFILES.NO_CACHE);
    return normalizeWrongAnswers(response.data);
  }
  const response = await apiClient.get('/quizzes/wrong-answers', CACHE_PROFILES.NO_CACHE);
  return normalizeWrongAnswers(response.data);
};

export const getLeaderboard = async (
  quizId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedLeaderboardResponse> => {
  const response = await apiClient.get(`/quizzes/${quizId}/leaderboard`, { params, ...CACHE_PROFILES.DYNAMIC });
  const normalized = normalizeCollectionPage<LeaderboardEntry & { username?: string }>(response.data, 'leaderboard');

  return {
    ...normalized,
    items: normalized.items.map((entry) => ({
      ...entry,
      userName: entry.userName ?? entry.username ?? '',
      accuracy: entry.accuracy ?? 0,
    })),
  };
};
