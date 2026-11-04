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
    expect(fetchMock).toHaveBeenCalledWith('https://storage.example/paper?signature=one', { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: paper, credentials: 'omit', cache: 'no-store' });
    expect(post.mock.calls[0][1]).toMatchObject({ submissionId: 's', purpose: 'student_work', name: 'paper.png' });
    expect(post.mock.calls[1][0]).toBe('/assessments/a/assets/asset/complete');
  } finally { vi.unstubAllGlobals(); }
});
