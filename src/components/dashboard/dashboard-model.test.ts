import { describe, expect, it } from 'vitest';
import type { TodayLearningHub, TodayLearningHubTask } from '@/types/education.types';
import type {
  MyChild,
  MyHomework,
  StudentGrades,
  StudentHomeworkRow,
  TimetableSlotView,
} from '@/types/school.types';
import {
  approvedChildren,
  doneHomeworkIds,
  learningProgress,
  openTasks,
  overallAverage,
  pendingHomework,
  planWeekday,
  roleLabels,
  subjectAverages,
  todaysSlots,
} from './dashboard-model';

const slot = (id: string, weekday: number, periodNumber: number): TimetableSlotView => ({
  id,
  weekday,
  periodNumber,
  room: null,
  subject: { id: `s-${id}`, name: `Môn ${id}`, code: id, color: null },
  teacher: { id: 1, name: 'Cô Lan' },
});

const homeworkRow = (id: string, dueDate: string, overdue = false): StudentHomeworkRow => ({
  id,
  schoolId: 'school-1',
  classId: 'class-1',
  className: '8A',
  subjectId: 'subject-1',
  subjectName: 'Toán',
  teacherId: 1,
  teacherName: 'Cô Lan',
  title: `Bài ${id}`,
  dueDate,
  targetType: 'quiz',
  targetId: `quiz-${id}`,
  countsAsGrade: false,
  createdAt: '2026-10-30T00:00:00.000Z',
  overdue,
});

const task = (id: string, completed: boolean, priority: number): TodayLearningHubTask => ({
  id,
  type: 'quick_quiz',
  title: `Việc ${id}`,
  description: '',
  ctaLabel: 'Mở',
  targetUrl: '/quiz/x',
  estimatedMinutes: 5,
  completed,
  priority,
});

describe('planWeekday', () => {
  it('numbers Sunday as 1 and Monday as 2, matching the school plan', () => {
    expect(planWeekday(new Date(2026, 10, 8))).toBe(1); // Chủ nhật
    expect(planWeekday(new Date(2026, 10, 2))).toBe(2); // Thứ 2
  });
});

describe('todaysSlots', () => {
  it('keeps only the selected weekday and orders by period', () => {
    const slots = [slot('c', 2, 3), slot('other', 3, 1), slot('a', 2, 1)];
    expect(todaysSlots(slots, new Date(2026, 10, 2)).map((s) => s.id)).toEqual(['a', 'c']);
  });

  it('returns nothing on a day without lessons', () => {
    expect(todaysSlots([slot('a', 2, 1)], new Date(2026, 10, 8))).toEqual([]);
  });
});

describe('homework helpers', () => {
  const data: MyHomework = {
    homework: [
      homeworkRow('later', '2026-11-06T10:00:00.000Z'),
      homeworkRow('overdue', '2026-11-01T10:00:00.000Z', true),
      homeworkRow('done', '2026-11-04T10:00:00.000Z'),
      homeworkRow('sooner', '2026-11-04T09:00:00.000Z'),
    ],
    graded: [{ homeworkId: 'done', quizSessionId: 'session-1', score: 8 }],
  };

  it('collects graded homework ids and ignores rows without one', () => {
    expect([...doneHomeworkIds(data)]).toEqual(['done']);
    expect([...doneHomeworkIds(undefined)]).toEqual([]);
  });

  it('lists undone homework overdue-first, then by soonest deadline', () => {
    expect(pendingHomework(data).map((row) => row.id)).toEqual(['overdue', 'sooner', 'later']);
  });
});

describe('openTasks', () => {
  it('drops completed tasks and orders by priority', () => {
    const hub = {
      tasks: [task('b', false, 2), task('done', true, 0), task('a', false, 1)],
    } as TodayLearningHub;
    expect(openTasks(hub).map((item) => item.id)).toEqual(['a', 'b']);
    expect(openTasks(undefined)).toEqual([]);
  });
});

describe('learningProgress', () => {
  const base = {
    date: '2026-11-03',
    dailyGoalMinutes: 20,
    minutesLearnedToday: 5,
    xpToday: 0,
    completedTasks: 1,
    totalTasks: 4,
    streak: { current: 1, longest: 1, isAtRisk: false },
    tasks: [],
  } satisfies TodayLearningHub;

  it('prefers the daily minute goal', () => {
    expect(learningProgress({ ...base, minutesLearnedToday: 15 })).toBeCloseTo(0.75);
  });

  it('falls back to the completed-task share when no goal is set', () => {
    expect(learningProgress({ ...base, dailyGoalMinutes: 0 })).toBeCloseTo(0.25);
  });

  it('clamps to 1 and returns 0 without data', () => {
    expect(learningProgress({ ...base, minutesLearnedToday: 90 })).toBe(1);
    expect(learningProgress(undefined)).toBe(0);
  });
});

describe('grade helpers', () => {
  const grades: StudentGrades = {
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
      {
        subjectId: 'van',
        subjectName: null,
        term: 2,
        byType: {},
        midterm: 6.5,
        final: null,
        year: null,
        totalEntries: 1,
        entries: [],
        rank: null,
        rankedCount: 0,
      },
      {
        subjectId: 'anh',
        subjectName: 'Anh',
        term: 2,
        byType: {},
        midterm: null,
        final: null,
        year: null,
        totalEntries: 0,
        entries: [],
        rank: null,
        rankedCount: 0,
      },
    ],
  };

  it('prefers the year average and falls back to the midterm one', () => {
    expect(subjectAverages(grades).map((s) => s.score)).toEqual([8.5, 6.5, null]);
    expect(subjectAverages(grades)[1].subjectName).toBe('Môn học');
  });

  it('averages only graded subjects, one decimal', () => {
    expect(overallAverage(grades)).toBe(7.5);
    expect(overallAverage({ studentId: 1, subjects: [] })).toBeNull();
    expect(overallAverage(undefined)).toBeNull();
  });
});

describe('role helpers', () => {
  it('labels known roles and drops unknown ones', () => {
    expect(roleLabels(['teacher', 'weird', 'parent'])).toEqual(['Giáo viên', 'Phụ huynh']);
    expect(roleLabels(undefined)).toEqual([]);
  });

  it('keeps only approved parent links', () => {
    const children = [
      {
        linkId: 'a',
        studentId: 1,
        childName: 'An',
        relation: 'mother',
        status: 'approved',
        classId: null,
        className: null,
        grade: null,
        academicYear: null,
      },
      {
        linkId: 'b',
        studentId: 2,
        childName: 'Bình',
        relation: 'father',
        status: 'pending',
        classId: null,
        className: null,
        grade: null,
        academicYear: null,
      },
    ] as MyChild[];
    expect(approvedChildren(children).map((child) => child.linkId)).toEqual(['a']);
  });
});
