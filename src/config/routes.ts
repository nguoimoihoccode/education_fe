// Application routes configuration

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  AUTH_CALLBACK: '/auth/callback',

  // Education routes
  COURSES: '/education',
  COURSE_DETAIL: (id: string) => `/education/courses/${id}`,
  LESSON: (id: string) => `/education/lessons/${id}`,
  TODAY: '/today',

  // Flashcard routes
  FLASHCARDS: '/flashcards',
  FLASHCARD_DECKS: '/flashcards/decks',
  FLASHCARD_REVIEW: '/flashcards/review',
  FLASHCARD_STATS: '/flashcards/stats',
  FLASHCARD_DOCUMENT_IMPORT: '/flashcards/document-import',
  QUIZ: '/quiz',
  QUIZ_STATS: '/quiz/stats',
  QUIZ_HISTORY: '/quiz/history',
  QUIZ_DETAIL: (id: string) => `/quiz/${id}`,
  QUIZ_SESSION: (quizId: string) => `/quiz/${quizId}/session`,
  QUIZ_RESULT: (sessionId: string) => `/quiz/session/${sessionId}/result`,

  // School administration (principal area — docs/SCHOOL_PLATFORM_PLAN.md Phase 1)
  PRINCIPAL: '/principal',
  PRINCIPAL_SUBJECTS: '/principal/subjects',
  PRINCIPAL_CLASSES: '/principal/classes',
  PRINCIPAL_TEACHERS: '/principal/teachers',
  PRINCIPAL_TIMETABLE: '/principal/timetable',

  // Teaching hub (GVCN) + parent portal — SCHOOL_PLATFORM_PLAN.md Phase 2–3
  TEACHING: '/teaching',
  TEACHING_CLASS: (id: string) => `/teaching/classes/${id}`,
  TEACHING_TIMETABLE: '/teaching/timetable',
  TEACHING_ATTENDANCE: (id: string) => `/teaching/classes/${id}/attendance`,
  // Sổ điểm + giao BTVN theo lớp (Phase 4)
  TEACHING_GRADES: (id: string) => `/teaching/classes/${id}/grades`,
  TEACHING_HOMEWORK: (id: string) => `/teaching/classes/${id}/homework`,
  PARENT: '/parent',
  PARENT_CHILD: (id: number | string) => `/parent/children/${id}`,

  // Student school view (own timetable — Phase 3)
  ME_SCHOOL: '/me/school',

  // Social, account, and utilities
  PROFILE: '/profile',
  AI_TUTOR: '/ai-tutor',
  LEARNING_COACH: '/learning-coach',
  PREMIUM: '/premium',
  SETTINGS: '/settings',
  SESSIONS: '/settings/sessions',
  ADMIN_SESSIONS: '/admin/sessions',
  DATA_LOGS: '/data-logs',
  ONBOARDING: '/onboarding',
  SCHOLAR_PROFILE: (username: string) => `/scholar/${username}`,
  COMING_SOON: '/coming-soon',
  DASHBOARD_LANDING: '/dashboard-landing',
  UNAUTHORIZED: '/unauthorized',
} as const;

// Route metadata
export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: 'Trang chủ',
  [ROUTES.LOGIN]: 'Đăng nhập',
  [ROUTES.REGISTER]: 'Đăng ký',
  [ROUTES.FORGOT_PASSWORD]: 'Quên mật khẩu',
  [ROUTES.COURSES]: 'Khóa học',
  [ROUTES.TODAY]: 'Hôm nay',
  [ROUTES.FLASHCARDS]: 'Flashcards',
  [ROUTES.FLASHCARD_DECKS]: 'Flashcard Decks',
  [ROUTES.FLASHCARD_REVIEW]: 'Flashcard Review',
  [ROUTES.FLASHCARD_STATS]: 'Flashcard Stats',
  [ROUTES.FLASHCARD_DOCUMENT_IMPORT]: 'Import Documents',
  [ROUTES.QUIZ]: 'Quiz',
  [ROUTES.QUIZ_STATS]: 'Quiz Stats',
  [ROUTES.QUIZ_HISTORY]: 'Quiz History',
  [ROUTES.PROFILE]: 'Hồ sơ',
  [ROUTES.AI_TUTOR]: 'AI Tutor',
  [ROUTES.LEARNING_COACH]: 'Coach học tập',
  [ROUTES.PREMIUM]: 'Premium',
  [ROUTES.SETTINGS]: 'Cài đặt',
  [ROUTES.SESSIONS]: 'Phiên đăng nhập',
  [ROUTES.ADMIN_SESSIONS]: 'Quản lý phiên đăng nhập',
  [ROUTES.PRINCIPAL]: 'Tổng quan trường',
  [ROUTES.PRINCIPAL_SUBJECTS]: 'Môn học',
  [ROUTES.PRINCIPAL_CLASSES]: 'Lớp học',
  [ROUTES.PRINCIPAL_TEACHERS]: 'Giáo viên',
  [ROUTES.PRINCIPAL_TIMETABLE]: 'Thời khoá biểu',
  [ROUTES.TEACHING]: 'Lớp chủ nhiệm',
  [ROUTES.TEACHING_TIMETABLE]: 'TKK của tôi',
  [ROUTES.PARENT]: 'Con của tôi',
  [ROUTES.ME_SCHOOL]: 'Trường của tôi',
  [ROUTES.DATA_LOGS]: 'Data Logs',
  [ROUTES.ONBOARDING]: 'Onboarding',
  [ROUTES.COMING_SOON]: 'Coming Soon',
  [ROUTES.DASHBOARD_LANDING]: 'Dashboard Landing',
  [ROUTES.UNAUTHORIZED]: 'Không có quyền',
};

export function getRouteTitle(pathname: string): string | undefined {
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }

  if (/^\/education\/courses\/[^/]+$/.test(pathname)) {
    return 'Chi tiết khóa học';
  }
  if (/^\/education\/lessons\/[^/]+$/.test(pathname)) {
    return 'Bài học';
  }
  if (/^\/quiz\/session\/[^/]+\/result$/.test(pathname)) {
    return 'Kết quả Quiz';
  }
  if (/^\/quiz\/[^/]+\/session$/.test(pathname)) {
    return 'Làm Quiz';
  }
  if (/^\/quiz\/[^/]+$/.test(pathname)) {
    return 'Chi tiết Quiz';
  }
  if (/^\/scholar\/[^/]+$/.test(pathname)) {
    return 'Hồ sơ học giả';
  }
  if (/^\/teaching\/classes\/[^/]+$/.test(pathname)) {
    return 'Chi tiết lớp chủ nhiệm';
  }
  if (/^\/teaching\/classes\/[^/]+\/grades$/.test(pathname)) {
    return 'Sổ điểm';
  }
  if (/^\/teaching\/classes\/[^/]+\/homework$/.test(pathname)) {
    return 'Giao bài tập';
  }
  if (/^\/parent\/children\/[^/]+$/.test(pathname)) {
    return 'Hồ sơ con';
  }

  return undefined;
}
