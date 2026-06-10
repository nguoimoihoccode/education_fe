import { describe, expect, it } from 'vitest';
import { getRouteTitle, ROUTES } from './routes';

describe('ROUTES', () => {
  it('matches the mounted education routes', () => {
    expect(ROUTES.COURSES).toBe('/education');
    expect(ROUTES.COURSE_DETAIL('course-1')).toBe('/education/courses/course-1');
    expect(ROUTES.LESSON('lesson-1')).toBe('/education/lessons/lesson-1');
  });

  it('includes the mounted protected app routes', () => {
    expect(ROUTES.PROFILE).toBe('/profile');
    expect(ROUTES.AI_TUTOR).toBe('/ai-tutor');
    expect(ROUTES.LEARNING_COACH).toBe('/learning-coach');
    expect(ROUTES.LEADERBOARD).toBe('/leaderboard');
    expect(ROUTES.SOCIAL).toBe('/social');
    expect(ROUTES.PREMIUM).toBe('/premium');
    expect(ROUTES.COMMUNITY).toBe('/community');
    expect(ROUTES.SETTINGS).toBe('/settings');
    expect(ROUTES.SESSIONS).toBe('/settings/sessions');
    expect(ROUTES.ADMIN_SESSIONS).toBe('/admin/sessions');
    expect(ROUTES.DATA_LOGS).toBe('/data-logs');
    expect(ROUTES.ONBOARDING).toBe('/onboarding');
  });

  it('includes the mounted public utility routes', () => {
    expect(ROUTES.FORGOT_PASSWORD).toBe('/forgot-password');
    expect(ROUTES.SCHOLAR_PROFILE('mai')).toBe('/scholar/mai');
    expect(ROUTES.COMING_SOON).toBe('/coming-soon');
    expect(ROUTES.DASHBOARD_LANDING).toBe('/dashboard-landing');
    expect(ROUTES.UNAUTHORIZED).toBe('/unauthorized');
  });

  it('resolves titles for dynamic mounted routes', () => {
    expect(getRouteTitle('/education/courses/course-1')).toBe('Chi tiết khóa học');
    expect(getRouteTitle('/education/lessons/lesson-1')).toBe('Bài học');
    expect(getRouteTitle('/quiz/quiz-1')).toBe('Chi tiết Quiz');
    expect(getRouteTitle('/quiz/quiz-1/session')).toBe('Làm Quiz');
    expect(getRouteTitle('/quiz/session/session-1/result')).toBe('Kết quả Quiz');
    expect(getRouteTitle('/scholar/mai')).toBe('Hồ sơ học giả');
    expect(getRouteTitle('/learning-coach')).toBe('Coach học tập');
    expect(getRouteTitle('/settings/sessions')).toBe('Phiên đăng nhập');
    expect(getRouteTitle('/admin/sessions')).toBe('Quản lý phiên đăng nhập');
  });
});
