import { apiClient } from './client';
import { queryClient } from '../config/query';
import type { Assessment, AssessmentContext, AssessmentList, AssessmentSubmission, CreateAssessmentInput, ExamVersion, FinalizationItem } from '../types/assessment.types';
const base = '/assessments';
const get = async <T>(path: string, params?: Record<string, unknown>): Promise<T> => (await apiClient.get<T>(`${base}${path}`, { cache: false, params })).data;
const command = async <T>(path: string, data: unknown, key: string = crypto.randomUUID()): Promise<T> => (await apiClient.post<T>(`${base}${path}`, data, { cache: false, headers: { 'Idempotency-Key': key } })).data;
async function invalidateGrades() {
  await apiClient.storage.clear?.();
  await queryClient.invalidateQueries({ predicate: ({ queryKey }) => queryKey[0] === 'assessments' || queryKey[0] === 'grades' || (queryKey[0] === 'parent' && queryKey.includes('grades')) });
}
export const assessmentApi = {
  context: () => get<AssessmentContext>('/context'),
  roster: async (classId: string, subjectId: string) => (await get<{ items: { id: number; displayName: string; studentCode?: string }[] }>('/context/roster', { classId, subjectId })).items,
  list: (classId?: string, subjectId?: string, page = 1) => get<AssessmentList<Assessment>>('', { classId, subjectId, page, limit: 100 }),
  create: (data: CreateAssessmentInput) => { const { academicYearId: _year, ...body } = data; void _year; return command<Assessment>('', body); },
  detail: (id: string) => get<Assessment>(`/${id}`),
  submissions: (id: string, page = 1) => get<AssessmentList<AssessmentSubmission>>(`/${id}/submissions`, { page, limit: 100 }),
  submission: (id: string, sid: string) => get<AssessmentSubmission>(`/${id}/submissions/${sid}`),
  progress: (id: string) => get<{ counts?: Record<string, number>; jobs?: { id: string; state: string; lastErrorCode?: string }[]; warnings?: string[] }>(`/${id}/progress`),
  createSubmission: (id: string, studentId?: number) => command<AssessmentSubmission>(`/${id}/submissions`, { clientGroupId: crypto.randomUUID(), ...(studentId ? { studentId } : {}) }),
  async upload(id: string, sid: string, file: File) {
    const asset = await command<{ assetId: string; upload: { method: string; url: string; fields?: Record<string, string>; requiredHeaders?: Record<string, string> } }>(`/${id}/uploads`, { submissionId: sid, purpose: 'student_work', name: file.name, mime: file.type, byteSize: file.size });
    let body: BodyInit = file;
    if (asset.upload.fields) {
      const form = new FormData();
      Object.entries(asset.upload.fields).forEach(([key, value]) => form.append(key, value));
      form.append('file', file); body = form;
    }
    // Signed storage requests must never inherit the application's JWT.
    const response = await fetch(asset.upload.url, { method: asset.upload.method, headers: asset.upload.requiredHeaders, body, credentials: 'omit', cache: 'no-store' });
    if (!response.ok) throw new Error(`Tải tệp thất bại (${response.status})`);
    return command(`/${id}/assets/${asset.assetId}/complete`, {});
  },
  process: (id: string, submissions: AssessmentSubmission[]) => command(`/${id}/process`, { submissionIds: submissions.map(s => s.id), expectedInputRevisions: Object.fromEntries(submissions.map(s => [s.id, s.inputRevision])) }),
  exam: (id: string, version: string) => get<ExamVersion>(`/${id}/exam-versions/${version}`),
  draftExam: (id: string, examCode: string, document: Record<string, unknown>) => command<ExamVersion>(`/${id}/exam-versions`, { examCode, document }),
  approveExam: (id: string, version: ExamVersion) => command(`/${id}/exam-versions/${version.id}/approve`, { expectedVersionHash: version.gradingSpecHash, applyTo: 'unpublished' }),
  identity: async (id: string, s: AssessmentSubmission, studentId: number) => (await apiClient.patch(`${base}/${id}/submissions/${s.id}/identity`, { studentId, expectedIdentityRevision: s.identityRevision }, { cache: false })).data,
  correctAnswer: async (id: string, s: AssessmentSubmission, questionKey: string, answerRevisionId: string, content: unknown, reason: string) => (await apiClient.patch(`${base}/${id}/submissions/${s.id}/answers/${encodeURIComponent(questionKey)}`, { expectedInputRevision: s.inputRevision, expectedAnswerRevisionId: answerRevisionId, content, reason }, { cache: false })).data,
  review: (id: string, s: AssessmentSubmission, overrides: { questionKey: string; earnedUnits: number; reason: string }[], flagResolutions: { code: string; questionKey: string; action: 'confirm_drawing' | 'confirm_score'; reason: string }[] = []) => command(`/${id}/submissions/${s.id}/reviews`, { expectedReviewRevisionId: s.currentReview?.id, overrides, flagResolutions }),
  async finalize(id: string, items: FinalizationItem[], key: string) {
    const result = await command<{ items: { submissionId: string; outcome: string; message?: string; score?: number }[] }>(`/${id}/finalizations`, { items }, key);
    await invalidateGrades(); return result;
  },
  async withdraw(id: string, publicationId: string, revision: number, reason: string) {
    const result = await command(`/${id}/publications/${publicationId}/withdraw`, { expectedPublicationRevision: revision, reason });
    await invalidateGrades(); return result;
  },
  access: (id: string, assetId: string) => get<{ url: string }>(`/${id}/assets/${assetId}/access`),
  pageAccess: (id:string,pageId:string,original=false)=>get<{url:string}>(`/${id}/pages/${pageId}/access${original?'?source=original':''}`),
  selectPrimary:async(id:string,pageId:string,inputRevision:number,primaryPolygon:[number,number][]) => (await apiClient.patch(`${base}/${id}/pages/${pageId}/selection`,{expectedInputRevision:inputRevision,primaryPolygon},{cache:false})).data as unknown,
  requestExport: (id:string,format:'xlsx'|'pdf')=>command<{exportId:string;jobId:string}>(`/${id}/exports`,{format}),
  exportStatus: (id:string,exportId:string)=>get<{state:string;errorCode?:string}>(`/${id}/exports/${exportId}`),
  exportAccess: (id:string,exportId:string)=>get<{url:string}>(`/${id}/exports/${exportId}/access`),
  retry: (id: string, jobId: string) => command(`/${id}/jobs/${jobId}/retry`, {}),
};
