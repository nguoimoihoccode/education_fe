import type { Lesson } from '@/types/education.types';

export type CoursePrimaryAction =
  | { type: 'login'; label: string; targetUrl: '/login' }
  | { type: 'enroll'; label: string }
  | { type: 'lesson'; label: string; targetUrl: string }
  | { type: 'none'; label: string };

export function getNextCourseLesson(lessons: Lesson[]): Lesson | null {
  return lessons[0] ?? null;
}

export function getCoursePrimaryAction(params: {
  isAuthenticated: boolean;
  isEnrolled: boolean;
  lessons: Lesson[];
}): CoursePrimaryAction {
  if (!params.isAuthenticated) {
    return { type: 'login', label: 'Đăng nhập để học', targetUrl: '/login' };
  }

  if (!params.isEnrolled) {
    return { type: 'enroll', label: 'Enroll in Course' };
  }

  const nextLesson = getNextCourseLesson(params.lessons);

  if (!nextLesson) {
    return { type: 'none', label: 'Chưa có bài học' };
  }

  return {
    type: 'lesson',
    label: 'Tiếp tục học',
    targetUrl: `/education/lessons/${nextLesson.id}`,
  };
}

export function getLessonTargetUrl(isEnrolled: boolean, lessonId: string): string | null {
  return isEnrolled ? `/education/lessons/${lessonId}` : null;
}
