import { describe, expect, it } from 'vitest';
import type { AssessmentSubmission } from '@/types/assessment.types';
import { needsAttention, proposedUnits } from './assessmentReview';
import { jobErrorMessage } from './assessmentScores';

const base = { id: 's', studentId: 1, identityState: 'confirmed', identityRevision: 1, inputRevision: 1, processingState: 'idle', answers: [], pages: [] } as unknown as AssessmentSubmission;
const review = (flags: unknown[] = []) => ({ id: 'r', contentHash: 'h', earnedUnits: 500, ungradedMaxUnits: 0, flags, effectiveResults: [] }) as unknown as AssessmentSubmission['currentReview'];

describe('needsAttention', () => {
  it('flags failed, unidentified, manual-only and unapproved-reviewed submissions', () => {
    expect(needsAttention({ ...base, processingState: 'failed' })).toBe(true);
    expect(needsAttention({ ...base, studentId: null, identityState: 'unresolved' })).toBe(true);
    expect(needsAttention({ ...base, manualOnly: true })).toBe(true);
    expect(needsAttention({ ...base, currentReview: review() })).toBe(true);
  });
  it('leaves alone work that is running, not yet processed, approved or published', () => {
    expect(needsAttention({ ...base, processingState: 'running', currentReview: review() })).toBe(false);
    expect(needsAttention(base)).toBe(false);
    expect(needsAttention({ ...base, currentReview: review(), reviewApproved: true })).toBe(false);
    expect(needsAttention({ ...base, currentReview: review(), publication: { state: 'active' } } as unknown as AssessmentSubmission)).toBe(false);
  });
});

describe('proposedUnits', () => {
  it('returns the AI score for a question and null when ungraded or unknown', () => {
    const results = [{ questionKey: 'II.1.a', earnedUnits: 500 }, { questionKey: 'II.3', earnedUnits: null }];
    expect(proposedUnits({ effectiveResults: results }, 'II.1.a')).toBe(500);
    expect(proposedUnits({ effectiveResults: results }, 'II.3')).toBeNull();
    expect(proposedUnits({ effectiveResults: results }, 'X')).toBeNull();
    expect(proposedUnits({ effectiveResults: 'nope' }, 'II.1.a')).toBeNull();
  });
});

describe('jobErrorMessage', () => {
  it('explains known codes and never shows a raw code', () => {
    expect(jobErrorMessage('attempt_limit')).toContain('3 lần');
    expect(jobErrorMessage('something_new')).not.toContain('something_new');
    expect(jobErrorMessage(undefined)).toContain('Cần kiểm tra');
  });
});
