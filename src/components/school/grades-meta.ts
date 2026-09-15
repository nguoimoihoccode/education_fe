// Shared labels/tones for grade test types — mirrors BE DEFAULT_COEFFICIENT
// (education_be/src/modules/school/entities/grade-entry.entity.ts).
import type { GradeTestType } from '@/types/school.types';

export const TEST_TYPES: GradeTestType[] = ['oral', '15min', '45min', 'final'];

export const TEST_TYPE_LABELS: Record<GradeTestType, string> = {
  oral: 'Miệng',
  '15min': '15 phút',
  '45min': '45 phút',
  final: 'Cuối kỳ',
};

export const TEST_TYPE_TONES: Record<GradeTestType, string> = {
  oral: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  '15min': 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  '45min': 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  final: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
};

export const DEFAULT_COEFFICIENT: Record<GradeTestType, number> = {
  oral: 1,
  '15min': 1,
  '45min': 2,
  final: 2,
};

export function scoreTone(score: number): string {
  if (score >= 8) return 'text-emerald-300';
  if (score >= 6.5) return 'text-sky-300';
  if (score >= 5) return 'text-amber-300';
  return 'text-rose-300';
}
