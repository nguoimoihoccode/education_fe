import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

export const QUERY_KEYS = {
  // Education
  LANGUAGES: ['languages'],
  COURSES: ['courses'],
  COURSE_DETAIL: (id: string) => ['course', id],
  MY_COURSES: ['my-courses'],
  LESSONS: (courseId: string) => ['lessons', courseId],
  LESSON_DETAIL: (id: string) => ['lesson', id],
  VOCABULARY: (lessonId: string) => ['vocabulary', lessonId],
  VOCABULARY_REVIEW: ['vocabulary', 'review'],
  EXERCISES: (lessonId: string) => ['exercises', lessonId],
  USER_PROGRESS: ['user', 'progress'],
  USER_STREAK: ['user', 'streak'],
  LEARNING_PLAN: ['user', 'learning-plan'],
  LEARNING_COACH: ['user', 'learning-coach'],
  TODAY_RECOMMENDATIONS: ['user', 'today-recommendations'],
  TODAY_PLAN: ['user', 'today-plan'],
  TODAY_HUB: ['user', 'today-hub'],

  // Flashcard
  FLASHCARD_DECKS: ['flashcard', 'decks'],
  FLASHCARD_DECKS_BY_TOPIC: (topic: string) => ['flashcard', 'decks', 'topic', topic],
  FLASHCARD_DECK: (id: string) => ['flashcard', 'deck', id],
  FLASHCARDS: (deckId?: string, page?: number, limit?: number) => {
    return ['flashcards', 'list', deckId ?? 'all', page ?? 1, limit ?? 20] as const;
  },
  FLASHCARD: (id: string) => ['flashcard', id],
  FLASHCARD_SEARCH: (query: string, page?: number, limit?: number) => {
    return ['flashcard', 'search', query, page ?? 1, limit ?? 20] as const;
  },
  FLASHCARD_DUE: (deckId?: string, limit?: number) => {
    return ['flashcard', 'due', deckId ?? 'all', limit ?? 20] as const;
  },
  FLASHCARD_STATS: ['flashcard', 'stats'],
  DECK_STATS: (deckId: string) => ['deck', deckId, 'stats'],
  REVIEW_STATS: ['review', 'stats'],
  REVIEW_SESSION: ['review', 'session'],
  REVIEW_SESSIONS: (page?: number, limit?: number) => {
    return ['review', 'sessions', page ?? 1, limit ?? 20] as const;
  },
  REVIEW_HISTORY: (page?: number, limit?: number) => {
    return ['review', 'history', page ?? 1, limit ?? 20] as const;
  },
  // Quiz query keys
  QUIZZES: (page?: number, limit?: number, topic?: string) => {
    return ['quizzes', page ?? 1, limit ?? 20, topic ?? 'all'] as const;
  },
  PUBLIC_QUIZZES: (page?: number, limit?: number) => {
    return ['quizzes', 'public', page ?? 1, limit ?? 20] as const;
  },
  QUIZ: (id: string) => ['quiz', id] as const,
  QUIZ_QUESTIONS: (quizId: string) => ['quiz', quizId, 'questions'] as const,
  QUIZ_SESSION: (sessionId: string) => ['quiz', 'session', sessionId] as const,
  QUIZ_SESSIONS_BY_QUIZ: (quizId: string, page?: number, limit?: number) => {
    return ['quiz', quizId, 'sessions', page ?? 1, limit ?? 20] as const;
  },
  QUIZ_SESSIONS: (page?: number, limit?: number) => {
    return ['quiz', 'sessions', page ?? 1, limit ?? 20] as const;
  },
  QUIZ_STATS: ['quiz', 'stats'] as const,
  QUIZ_STATS_BY_TOPIC: (topic: string) => ['quiz', 'stats', 'topic', topic] as const,
  QUIZ_HISTORY: (page?: number, limit?: number) => {
    return ['quiz', 'history', page ?? 1, limit ?? 20] as const;
  },
  WRONG_ANSWERS: (sessionId?: string) => {
    return ['quiz', 'wrong', sessionId ?? 'all'] as const;
  },
  // School platform (principal) query keys
  SCHOOL_ME: ['school', 'me'] as const,
  SCHOOL_STATS: ['school', 'stats'] as const,
  SCHOOL_TEACHERS: ['school', 'teachers'] as const,
  SCHOOL_ACADEMIC_YEARS: ['school', 'academic-years'] as const,
  SCHOOL_SUBJECTS: ['school', 'subjects'] as const,
  SCHOOL_CLASSES: ['school', 'classes'] as const,
  SCHOOL_ASSIGNMENTS: ['school', 'assignments'] as const,
  CLASS_STUDENTS: (classId: string) => ['school', 'classes', classId, 'students'] as const,
  // Teaching hub (GVCN — Phase 2)
  TEACHER_CLASSES: ['school', 'teaching', 'classes'] as const,
  TEACHER_CLASS_STUDENTS: (classId: string) =>
    ['school', 'teaching', 'classes', classId, 'students'] as const,
  CLASS_PARENTS: (classId: string) =>
    ['school', 'teaching', 'classes', classId, 'parents'] as const,
  // Parent portal (Phase 2)
  PARENT_CHILDREN: ['parent', 'children'] as const,
  PARENT_CHILD: (studentId: number) => ['parent', 'children', studentId] as const,
  // Timetable (Phase 3)
  TIMETABLE: (classId: string) => ['timetable', classId] as const,
  MY_TIMETABLE: ['timetable', 'me'] as const,
  // Attendance (Phase 3)
  ATTENDANCE_SESSION: (classId: string, date: string, period: number) =>
    ['attendance', 'session', classId, date, period] as const,
  ATTENDANCE_HISTORY: (classId: string) => ['attendance', 'history', classId] as const,
  CHILD_TIMETABLE: (studentId: number) => ['parent', 'children', studentId, 'timetable'] as const,
  CHILD_ATTENDANCE: (studentId: number) => ['parent', 'children', studentId, 'attendance'] as const,
  // Grades (Phase 4)
  GRADES: ['grades'] as const,
  GRADE_REPORT: (classId: string, subjectId: string, term?: number) =>
    ['grades', 'report', classId, subjectId, term ?? 'all'] as const,
  GRADE_RANKING: (classId: string, subjectId?: string, term?: number) =>
    ['grades', 'ranking', classId, subjectId ?? 'all', term ?? 'all'] as const,
  MY_GRADES: ['grades', 'me'] as const,
  CHILD_GRADES: (studentId: number) => ['parent', 'children', studentId, 'grades'] as const,
  // Homework (Phase 4)
  HOMEWORK: ['homework'] as const,
  MY_HOMEWORK: ['me', 'homework'] as const,
  CHILD_HOMEWORK: (studentId: number) => ['parent', 'children', studentId, 'homework'] as const,
} as const;
