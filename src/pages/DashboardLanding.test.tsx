import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TodayLearningHub } from '@/types/education.types';
import type { MyChild, SchoolClass } from '@/types/school.types';
import DashboardLanding from './DashboardLanding';
import { getTodayLearningHub } from '@/api/education.api';
import {
  getMyChildren,
  getMyGrades,
  getMyHomework,
  getMyTimetable,
  getSchoolStats,
  listMyHomeroomClasses,
} from '@/api/school.api';

const auth = vi.hoisted(() => ({
  isAuthenticated: true as boolean,
  user: null as null | {
    id: string;
    email: string;
    displayName: string;
    roles?: string[];
    createdAt: string;
    updatedAt: string;
  },
}));

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('@/api/education.api', () => ({ getTodayLearningHub: vi.fn() }));
vi.mock('@/api/school.api', () => ({
  getMyChildren: vi.fn(),
  getMyGrades: vi.fn(),
  getMyHomework: vi.fn(),
  getMyTimetable: vi.fn(),
  getSchoolStats: vi.fn(),
  listMyHomeroomClasses: vi.fn(),
}));

// The isometric figure has its own test; here it only has to receive the real
// progress numbers, so the stub prints them.
vi.mock('@/components/anatomy/StudyConsoleFigure', () => ({
  StudyConsoleFigure: ({
    progress,
    todayMinutes,
  }: {
    progress: number;
    todayMinutes: number;
  }) => <div data-testid="study-console">{`${Math.round(progress * 100)}%/${todayMinutes}`}</div>,
}));

const student = {
  id: '1',
  email: 'minh@example.com',
  displayName: 'Minh',
  roles: ['student'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const TODAY = new Date().getDay() + 1;
const OTHER_DAY = (TODAY % 7) + 1;

const HUB: TodayLearningHub = {
  date: '2026-11-03',
  dailyGoalMinutes: 30,
  minutesLearnedToday: 20,
  xpToday: 40,
  completedTasks: 1,
  totalTasks: 2,
  streak: { current: 5, longest: 9, isAtRisk: false },
  tasks: [
    {
      id: 'task-1',
      type: 'quick_quiz',
      title: 'Quiz Grammar 10 phút',
      description: '',
      ctaLabel: 'Làm quiz',
      targetUrl: '/quiz/quiz-1',
      estimatedMinutes: 10,
      completed: false,
      priority: 1,
    },
    {
      id: 'task-2',
      type: 'review_vocabulary',
      title: 'Ôn 12 thẻ đến hạn',
      description: '',
      ctaLabel: 'Ôn tập',
      targetUrl: '/flashcards/review',
      estimatedMinutes: 5,
      completed: true,
      priority: 2,
    },
  ],
};

const TIMETABLE: Awaited<ReturnType<typeof getMyTimetable>> = {
  as: 'student',
  periodConfig: { periodsPerDay: 5, days: [2, 3, 4, 5, 6, 7] },
  class: { id: 'class-1', name: '8A', grade: 8, academicYear: '2026-2027' },
  slots: [
    {
      id: 'slot-1',
      weekday: TODAY,
      periodNumber: 1,
      room: 'P201',
      subject: { id: 'toan', name: 'Toán', code: 'TOAN', color: null },
      teacher: { id: 1, name: 'Cô Lan' },
    },
    {
      id: 'slot-2',
      weekday: OTHER_DAY,
      periodNumber: 2,
      room: null,
      subject: { id: 'van', name: 'Ngữ văn', code: 'VAN', color: null },
      teacher: { id: 2, name: 'Thầy Hùng' },
    },
  ],
};

const HOMEWORK: Awaited<ReturnType<typeof getMyHomework>> = {
  homework: [
    {
      id: 'hw-1',
      schoolId: 'school-1',
      classId: 'class-1',
      className: '8A',
      subjectId: 'toan',
      subjectName: 'Toán',
      teacherId: 1,
      teacherName: 'Cô Lan',
      title: 'Giải 5 bài tập',
      dueDate: '2026-11-04T10:00:00.000Z',
      targetType: 'quiz',
      targetId: 'quiz-9',
      countsAsGrade: false,
      createdAt: '2026-11-01T00:00:00.000Z',
      overdue: true,
    },
    {
      id: 'hw-2',
      schoolId: 'school-1',
      classId: 'class-1',
      className: '8A',
      subjectId: 'anh',
      subjectName: 'Tiếng Anh',
      teacherId: 3,
      teacherName: 'Cô Mai',
      title: 'Ôn từ vựng Unit 3',
      dueDate: '2026-11-06T10:00:00.000Z',
      targetType: 'deck',
      targetId: 'deck-9',
      countsAsGrade: false,
      createdAt: '2026-11-02T00:00:00.000Z',
      overdue: false,
    },
    {
      id: 'hw-3',
      schoolId: 'school-1',
      classId: 'class-1',
      className: '8A',
      subjectId: 'van',
      subjectName: 'Ngữ văn',
      teacherId: 2,
      teacherName: 'Thầy Hùng',
      title: 'Bài đã nộp',
      dueDate: '2026-11-03T10:00:00.000Z',
      targetType: 'quiz',
      targetId: 'quiz-3',
      countsAsGrade: false,
      createdAt: '2026-11-01T00:00:00.000Z',
      overdue: false,
    },
  ],
  graded: [{ homeworkId: 'hw-3', quizSessionId: 'session-1', score: 9 }],
};

const GRADES: Awaited<ReturnType<typeof getMyGrades>> = {
  studentId: 1,
  subjects: [
    {
      subjectId: 'toan',
      subjectName: 'Toán',
      term: 2,
      byType: {},
      midterm: 7,
      final: null,
      year: 8.5,
      totalEntries: 3,
      entries: [],
      rank: 2,
      rankedCount: 30,
    },
  ],
};

const CLASS: SchoolClass = {
  id: 'class-1',
  name: '8A',
  grade: 8,
  academicYearId: 'year-1',
  homeroomTeacherId: 1,
  homeroomTeacher: null,
  maxStudents: 40,
  room: 'P201',
  active: true,
  schoolId: 'school-1',
  studentCount: 32,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const CHILDREN: MyChild[] = [
  {
    linkId: 'link-1',
    studentId: 7,
    childName: 'An',
    relation: 'mother',
    status: 'approved',
    classId: 'class-1',
    className: '8A',
    grade: 8,
    academicYear: '2026-2027',
  },
  {
    linkId: 'link-2',
    studentId: 8,
    childName: 'Bình',
    relation: 'father',
    status: 'pending',
    classId: null,
    className: null,
    grade: null,
    academicYear: null,
  },
];

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardLanding />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  auth.isAuthenticated = true;
  auth.user = student;
  vi.mocked(getTodayLearningHub).mockResolvedValue(HUB);
  vi.mocked(getMyTimetable).mockResolvedValue(TIMETABLE);
  vi.mocked(getMyHomework).mockResolvedValue(HOMEWORK);
  vi.mocked(getMyGrades).mockResolvedValue(GRADES);
  vi.mocked(getMyChildren).mockResolvedValue([]);
  vi.mocked(listMyHomeroomClasses).mockResolvedValue([]);
  vi.mocked(getSchoolStats).mockResolvedValue({
    classes: 12,
    students: 420,
    teachers: 38,
    subjects: 11,
    avgScore: 7.4,
    attendanceRate: 96,
    attendanceSessions: 240,
  });
});

afterEach(cleanup);

describe('DashboardLanding', () => {
  it('shows the platform overview and a login CTA to guests', () => {
    auth.isAuthenticated = false;
    auth.user = null;

    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Dạy, học và quản lý trường trong một nơi.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đăng nhập/ })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /Tạo tài khoản/ })).toHaveAttribute('href', '/register');
    expect(screen.getByText('Hiệu trưởng')).toBeInTheDocument();
    expect(screen.queryByTestId('study-console')).toBeNull();
    expect(getTodayLearningHub).not.toHaveBeenCalled();
    expect(getMyTimetable).not.toHaveBeenCalled();
  });

  it('renders a student day from the real timetable, homework, grades and plan', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Chào Minh' })).toBeInTheDocument();
    expect(await screen.findByText('Giải 5 bài tập')).toBeInTheDocument();
    expect(screen.getByText(/Học sinh/)).toBeInTheDocument();
    expect(screen.getByText('Mở đầu: Toán')).toBeInTheDocument();

    // Today's timetable keeps only today's slot; the other weekday is dropped.
    expect(screen.getByText('T1')).toBeInTheDocument();
    expect(screen.getAllByText('Toán')).toHaveLength(2); // timetable + gradebook
    expect(screen.queryByText('Ngữ văn')).not.toBeInTheDocument();

    // Pending homework only, with the right destination per target type.
    expect(screen.getByText('Giải 5 bài tập')).toBeInTheDocument();
    expect(screen.getByText('Quá hạn')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Làm bài' })).toHaveAttribute('href', '/quiz/quiz-9');
    expect(screen.getByRole('link', { name: 'Ôn tập' })).toHaveAttribute(
      'href',
      '/flashcards/review?deckId=deck-9',
    );
    expect(screen.queryByText('Bài đã nộp')).not.toBeInTheDocument();

    // Open plan task only, and the console reads the same plan.
    expect(screen.getByText('Quiz Grammar 10 phút')).toBeInTheDocument();
    expect(screen.queryByText('Ôn 12 thẻ đến hạn')).not.toBeInTheDocument();
    expect(screen.getByTestId('study-console')).toHaveTextContent('67%/20');

    // Grades: year average wins and renders with a comma.
    expect(screen.getByText('Trung bình 8,5')).toBeInTheDocument();
    expect(screen.getByText('Chuỗi ngày')).toBeInTheDocument();
    expect(screen.queryByText('Con của tôi')).not.toBeInTheDocument();
  });

  it('gives teachers their homeroom classes and never fetches student grades', async () => {
    auth.user = { ...student, displayName: 'Cô Lan', roles: ['teacher'] };
    vi.mocked(listMyHomeroomClasses).mockResolvedValue([CLASS]);

    renderPage();

    expect(await screen.findByText('Lớp chủ nhiệm')).toBeInTheDocument();
    expect(await screen.findByText(/32 học sinh/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /8A/ })).toHaveAttribute(
      'href',
      '/teaching/classes/class-1',
    );
    expect(screen.getByText(/Giáo viên/)).toBeInTheDocument();
    expect(getMyGrades).not.toHaveBeenCalled();
  });

  it('lists a parent’s children and flags the unapproved link', async () => {
    auth.user = { ...student, displayName: 'Chị Hoa', roles: ['parent'] };
    vi.mocked(getMyChildren).mockResolvedValue(CHILDREN);

    renderPage();

    expect(await screen.findByText('Con của tôi')).toBeInTheDocument();
    expect(await screen.findByText('An')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /An/ })).toHaveAttribute(
      'href',
      '/parent/children/7',
    );
    expect(screen.getByText('Bình')).toBeInTheDocument();
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
  });
});
