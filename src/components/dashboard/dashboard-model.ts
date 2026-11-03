import type { TodayLearningHub, TodayLearningHubTask } from '@/types/education.types';
import type {
  MyChild,
  MyHomework,
  StudentGrades,
  StudentHomeworkRow,
  TimetableSlotView,
} from '@/types/school.types';

/** JS `Date#getDay()` numbers Sunday 0; the school plan numbers it 1 (T2..T7 = 2..7). */
export const planWeekday = (date: Date): number => date.getDay() + 1;

export function todaysSlots(
  slots: TimetableSlotView[],
  date: Date = new Date(),
): TimetableSlotView[] {
  const weekday = planWeekday(date);
  return slots
    .filter((slot) => slot.weekday === weekday)
    .sort((a, b) => a.periodNumber - b.periodNumber);
}

/** Homework already turned in — the BE marks it through the quiz→grade bridge. */
export function doneHomeworkIds(data: MyHomework | undefined): Set<string> {
  return new Set(
    (data?.graded ?? [])
      .map((entry) => entry.homeworkId)
      .filter((id): id is string => Boolean(id)),
  );
}

/** Undone homework: overdue first (they need attention now), then soonest deadline. */
export function pendingHomework(data: MyHomework | undefined): StudentHomeworkRow[] {
  const done = doneHomeworkIds(data);
  return (data?.homework ?? [])
    .filter((homework) => !done.has(homework.id))
    .sort(
      (a, b) =>
        Number(b.overdue) - Number(a.overdue) ||
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
}

export function openTasks(hub: TodayLearningHub | undefined): TodayLearningHubTask[] {
  return (hub?.tasks ?? [])
    .filter((task) => !task.completed)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Share of today's study goal already done, 0..1 — minutes against the daily
 * goal first (that is what the dial and the card both call "mục tiêu hôm nay"),
 * then the completed-task share when no minute goal is set.
 */
export function learningProgress(hub: TodayLearningHub | undefined): number {
  if (!hub) return 0;
  if (hub.dailyGoalMinutes > 0) {
    return Math.min(1, hub.minutesLearnedToday / hub.dailyGoalMinutes);
  }
  if (hub.totalTasks > 0) return Math.min(1, hub.completedTasks / hub.totalTasks);
  return 0;
}

export interface SubjectAverage {
  subjectId: string;
  subjectName: string;
  /** Year average, else the midterm one — the same `year ?? midterm` the ranking policy uses. */
  score: number | null;
  rank: number | null;
  rankedCount: number;
}

export function subjectAverages(grades: StudentGrades | undefined): SubjectAverage[] {
  return (grades?.subjects ?? []).map((subject) => ({
    subjectId: subject.subjectId,
    subjectName: subject.subjectName ?? 'Môn học',
    score: subject.year ?? subject.midterm ?? null,
    rank: subject.rank,
    rankedCount: subject.rankedCount,
  }));
}

/** Mean of the graded subject scores, one decimal; null when nothing is graded yet. */
export function overallAverage(grades: StudentGrades | undefined): number | null {
  const scores = subjectAverages(grades)
    .map((subject) => subject.score)
    .filter((score): score is number => score !== null);
  if (scores.length === 0) return null;
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(mean * 10) / 10;
}

export function approvedChildren(children: MyChild[] | undefined): MyChild[] {
  return (children ?? []).filter((child) => child.status === 'approved');
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị',
  principal: 'Hiệu trưởng',
  teacher: 'Giáo viên',
  student: 'Học sinh',
  parent: 'Phụ huynh',
  user: 'Học viên',
};

export function roleLabels(roles: string[] | undefined): string[] {
  return (roles ?? [])
    .map((role) => ROLE_LABELS[role])
    .filter((label): label is string => Boolean(label));
}
