import type { AssessmentSubmission } from '@/types/assessment.types';
export function canFinalizeReview(submission: AssessmentSubmission, acknowledgedHash?: string): boolean {
  const review = submission.currentReview;
  return !!review && !!review.contentHash && review.contentHash === acknowledgedHash && submission.studentId !== null && ['confirmed', 'proposed'].includes(submission.identityState) && review.earnedUnits !== null && review.ungradedMaxUnits === 0 && !review.flags.some(f => f.severity === 'blocking' && f.resolutionState !== 'resolved');
}
