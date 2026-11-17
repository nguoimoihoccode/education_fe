import { describe, expect, it } from 'vitest';
import type { ExamImport, ExamVersion } from '@/types/assessment.types';
import { quickReview } from './examQuickReview';

const questions = [
  { questionKey: 'I.1', kind: 'single_choice', maxUnits: 250, options: [{ id: 'A' }, { id: 'B' }], answerKey: 'B' },
  { questionKey: 'I.2', kind: 'true_false_group', maxUnits: 1000, statements: [{ id: 'a' }, { id: 'b' }], answerKey: { a: true, b: false }, scoringPolicy: { kind: 'count_map', unitsByCorrectCount: [0, 250, 1000] } },
  { questionKey: 'II.1', kind: 'rubric_text', maxUnits: 750, criteria: [{ maxUnits: 500 }, { maxUnits: 250 }] },
];
const version = (qs: unknown[]) => ({ id: 'v', examCode: '101', state: 'draft', gradingSpecHash: 'h', document: { questions: qs } }) as ExamVersion;
const source = (extra: Partial<ExamImport> = {}) => ({ jobId: 'j', assetId: 'x', examCode: '101', state: 'succeeded', warnings: [], ...extra }) as ExamImport;

describe('quickReview', () => {
  it('allows one-click approval of a clean Word import and summarises the key', () => {
    const review = quickReview(version(questions), source(), 2000);
    expect(review.eligible).toBe(true);
    expect(review.summary).toBe('3 câu · 2 điểm: 1 trắc nghiệm, 1 đúng/sai, 1 tự luận theo tiêu chí');
    expect(review.choiceKeys).toBe('I.1 B');
    expect(review.trueFalseKeys).toBe('I.2: a Đ b S');
  });
  it('sends the teacher to the full review on warnings, a wrong total, a missing key or no Word source', () => {
    expect(quickReview(version(questions), source({ warnings: ['Câu II.1: chưa ghép được'] }), 2000).reasons).toContain('File Word có 1 cảnh báo cần xem.');
    expect(quickReview(version(questions), source(), 3000).eligible).toBe(false);
    expect(quickReview(version([{ ...questions[0], answerKey: null }, questions[1], questions[2]]), source(), 2000).reasons).toContain('Câu I.1 chưa đủ đáp án hoặc tiêu chí.');
    expect(quickReview(version(questions), undefined, 2000).reasons).toContain('Đáp án không được đọc từ file Word chính thức.');
    expect(quickReview(version(questions), source({ state: 'running' }), 2000).eligible).toBe(false);
  });
});
