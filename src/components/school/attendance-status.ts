import type { AttendanceStatus } from '@/types/school.types';

/** Vietnamese labels shared by every attendance surface (Phase 3). */
export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Có mặt',
  absent: 'Vắng',
  late: 'Trễ',
  excused: 'Có phép',
};

/** Chip tone (border/bg/text) for read-only status pills. */
export const STATUS_TONES: Record<AttendanceStatus, string> = {
  present: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  absent: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  late: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  excused: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
};
