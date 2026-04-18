import type {
  CreateQuizDto,
  Quiz,
  QuizDifficulty,
  QuizQuestionType,
  UpdateQuizDto,
} from '@/types/quiz.types';

interface QuizTopicLike {
  topic?: string | null;
}

export interface QuizListFormState {
  name: string;
  description: string;
  topic: string;
  difficulty: QuizDifficulty;
  questionType: QuizQuestionType;
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  isPublic: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswer: boolean;
  allowRetry: boolean;
  maxRetries: number;
}

export function createDefaultQuizFormState(): QuizListFormState {
  return {
    name: '',
    description: '',
    topic: '',
    difficulty: 'MEDIUM',
    questionType: 'MIXED',
    questionCount: 10,
    timeLimitMinutes: 10,
    passingScore: 70,
    isPublic: false,
    shuffleQuestions: true,
    shuffleAnswers: true,
    showCorrectAnswer: true,
    allowRetry: false,
    maxRetries: 0,
  };
}

export function createQuizFormStateFromQuiz(quiz: Quiz): QuizListFormState {
  return {
    name: quiz.name,
    description: quiz.description ?? '',
    topic: quiz.topic ?? '',
    difficulty: quiz.difficulty ?? 'MEDIUM',
    questionType: quiz.questionType ?? 'MIXED',
    questionCount: quiz.questionCount,
    timeLimitMinutes: quiz.timeLimit / 60,
    passingScore: quiz.passingScore,
    isPublic: quiz.isPublic,
    shuffleQuestions: quiz.shuffleQuestions,
    shuffleAnswers: quiz.shuffleAnswers,
    showCorrectAnswer: quiz.showCorrectAnswer,
    allowRetry: quiz.allowRetry,
    maxRetries: quiz.maxRetries,
  };
}

export function buildCreateQuizDto(form: QuizListFormState): CreateQuizDto {
  return {
    name: form.name,
    description: form.description || undefined,
    topic: form.topic || undefined,
    questionType: form.questionType,
    questionCount: form.questionCount,
    timeLimit: form.timeLimitMinutes * 60,
    passingScore: form.passingScore,
    difficulty: form.difficulty,
    isPublic: form.isPublic,
    shuffleQuestions: form.shuffleQuestions,
    shuffleAnswers: form.shuffleAnswers,
    showCorrectAnswer: form.showCorrectAnswer,
    allowRetry: form.allowRetry,
    maxRetries: form.maxRetries,
  };
}

export function buildUpdateQuizDto(form: QuizListFormState): UpdateQuizDto {
  return {
    name: form.name,
    description: form.description || undefined,
    topic: form.topic || undefined,
    questionType: form.questionType,
    difficulty: form.difficulty,
    isPublic: form.isPublic,
    shuffleQuestions: form.shuffleQuestions,
    shuffleAnswers: form.shuffleAnswers,
    showCorrectAnswer: form.showCorrectAnswer,
    allowRetry: form.allowRetry,
    maxRetries: form.maxRetries,
  };
}

export function extractAvailableTopics(quizzes: QuizTopicLike[]): string[] {
  const seen = new Set<string>();

  return quizzes.reduce<string[]>((topics, quiz) => {
    const topic = quiz.topic?.trim();
    if (!topic || seen.has(topic)) {
      return topics;
    }

    seen.add(topic);
    topics.push(topic);
    return topics;
  }, []);
}

export function getQuizCreateErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  return 'Failed to create quiz.';
}

export function getQuizUpdateErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  return 'Failed to update quiz.';
}

export function getQuizDeleteErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  return 'Failed to delete quiz.';
}
