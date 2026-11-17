import type { ExamImport, ExamVersion } from '@/types/assessment.types';
import { unitsToPoints } from './assessmentScores';

type Q = { questionKey: string; kind: string; maxUnits: number; options?: { id: string }[]; statements?: { id: string }[]; answerKey?: unknown; scoringPolicy?: unknown; criteria?: { maxUnits: number }[]; acceptedAnswers?: string[] };
export type QuickReview = { eligible: boolean; reasons: string[]; summary: string; choiceKeys: string; trueFalseKeys: string };

const kindLabels: [string, string][] = [['single_choice', 'trắc nghiệm'], ['true_false_group', 'đúng/sai'], ['short_answer', 'đáp án ngắn'], ['rubric_text', 'tự luận theo tiêu chí'], ['rubric_table', 'tự luận dạng bảng'], ['rubric_drawing', 'hình vẽ (giáo viên chấm)']];

/** Why a key read from Word may be approved in one click; any doubt sends the teacher to the full review instead. */
export function quickReview(version: ExamVersion, source: ExamImport | undefined, maxScoreUnits: number): QuickReview {
  const questions = (Array.isArray(version.document.questions) ? version.document.questions : []) as Q[];
  const total = questions.reduce((n, q) => n + (q.maxUnits || 0), 0);
  const reasons: string[] = [];
  if (!source) reasons.push('Đáp án không được đọc từ file Word chính thức.');
  else if (source.state !== 'succeeded') reasons.push('File Word chưa đọc xong.');
  if (source?.warnings?.length) reasons.push(`File Word có ${source.warnings.length} cảnh báo cần xem.`);
  if (!questions.length) reasons.push('Chưa có câu hỏi nào.');
  if (total !== maxScoreUnits) reasons.push(`Tổng điểm các câu là ${unitsToPoints(total)}, khác tổng điểm đề ${unitsToPoints(maxScoreUnits)}.`);
  const incomplete = questions.filter(q => {
    if (q.kind === 'single_choice') return !q.options?.some(o => o.id === q.answerKey);
    if (q.kind === 'true_false_group') return !q.scoringPolicy || !q.statements?.length || q.statements.some(s => typeof (q.answerKey as Record<string, unknown> | undefined)?.[s.id] !== 'boolean');
    if (q.kind === 'short_answer') return !q.acceptedAnswers?.some(a => a.trim());
    if (q.kind.startsWith('rubric_')) return !q.criteria?.length || q.criteria.reduce((n, c) => n + c.maxUnits, 0) !== q.maxUnits;
    return true;
  }).map(q => q.questionKey);
  if (incomplete.length) reasons.push(`Câu ${incomplete.join(', ')} chưa đủ đáp án hoặc tiêu chí.`);
  const counts = kindLabels.map(([kind, label]) => [questions.filter(q => q.kind === kind).length, label] as const).filter(([n]) => n > 0);
  return {
    eligible: reasons.length === 0,
    reasons,
    summary: `${questions.length} câu · ${unitsToPoints(total)} điểm${counts.length ? `: ${counts.map(([n, label]) => `${n} ${label}`).join(', ')}` : ''}`,
    choiceKeys: questions.filter(q => q.kind === 'single_choice').map(q => `${q.questionKey} ${String(q.answerKey ?? '?')}`).join(' · '),
    trueFalseKeys: questions.filter(q => q.kind === 'true_false_group').map(q => `${q.questionKey}: ${(q.statements ?? []).map(s => `${s.id} ${(q.answerKey as Record<string, boolean> | undefined)?.[s.id] ? 'Đ' : 'S'}`).join(' ')}`).join(' · '),
  };
}
