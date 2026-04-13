import type { PaginatedItemsResponse } from './common.types';

// Type Aliases
export type QuizQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MIXED';
export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
export type QuizSessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';

// Quiz Entity
export interface Quiz {
  id: string;
  name: string;
  description?: string | null;
  topic?: string | null;
  questionType?: QuizQuestionType | null;
  questionCount: number;
  timeLimit: number; // in seconds
  passingScore: number; // percentage 0-100
  difficulty?: QuizDifficulty | null;
  isPublic: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswer: boolean;
  allowRetry: boolean;
  maxRetries: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
}

// Quiz Question Entity
export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizQuestionType;
  options?: string[] | null;
  correctAnswer: string;
  explanation?: string | null;
  points: number;
  flashcardId?: string | null;
  quizId: string;
  createdAt: string;
  updatedAt: string;
}

// Quiz Session Entity
export interface QuizSession {
  id: string;
  quizId: string;
  userId: number;
  status: QuizSessionStatus;
  currentQuestionIndex: number;
  correctAnswers: number;
  totalAnswers: number;
  score: number;
  startTime: string;
  endTime: string | null;
  timeSpent: number; // in seconds
  expiresAt?: string | null;
  passed?: boolean;
  certificateUrl?: string | null;
}

// Submit Answer Response
export interface SubmitAnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  points: number;
}

// Statistics
export interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTimePerQuestion: number;
  watchedTopics: string[];
  completedQuizzes: number;
  passedQuizzes: number;
}

export interface TopicStats {
  topic: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  favoriteQuestionTypes: QuizQuestionType[];
  strengths: string[];
  weaknesses: string[];
}

// History & Results
export interface QuizHistoryItem {
  id: string;
  quizId: string;
  quizName: string;
  topic: string;
  status: QuizSessionStatus;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  timeSpent: number;
  startTime: string;
  endTime: string;
  passed: boolean;
}

export interface WrongAnswer {
  sessionId?: string;
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  type: QuizQuestionType;
  options?: string[];
  timeSpent: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  score: number;
  timeSpent: number;
  accuracy: number; // percentage
  completedAt: string;
}

// Request DTOs
export interface CreateQuizDto {
  name: string;
  description?: string;
  topic?: string;
  questionType?: QuizQuestionType | 'MIXED';
  questionCount?: number; // 1-100
  timeLimit?: number; // seconds, 30-3600
  passingScore?: number; // 0-100
  difficulty?: QuizDifficulty | 'MIXED';
  isPublic?: boolean;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  showCorrectAnswer?: boolean;
  allowRetry?: boolean;
  maxRetries?: number; // 0-10
}

export interface UpdateQuizDto extends Partial<Omit<CreateQuizDto, 'questionCount' | 'timeLimit' | 'passingScore'>> {}

export interface CreateQuizQuestionDto {
  question: string;
  type: QuizQuestionType;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points?: number; // default 1, 1-10
  flashcardId?: string;
}

export interface BulkCreateQuizQuestionDto {
  questions: CreateQuizQuestionDto[];
}

export interface UpdateQuizQuestionDto extends Partial<CreateQuizQuestionDto> {}

export interface StartQuizSessionDto {
  quizId: string;
  questionCount?: number;
}

export interface SubmitQuizAnswerDto {
  questionId: string;
  answer: string;
  timeSpent?: number; // seconds
}

export interface CompleteQuizSessionDto {
  sessionId: string;
}

export interface GenerateQuizFromFlashcardsDto {
  name: string;
  topic?: string;
  deckId?: string;
  questionCount?: number;
  questionType?: QuizQuestionType;
  difficulty?: QuizDifficulty;
  timeLimit?: number;
}

// Response Types for paginated endpoints
export type PaginatedQuizResponse = PaginatedItemsResponse<Quiz>;
export type PaginatedQuizSessionResponse = PaginatedItemsResponse<QuizSession>;
export type PaginatedQuizHistoryResponse = PaginatedItemsResponse<QuizHistoryItem>;
export type PaginatedLeaderboardResponse = PaginatedItemsResponse<LeaderboardEntry>;
