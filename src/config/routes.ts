// Application routes configuration

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',

  // Education routes
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  LESSON: (id: string) => `/lessons/${id}`,
  MY_COURSES: '/my-courses',
  VOCABULARY_REVIEW: '/vocabulary/review',

  // Flashcard routes
  FLASHCARDS: '/flashcards',
  FLASHCARD_DECKS: '/flashcards/decks',
  FLASHCARD_REVIEW: '/flashcards/review',
  FLASHCARD_STATS: '/flashcards/stats',
  FLASHCARD_IMPORT: '/flashcards/import',
  FLASHCARD_CREATE: '/flashcards/create',
  FLASHCARD_DOCUMENT_IMPORT: '/flashcards/document-import',
} as const;

// Route metadata
export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: 'Trang chủ',
  [ROUTES.LOGIN]: 'Đăng nhập',
  [ROUTES.REGISTER]: 'Đăng ký',
  [ROUTES.COURSES]: 'Khóa học',
  [ROUTES.MY_COURSES]: 'Khóa học của tôi',
  [ROUTES.VOCABULARY_REVIEW]: 'Ôn tập từ vựng',
  [ROUTES.FLASHCARDS]: 'Flashcards',
  [ROUTES.FLASHCARD_DECKS]: 'Flashcard Decks',
  [ROUTES.FLASHCARD_REVIEW]: 'Flashcard Review',
  [ROUTES.FLASHCARD_STATS]: 'Flashcard Stats',
  [ROUTES.FLASHCARD_IMPORT]: 'Import Flashcards',
  [ROUTES.FLASHCARD_CREATE]: 'Create Flashcard',
  [ROUTES.FLASHCARD_DOCUMENT_IMPORT]: 'Import Documents',
};
