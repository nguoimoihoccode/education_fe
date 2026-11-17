import { afterEach, expect, it, vi } from 'vitest';
import { apiClient } from './client';
import { assessmentApi } from './assessment.api';
import { queryClient } from '../config/query';
afterEach(() => { vi.restoreAllMocks(); queryClient.clear(); });
it('never serves staff assessment reads from Axios cache', async () => {
  const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} });
  await assessmentApi.context(); await assessmentApi.detail('a'); await assessmentApi.submissions('a'); await assessmentApi.progress('a'); await assessmentApi.submission('a', 's');
  expect(get.mock.calls).toHaveLength(5);
  for (const call of get.mock.calls) expect(call[1]).toMatchObject({ cache: false });
});
it('finalizes the exact reviewed revisions without accepting a client score and invalidates grade views', async () => {
  const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { items: [] } });
  const clear = vi.spyOn(apiClient.storage, 'clear').mockResolvedValue(undefined);
  queryClient.setQueryData(['grades', 'report'], 'old');
  queryClient.setQueryData(['parent', 'children', 1, 'grades'], 'old');
  const items = [{ submissionId: 's', expectedInputRevision: 2, expectedReviewRevisionId: 'r', expectedReviewHash: 'hash', expectedContextRevision: 1, expectedPublicationRevision: null, identityAcknowledgement: { studentId: 4, expectedIdentityRevision: 1 } }];
  await assessmentApi.finalize('a', items, 'stable-key');
  expect(post).toHaveBeenCalledWith('/assessments/a/finalizations', { items }, expect.objectContaining({ headers: { 'Idempotency-Key': 'stable-key' } }));
  expect(clear).toHaveBeenCalled();
  expect(queryClient.getQueryState(['grades', 'report'])?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(['parent', 'children', 1, 'grades'])?.isInvalidated).toBe(true);
});
it('uploads grouped paper bytes directly to signed storage without forwarding teacher credentials', async () => {
  const post = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { assetId: 'asset', upload: { method: 'PUT', url: 'https://storage.example/paper?signature=one', requiredHeaders: { 'Content-Type': 'image/png' } } } }).mockResolvedValueOnce({ data: { state: 'verifying' } });
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', fetchMock);
  try {
    const paper = new File(['paper'], 'paper.png', { type: 'image/png' });
    await assessmentApi.upload('a', 's', paper);
    expect(fetchMock).toHaveBeenCalledWith('https://storage.example/paper?signature=one', { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: paper, credentials: 'omit', cache: 'no-store', signal: expect.any(AbortSignal) });
    expect(post.mock.calls[0][1]).toMatchObject({ submissionId: 's', purpose: 'student_work', name: 'paper.png' });
    expect(post.mock.calls[1][0]).toBe('/assessments/a/assets/asset/complete');
  } finally { vi.unstubAllGlobals(); }
});

it('uploads the official Word source without binding it to a student and requests import by exact exam code', async () => {
  const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const url = 'https://storage.example/guide?signature=one';
  const post = vi.spyOn(apiClient, 'post')
    .mockResolvedValueOnce({ data: { assetId: 'guide', upload: { method: 'PUT', url, requiredHeaders: { 'Content-Type': mime } } } })
    .mockResolvedValueOnce({ data: { state: 'verifying' } })
    .mockResolvedValueOnce({ data: { jobId: 'job' } });
  const get = vi.spyOn(apiClient, 'get')
    .mockResolvedValueOnce({ data: { state: 'sealed' } })
    .mockResolvedValueOnce({ data: { jobId: 'job', state: 'succeeded', versionId: 'draft' } });
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', fetchMock);
  try {
    const doc = new File(['guide'], 'Đề và đáp án.docx');
    expect(await assessmentApi.uploadExamSource('a', doc)).toBe('guide');
    expect(post.mock.calls[0][1]).toEqual({ purpose: 'marking_guide', name: doc.name, mime, byteSize: doc.size });
    expect(fetchMock).toHaveBeenCalledWith(url, expect.objectContaining({ body: doc, credentials: 'omit', cache: 'no-store' }));
    expect(post.mock.calls[1][0]).toBe('/assessments/a/assets/guide/complete');
    await expect(assessmentApi.assetStatus('a', 'guide')).resolves.toMatchObject({ state: 'sealed' });
    await expect(assessmentApi.requestExamImport('a', 'guide', '001', 'import-key')).resolves.toEqual({ jobId: 'job' });
    expect(post).toHaveBeenLastCalledWith('/assessments/a/exam-imports', { assetId: 'guide', examCode: '001' }, expect.objectContaining({ headers: { 'Idempotency-Key': 'import-key' } }));
    await expect(assessmentApi.examImportStatus('a', 'job')).resolves.toMatchObject({ versionId: 'draft' });
    expect(get.mock.calls.map(call => call[0])).toEqual(['/assessments/a/assets/guide/status', '/assessments/a/exam-imports/job']);
    for (const call of get.mock.calls) expect(call[1]).toMatchObject({ cache: false });
  } finally { vi.unstubAllGlobals(); }
});

it('retries a signed upload after a dropped connection or a 5xx but never after an expired link', async () => {
  vi.useFakeTimers();
  try {
    const file = new File(['x'], 'p.png', { type: 'image/png' });
    const send = () => (assessmentApi as unknown as { upload: typeof assessmentApi.upload }).upload('a', 's', file);
    const plan = { data: { assetId: 'asset', upload: { method: 'PUT', url: 'https://storage.example/p', requiredHeaders: {} } } };
    vi.spyOn(apiClient, 'post').mockResolvedValue(plan).mockResolvedValueOnce(plan);
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('network')).mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValueOnce({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const done = send();
    await vi.advanceTimersByTimeAsync(5000);
    await done;
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const expired = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    vi.stubGlobal('fetch', expired);
    await expect(send()).rejects.toThrow('403');
    expect(expired).toHaveBeenCalledTimes(1);
  } finally { vi.useRealTimers(); vi.unstubAllGlobals(); }
});
