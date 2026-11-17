import { afterEach, expect, it, vi } from 'vitest';
import { apiClient } from './client';
import { assessmentApi } from './assessment.api';
import { clearClientSessionStorage } from './session-cleanup';

afterEach(async () => {
  await clearClientSessionStorage();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('fetches artifact bytes through the authenticated client without Axios cache', async () => {
  const create = vi.fn(() => 'blob:private-artifact');
  const revoke = vi.fn();
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke });
  const blob = new Blob(['paper'], { type: 'image/jpeg' });
  const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: blob });
  await expect(assessmentApi.pageAccess('exam', 'page', true)).resolves.toEqual({ url: 'blob:private-artifact' });
  expect(get).toHaveBeenCalledWith('/assessments/exam/pages/page/content?source=original',
    expect.objectContaining({ cache: false, responseType: 'blob' }));
  await clearClientSessionStorage();
  expect(revoke).toHaveBeenCalledWith('blob:private-artifact');
});

it('does not create an artifact URL when logout happens during a download', async () => {
  const create = vi.fn(() => 'blob:old-session');
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: vi.fn() });
  let finish!: (value: { data: Blob }) => void;
  vi.spyOn(apiClient, 'get').mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const read = assessmentApi.access('exam', 'asset');
  await clearClientSessionStorage();
  finish({ data: new Blob(['paper']) });
  await expect(read).rejects.toThrow('Phiên');
  expect(create).not.toHaveBeenCalled();
});
