import type { AssessmentSubmission } from '@/types/assessment.types';

export function canApproveReview(submission: AssessmentSubmission): boolean {
  const review = submission.currentReview;
  return !!review?.contentHash &&
    !['queued', 'running'].includes(submission.processingState) &&
    submission.studentId !== null &&
    ['confirmed', 'proposed'].includes(submission.identityState) &&
    review.earnedUnits !== null &&
    review.ungradedMaxUnits === 0 &&
    !review.flags.some(flag => flag.severity === 'blocking' && flag.resolutionState !== 'resolved');
}

export function canFinalizeReview(submission: AssessmentSubmission): boolean {
  return submission.reviewApproved === true && canApproveReview(submission);
}

/** A submission the teacher still has to look at: failed, unidentified, manual-only, or reviewed but not yet approved. */
export function needsAttention(submission: AssessmentSubmission): boolean {
  if (submission.publication?.state === 'active' || submission.reviewApproved) return false;
  if (['queued', 'running'].includes(submission.processingState)) return false;
  if (['failed', 'paused'].includes(submission.processingState) || submission.manualOnly) return true;
  if (submission.studentId === null || ['unresolved', 'conflict'].includes(submission.identityState)) return true;
  return !!submission.currentReview;
}

/** The AI's proposed score (in units) for one question, or null when the AI left it ungraded. */
export function proposedUnits(review: { effectiveResults: unknown }, questionKey: string): number | null {
  if (!Array.isArray(review.effectiveResults)) return null;
  const result = review.effectiveResults.find(
    (item): item is Record<string, unknown> => typeof item === 'object' && item !== null && (item as Record<string, unknown>).questionKey === questionKey,
  );
  return typeof result?.earnedUnits === 'number' ? result.earnedUnits : null;
}
