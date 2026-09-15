import type { CSSProperties } from 'react';
import type { PeriodConfig } from '@/types/school.types';

/** Plan weekday numbering (matches BE): 1 = Chủ nhật, 2..7 = Thứ 2..Thứ 7. */
export const WEEKDAY_LABELS: Record<number, string> = {
  1: 'CN',
  2: 'Thứ 2',
  3: 'Thứ 3',
  4: 'Thứ 4',
  5: 'Thứ 5',
  6: 'Thứ 6',
  7: 'Thứ 7',
};

/** Stable key for a grid cell — same scheme the BE conflict policy uses. */
export const cellKey = (weekday: number, periodNumber: number) =>
  `${weekday}:${periodNumber}`;

/** Only a plain #rrggbb can be safely tinted; anything else → neutral chip. */
export const subjectTint = (
  color: string | null | undefined,
): CSSProperties | undefined =>
  color && /^#[0-9a-fA-F]{6}$/.test(color)
    ? { backgroundColor: `${color}1f`, borderColor: `${color}66` }
    : undefined;

/** Fallback used when a timetable response lacks the school config. */
export const FALLBACK_PERIOD_CONFIG: PeriodConfig = {
  periodsPerDay: 5,
  days: [2, 3, 4, 5, 6, 7],
};
