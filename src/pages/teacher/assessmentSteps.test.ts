import { describe, expect, it } from 'vitest';
import type { AssessmentSubmission, ExamVersion } from '@/types/assessment.types';
import { assessmentSteps } from './assessmentSteps';

const version = (state: ExamVersion['state']) => ({ id: state, examCode: '101', state, gradingSpecHash: 'h', document: {} }) as ExamVersion;
const row = (extra: Partial<AssessmentSubmission>) => ({ id: Math.random().toString(), studentId: 1, identityState: 'confirmed', identityRevision: 1, inputRevision: 1, processingState: 'idle', answers: [], pages: [], ...extra }) as AssessmentSubmission;
const review = { id: 'r', contentHash: 'h', earnedUnits: 500, ungradedMaxUnits: 0, flags: [], effectiveResults: [] };
const states = (steps: ReturnType<typeof assessmentSteps>) => steps.map(step => step.state).join(' ');

describe('assessmentSteps', () => {
  it('starts at the answer key when nothing is approved', () => {
    const steps = assessmentSteps({ examVersions: [version('draft')] }, []);
    expect(states(steps)).toBe('current todo todo todo todo');
    expect(steps[0].detail).toBe('1 mã đề chờ duyệt');
  });
  it('moves to review once every paper is read and some still need the teacher', () => {
    const steps = assessmentSteps({ examVersions: [version('approved')] }, [row({ currentReview: review }), row({ currentReview: review, reviewApproved: true })]);
    expect(states(steps)).toBe('done done done current todo');
    expect(steps[3].detail).toBe('1 bài cần xem');
  });
  it('keeps processing current while papers are queued or never started', () => {
    expect(states(assessmentSteps({ examVersions: [version('approved')] }, [row({ processingState: 'running' })]))).toBe('done done current todo todo');
    expect(assessmentSteps({ examVersions: [version('approved')] }, [row({})])[2].detail).toBe('1 bài chưa xử lý');
  });
  it('is complete when every paper is in the grade book', () => {
    const published = row({ currentReview: review, reviewApproved: true, publication: { state: 'active' } as AssessmentSubmission['publication'] });
    expect(states(assessmentSteps({ examVersions: [version('approved')] }, [published]))).toBe('done done done done done');
  });
});
