import { describe, expect, it } from 'vitest';
import {
  getCoursePrimaryAction,
  getLessonTargetUrl,
  getNextCourseLesson,
} from './courseDetailView';
import type { Lesson } from '@/types/education.types';

const lessons = [
  { id: 'lesson-1', title: 'Intro' },
  { id: 'lesson-2', title: 'Practice' },
] as Lesson[];

describe('courseDetailView', () => {
  it('selects the first lesson as the next course lesson', () => {
    expect(getNextCourseLesson(lessons)?.id).toBe('lesson-1');
  });

  it('uses login action for unauthenticated learners', () => {
    expect(
      getCoursePrimaryAction({ isAuthenticated: false, isEnrolled: false, lessons }),
    ).toEqual({ type: 'login', label: 'Đăng nhập để học', targetUrl: '/login' });
  });

  it('uses enroll action for authenticated learners not enrolled in the course', () => {
    expect(
      getCoursePrimaryAction({ isAuthenticated: true, isEnrolled: false, lessons }),
    ).toEqual({ type: 'enroll', label: 'Enroll in Course' });
  });

  it('uses lesson action for enrolled learners with lessons', () => {
    expect(
      getCoursePrimaryAction({ isAuthenticated: true, isEnrolled: true, lessons }),
    ).toEqual({
      type: 'lesson',
      label: 'Tiếp tục học',
      targetUrl: '/education/lessons/lesson-1',
    });
  });

  it('does not create a dead target for locked lessons', () => {
    expect(getLessonTargetUrl(false, 'lesson-1')).toBeNull();
    expect(getLessonTargetUrl(true, 'lesson-1')).toBe('/education/lessons/lesson-1');
  });
});
