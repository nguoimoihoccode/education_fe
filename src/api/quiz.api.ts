import { apiClient } from './client';
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
  SubmitQuizAnswerDto,
  CompleteQuizSessionDto,
  GenerateQuizFromFlashcardsDto,
  PaginatedQuizResponse,
  PaginatedQuizSessionResponse,
  PaginatedQuizHistoryResponse,
  PaginatedLeaderboardResponse,
  SubmitAnswerResult,
} from '@/types/quiz.types';

// ==================== QUIZ MANAGEMENT ====================

export const getQuizzes = async (params?: {
  topic?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedQuizResponse> => {
  const response = await apiClient.get('/quizzes', { params });
  return response.data;
};

export const getPublicQuizzes = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedQuizResponse> => {
  const response = await apiClient.get('/quizzes/public', { params });
  return response.data;
};

export const getQuizById = async (id: string): Promise<Quiz> => {
  const response = await apiClient.get(`/quizzes/${id}`);
  return response.data;
};

export const createQuiz = async (dto: CreateQuizDto): Promise<Quiz> => {
  const response = await apiClient.post('/quizzes', dto);
  return response.data;
};

export const updateQuiz = async (id: string, dto: UpdateQuizDto): Promise<Quiz> => {
  const response = await apiClient.patch(`/quizzes/${id}`, dto);
  return response.data;
};

export const deleteQuiz = async (id: string): Promise<void> => {
  await apiClient.delete(`/quizzes/${id}`);
};

// ==================== QUESTION MANAGEMENT ====================

export const getQuizQuestions = async (quizId: string): Promise<QuizQuestion[]> => {
  const response = await apiClient.get(`/quizzes/${quizId}/questions`);
  return response.data;
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
  return response.data;
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
  const response = await apiClient.post(`/quizzes/${quizId}/start`, dto);
  return response.data;
};

export const submitQuizAnswer = async (
  sessionId: string,
  answerData: {
    questionId: string;
    answer: string;
    timeSpent?: number;
  }
): Promise<SubmitAnswerResult> => {
  const response = await apiClient.post(`/quizzes/sessions/${sessionId}/answer`, answerData);
  return response.data;
};

export const completeQuizSession = async (sessionId: string): Promise<QuizSession> => {
  const response = await apiClient.post(`/quizzes/sessions/${sessionId}/complete`);
  return response.data;
};

export const getQuizSession = async (sessionId: string): Promise<QuizSession> => {
  const response = await apiClient.get(`/quizzes/sessions/${sessionId}`);
  return response.data;
};

export const getQuizSessions = async (
  quizId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedQuizSessionResponse> => {
  const response = await apiClient.get(`/quizzes/${quizId}/sessions`, { params });
  return response.data;
};

export const getAllQuizSessions = async (params?: { page?: number; limit?: number }): Promise<PaginatedQuizSessionResponse> => {
  const response = await apiClient.get('/quizzes/sessions', { params });
  return response.data;
};

// ==================== STATISTICS & HISTORY ====================

export const getQuizStats = async (): Promise<QuizStats> => {
  const response = await apiClient.get('/quizzes/stats');
  return response.data;
};

export const getQuizStatsByTopic = async (topic: string): Promise<TopicStats> => {
  const response = await apiClient.get(`/quizzes/stats/topic/${topic}`);
  return response.data;
};

export const getQuizHistory = async (params?: { page?: number; limit?: number }): Promise<PaginatedQuizHistoryResponse> => {
  const response = await apiClient.get('/quizzes/history', { params });
  return response.data;
};

export const getWrongAnswers = async (
  sessionId?: string
): Promise<WrongAnswer[]> => {
  if (sessionId) {
    const response = await apiClient.get(`/quizzes/sessions/${sessionId}/wrong`);
    return response.data;
  }
  const response = await apiClient.get('/quizzes/wrong-answers');
  return response.data;
};

export const getLeaderboard = async (
  quizId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedLeaderboardResponse> => {
  const response = await apiClient.get(`/quizzes/${quizId}/leaderboard`, { params });
  return response.data;
};
