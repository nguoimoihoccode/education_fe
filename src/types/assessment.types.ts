export type AssessmentCapabilities = { canCreate?: boolean; canProcess?: boolean; canReview?: boolean; canFinalize?: boolean };
export type AssessmentContextSubject = { id: string; name: string; pilotState?: PilotState; capabilities?: AssessmentCapabilities };
export type AssessmentContext = { enabled: boolean; capabilities: AssessmentCapabilities; classes: { id: string; name: string; academicYearId: string; subjects: AssessmentContextSubject[] }[] };
export type AssessmentFlag = { code: string; severity: 'blocking' | 'advisory'; questionKey?: string | null; message: string; resolutionState?: string; sourceRegionIds?: string[] };
export type AssessmentReview = { id: string; examVersionId?: string; contentHash: string; earnedUnits: number | null; ungradedMaxUnits: number; effectiveResults: unknown; flags: AssessmentFlag[] };
export type ExamVersion = { id: string; examCode: string; versionNumber?: number; sourceImportJobId?: string; state: 'draft' | 'approved' | 'superseded'; gradingSpecHash: string; document: Record<string, unknown> };
export type AssessmentAssetStatus = { state: string; sealState?: string; errorCode?: string };
export type ExamImport = { jobId: string; assetId: string; examCode: string; state: string; canRetry?: boolean; versionId?: string; warnings?: string[]; source?: Record<string, string>; errorCode?: string };
export type AssessmentExportSummary = { id: string; format: 'xlsx' | 'pdf' | string; createdAt: string; expiresAt: string };
export type Assessment = { externalTextEnabled?: boolean; id: string; title: string; classId: string; subjectId: string; academicYearId: string; contextRevision: number; maxScoreUnits: number; pilotState?: PilotState; capabilities: AssessmentCapabilities; examVersions?: ExamVersion[]; examImports?: ExamImport[]; exports?: AssessmentExportSummary[]; archivedAt?: string | null; roster?: { id: number; displayName: string; studentCode?: string }[] };
export type AssessmentUploadFile = { id: string; name: string; mime: string; byteSize: number; state: string; verificationFailed?: boolean };
export type AssessmentUploadPlan = { clientFileId: string; name: string; mime: string; byteSize: number };
export type AssessmentSubmission = { manualOnly?: boolean; id: string; studentId: number | null; displayName?: string; identityState: 'unresolved' | 'proposed' | 'confirmed' | 'conflict'; identityRevision: number; inputRevision: number; processingState: string; uploadReady?: boolean; uploads?: AssessmentUploadFile[]; currentReview?: AssessmentReview | null; reviewApproved?: boolean; publishedReview?: AssessmentReview | null; publication?: { id: string; revision: number; state: 'active' | 'withdrawn' } | null; pages?: { id: string; assetId: string; sourcePageNumber?: number; pageRole?: string; primaryPolygon?: [number,number][]; regions?: { id: string; role: string; text?: string; polygon?: [number,number][] }[] }[]; answers?: { questionKey: string; id: string; content: unknown; observationState: string }[] };
export type AssessmentList<T> = { items: T[]; total: number; page: number; limit: number };
export type FinalizationItem = { submissionId: string; expectedInputRevision: number; expectedReviewRevisionId: string; expectedReviewHash: string; expectedContextRevision: number; expectedPublicationRevision: number | null; identityAcknowledgement: { studentId: number; expectedIdentityRevision: number } };
export type CreateAssessmentInput = { title: string; classId: string; subjectId: string; academicYearId: string; examDate: string; term: number; testType: string; coefficient: number; maxScoreUnits: number };

export type ExternalTextPreview = {
  inputRevision: number;
  policy: string | null;
  items: {
    questionKey: string;
    hash: string;
    payload: { answer: string; criteria: { id: string; description: string; allowedUnits: number[] }[] };
  }[];
};

export type AgreementTally = { compared: number; agreed: number; absDiffUnits: number };
export type AiAgreement = { decidedSubmissions: number; compared: number; agreed: number; meanAbsDiffUnits: number | null; byConfidence: Record<'high' | 'medium' | 'low' | 'unknown', AgreementTally>; byQuestion: (AgreementTally & { questionKey: string })[] };
/** Micro-USD tally over grading provider calls; unknown calls are kept apart, never counted as zero. */
export type GradingCostTally = { calls: number; inputTokens: number; outputTokens: number; knownCostMicros: number; unknownCostCalls: number; unknownReservedMicros: number };
export type AssessmentCostReport = GradingCostTally & {
  assessmentId: string; currency: 'USD'; knownCostUsd: number; upperBoundCostMicros: number; upperBoundCostUsd: number;
  finalizedSubmissions: number; knownCostPerFinalizedMicros: number | null; upperBoundCostPerFinalizedMicros: number | null;
  retries: GradingCostTally; byState: Record<string, number>;
  byPurpose: (GradingCostTally & { purpose: string })[];
  byModel: (GradingCostTally & { model: string; provider: string })[];
  byStage: { stage: string; calls: number; inputTokens: number; outputTokens: number; knownCostMicros: number; unknownCostCalls: number }[];
};
export type GradingCostBrief = { calls: number; inputTokens: number; outputTokens: number; knownCostMicros: number; knownCostUsd: number; unknownCostCalls: number; upperBoundCostMicros: number; knownCostPerFinalizedMicros: number | null };
export type SchoolGradingCostSummary = Omit<AssessmentCostReport, 'assessmentId' | 'byStage'> & {
  from: string; to: string; timeZone: string;
  byDay: (GradingCostBrief & { day: string })[];
  byAssessment: (GradingCostBrief & { assessmentId: string; title: string | null; classId: string | null; subjectId: string | null; finalizedSubmissions: number })[];
};
export type PilotState = 'closed' | 'active' | 'paused';
export type PilotScope = { id: string; schoolId: string; schoolName?: string | null; classId: string; className: string | null; subjectId: string; subjectName: string | null; state: PilotState; revision: number; reason: string; updatedBy: number; updatedAt: string };
export type PilotSchoolCatalog = { id: string; name: string; classes: { id: string; name: string }[]; subjects: { id: string; name: string }[] };
