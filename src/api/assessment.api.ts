import { artifactSessionGeneration, createPrivateArtifactUrl } from './private-artifacts';
import { apiClient } from './client';
import { queryClient } from '../config/query';
import type { AiAgreement, Assessment, AssessmentCostReport, PilotScope, PilotSchoolCatalog, PilotState, SchoolGradingCostSummary, AssessmentAssetStatus, AssessmentContext, AssessmentList, AssessmentSubmission, AssessmentUploadPlan, CreateAssessmentInput, ExamImport, ExamVersion, ExternalTextPreview, FinalizationItem } from '../types/assessment.types';
const base = '/assessments';
const get = async <T>(path: string, params?: Record<string, unknown>): Promise<T> => (await apiClient.get<T>(`${base}${path}`, { cache: false, params })).data;
const command = async <T>(path: string, data: unknown, key: string = crypto.randomUUID()): Promise<T> => (await apiClient.post<T>(`${base}${path}`, data, { cache: false, headers: { 'Idempotency-Key': key } })).data;
let nextClassUploadRequest = 0;
async function paceClassUpload() {
  // The assessment routes share the proxy's general request bucket with other API calls.
  const now = Date.now();
  const start = Math.max(now, nextClassUploadRequest);
  nextClassUploadRequest = start + 180;
  if (start > now) await new Promise(resolve => setTimeout(resolve, start - now));
}
async function invalidateGrades() {
  await apiClient.storage.clear?.();
  await queryClient.invalidateQueries({ predicate: ({ queryKey }) => queryKey[0] === 'assessments' || queryKey[0] === 'grades' || (queryKey[0] === 'parent' && queryKey.includes('grades')) });
}
export const assessmentDocxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
type SignedUpload = { method: string; url: string; fields?: Record<string, string>; requiredHeaders?: Record<string, string> };
type SignedAsset = { assetId: string; upload: SignedUpload | null };

const uploadRetryDelaysMs = [1000, 3000];
const retryableStatus = (status: number) => status === 408 || status === 429 || status >= 500;
async function uploadSignedFile(upload: SignedUpload, file: File) {
  let failure: Error | undefined;
  // Network drops and 5xx are transient; an expired or rejected signature (4xx) needs a fresh link, so it is not retried.
  for (let attempt = 0; attempt <= uploadRetryDelaysMs.length; attempt += 1) {
    if (attempt > 0) await new Promise(resolve => setTimeout(resolve, uploadRetryDelaysMs[attempt - 1]));
    let body: BodyInit = file;
    if (upload.fields) {
      const form = new FormData();
      Object.entries(upload.fields).forEach(([key, value]) => form.append(key, value));
      form.append('file', file);
      body = form;
    }
    try {
      // Signed storage requests must never inherit the application's JWT.
      const response = await fetch(upload.url, {
        method: upload.method,
        headers: upload.requiredHeaders,
        body,
        credentials: 'omit',
        cache: 'no-store',
        signal: AbortSignal.timeout(840000),
      });
      if (response.ok) return;
      failure = new Error(`Tải tệp thất bại (${response.status})`);
      if (!retryableStatus(response.status)) throw failure;
    } catch (error) {
      if (error === failure && failure) throw failure;
      failure = new Error('Tải tệp thất bại do mất kết nối. Vui lòng thử lại.');
    }
  }
  throw failure ?? new Error('Tải tệp thất bại');
}
async function readPrivateArtifact(path: string): Promise<{ url: string }> {
  const generation = artifactSessionGeneration();
  const response = await apiClient.get<Blob>(`${base}${path}`, {
    cache: false,
    responseType: 'blob',
    timeout: 60000,
    headers: { 'Cache-Control': 'no-store' },
  });
  if (!(response.data instanceof Blob)) throw new Error('Không đọc được tệp riêng tư.');
  return { url: createPrivateArtifactUrl(response.data, generation) };
}

export const assessmentApi = {
  context: () => get<AssessmentContext>('/context'),
  roster: async (classId: string, subjectId: string) => (await get<{ items: { id: number; displayName: string; studentCode?: string }[] }>('/context/roster', { classId, subjectId })).items,
  list: (classId?: string, subjectId?: string, page = 1) => get<AssessmentList<Assessment>>('', { classId, subjectId, page, limit: 100 }),
  create: (data: CreateAssessmentInput) => { const { academicYearId: _year, ...body } = data; void _year; return command<Assessment>('', body); },
  detail: (id: string) => get<Assessment>(`/${id}`),
  submissions: (id: string, page = 1) => get<AssessmentList<AssessmentSubmission>>(`/${id}/submissions`, { page, limit: 100 }),
  submission: (id: string, sid: string) => get<AssessmentSubmission>(`/${id}/submissions/${sid}`),
  progress: (id: string) => get<{ counts?: Record<string, number>; jobs?: { id: string; state: string; stage?: string; submissionId?: string | null; inputRevision?: number; lastErrorCode?: string }[]; warnings?: string[] }>(`/${id}/progress`),
  async createSubmission(id: string, studentId?: number, group?: { clientGroupId: string; files: AssessmentUploadPlan[] }) {
    if (group) await paceClassUpload();
    return command<AssessmentSubmission>(`/${id}/submissions`, {
      clientGroupId: group?.clientGroupId ?? crypto.randomUUID(),
      ...(studentId ? { studentId } : {}),
      ...(group ? { files: group.files } : {}),
    });
  },
  async upload(id: string, sid: string, file: File, clientFileId?: string) {
    if (clientFileId) await paceClassUpload();
    const asset = await command<SignedAsset>(`/${id}/uploads`, {
      submissionId: sid,
      purpose: 'student_work',
      name: file.name,
      mime: file.type,
      byteSize: file.size,
      ...(clientFileId ? { clientFileId } : {}),
    });
    if (!asset.upload) return;
    await uploadSignedFile(asset.upload, file);
    if (clientFileId) await paceClassUpload();
    await command(`/${id}/assets/${asset.assetId}/complete`, {});
  },
  async uploadExamSource(id: string, file: File) {
    const asset = await command<SignedAsset>(`/${id}/uploads`, {
      purpose: 'marking_guide',
      name: file.name,
      mime: assessmentDocxMime,
      byteSize: file.size,
    });
    if (asset.upload) {
      await uploadSignedFile(asset.upload, file);
      await command(`/${id}/assets/${asset.assetId}/complete`, {});
    }
    return asset.assetId;
  },
  /** A scanned or PDF marking guide. The worker transcribes it and uses it to draft the key from exam pages found in student papers. */
  async uploadMarkingGuide(id: string, file: File) {
    const asset = await command<SignedAsset>(`/${id}/uploads`, { purpose: 'marking_guide', name: file.name, mime: file.type, byteSize: file.size });
    if (asset.upload) {
      await uploadSignedFile(asset.upload, file);
      await command(`/${id}/assets/${asset.assetId}/complete`, {});
    }
    return asset.assetId;
  },
  aiAgreement: (id: string) => get<AiAgreement>(`/${id}/ai-agreement`),
  costs: (id: string) => get<AssessmentCostReport>(`/${id}/costs`),
  /** Principal/ADMIN: the caller's school, at most 92 Vietnam days. */
  costSummary: (from: string, to: string) => get<SchoolGradingCostSummary>('/cost-summary', { from, to }),
  /** ADMIN only. */
  pilotScopes: async (schoolId?: string) => (await get<{ items: PilotScope[] }>('/pilot-scopes', schoolId ? { schoolId } : undefined)).items,
  pilotCatalog: (schoolId?: string) => get<{ items: PilotScope[]; schools?: PilotSchoolCatalog[] }>('/pilot-scopes', schoolId ? { schoolId } : undefined),
  setPilotScope: async (body: { classId: string; subjectId: string; state: PilotState; reason: string; expectedRevision?: number }) => (await apiClient.put<PilotScope>(`${base}/pilot-scopes`, body, { cache: false })).data,
  assetStatus: (id: string, assetId: string) => get<AssessmentAssetStatus>(`/${id}/assets/${assetId}/status`),
  requestExamImport: (id: string, assetId: string, examCode: string, key: string) => command<{ jobId: string }>(`/${id}/exam-imports`, { assetId, examCode }, key),
  examImportStatus: (id: string, jobId: string) => get<ExamImport>(`/${id}/exam-imports/${jobId}`),
  process: (id: string, submissions: AssessmentSubmission[]) => command<{ jobIds: string[]; skipped?: string[] }>(`/${id}/process`, { readyOnly: true, submissionIds: submissions.map(s => s.id), expectedInputRevisions: Object.fromEntries(submissions.map(s => [s.id, s.inputRevision])) }),
  exam: (id: string, version: string) => get<ExamVersion>(`/${id}/exam-versions/${version}`),
  externalTextPreview: (id: string, submissionId: string) =>
    get<ExternalTextPreview>(`/${id}/submissions/${submissionId}/external-text`),
  releaseExternalText: (id: string, submissionId: string, expectedInputRevision: number, hashes: Record<string, string>) =>
    command(`/${id}/submissions/${submissionId}/external-text`, { expectedInputRevision, hashes }),
  revokeExternalText: (id: string, submission: AssessmentSubmission) =>
    command(`/${id}/submissions/${submission.id}/external-text/revoke`, { expectedInputRevision: submission.inputRevision }),
  selectManualOnly: (id: string, submission: AssessmentSubmission) =>
    command(`/${id}/submissions/${submission.id}/manual-only`, { expectedInputRevision: submission.inputRevision }),
  draftExam: (id: string, examCode: string, document: Record<string, unknown>, sourceVersionId?: string) => command<ExamVersion>(`/${id}/exam-versions`, { examCode, document, ...(sourceVersionId ? { sourceVersionId } : {}) }),
  approveExam: (id: string, version: ExamVersion) => command<{ jobIds?: string[] }>(`/${id}/exam-versions/${version.id}/approve`, { expectedVersionHash: version.gradingSpecHash, applyTo: 'unpublished' }),
  examImpact: (id: string, versionId: string) => get<{ submissionCount: number; questionCount: number }>(`/${id}/exam-versions/${versionId}/impact`),
  identity: async (id: string, s: AssessmentSubmission, studentId: number) => (await apiClient.patch(`${base}/${id}/submissions/${s.id}/identity`, { studentId, expectedIdentityRevision: s.identityRevision }, { cache: false })).data,
  assignExamVersion: (id: string, s: AssessmentSubmission, examVersionId: string) => command(`/${id}/submissions/${s.id}/exam-version`, { examVersionId, expectedInputRevision: s.inputRevision }),
  correctAnswer: async (id: string, s: AssessmentSubmission, questionKey: string, answerRevisionId: string, content: unknown, reason: string) => (await apiClient.patch(`${base}/${id}/submissions/${s.id}/answers/${encodeURIComponent(questionKey)}`, { expectedInputRevision: s.inputRevision, expectedAnswerRevisionId: answerRevisionId, content, reason }, { cache: false })).data,
  review: (id: string, s: AssessmentSubmission, overrides: { questionKey: string; earnedUnits: number; reason: string }[], flagResolutions: { code: string; questionKey: string; action: 'confirm_drawing' | 'confirm_score'; reason: string }[] = []) => command(`/${id}/submissions/${s.id}/reviews`, { expectedReviewRevisionId: s.currentReview?.id, overrides, flagResolutions }),
  approveReview: (id: string, s: AssessmentSubmission, contextRevision: number) => command<{ reviewApproved: boolean; reviewRevisionId: string }>(`/${id}/submissions/${s.id}/review-approval`, {
    expectedInputRevision: s.inputRevision,
    expectedIdentityRevision: s.identityRevision,
    expectedReviewRevisionId: s.currentReview?.id,
    expectedReviewHash: s.currentReview?.contentHash,
    expectedContextRevision: contextRevision,
  }),
  manualReview: (id: string, s: AssessmentSubmission, version: ExamVersion, reason: string, scores: { questionKey: string; earnedUnits: number }[]) => command(`/${id}/submissions/${s.id}/manual-review`, {
    expectedInputRevision: s.inputRevision,
    expectedIdentityRevision: s.identityRevision,
    expectedReviewRevisionId: s.currentReview?.id ?? null,
    examVersionId: version.id,
    expectedVersionHash: version.gradingSpecHash,
    scores,
    reason,
  }),
  async finalize(id: string, items: FinalizationItem[], key: string) {
    const result = await command<{ items: { submissionId: string; outcome: string; message?: string; score?: number }[] }>(`/${id}/finalizations`, { items }, key);
    await invalidateGrades(); return result;
  },
  async withdraw(id: string, publicationId: string, revision: number, reason: string) {
    const result = await command(`/${id}/publications/${publicationId}/withdraw`, { expectedPublicationRevision: revision, reason });
    await invalidateGrades(); return result;
  },
  access: (id: string, assetId: string) => readPrivateArtifact(`/${id}/assets/${assetId}/content`),
  pageAccess: (id:string,pageId:string,original=false)=>readPrivateArtifact(`/${id}/pages/${pageId}/content${original?'?source=original':''}`),
  selectPrimary:async(id:string,pageId:string,inputRevision:number,primaryPolygon:[number,number][]) => (await apiClient.patch(`${base}/${id}/pages/${pageId}/selection`,{expectedInputRevision:inputRevision,primaryPolygon},{cache:false})).data as unknown,
  requestExport: (id:string,format:'xlsx'|'pdf')=>command<{exportId:string;jobId:string}>(`/${id}/exports`,{format}),
  exportStatus: (id:string,exportId:string)=>get<{state:string;errorCode?:string}>(`/${id}/exports/${exportId}`),
  exportAccess: (id:string,exportId:string)=>readPrivateArtifact(`/${id}/exports/${exportId}/content`),
  retry: (id: string, jobId: string) => command(`/${id}/jobs/${jobId}/retry`, {}),
};
