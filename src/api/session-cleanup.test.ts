import { afterEach, expect, it, vi } from 'vitest';
import { clearClientSessionStorage } from './session-cleanup';
import { queryClient } from '../config/query';
afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); queryClient.clear(); });
it('removes session A private evidence and API/query caches before session B reads', async () => {
  const entries = new Map([['images-cache', 'paper A'], ['private-evidence', 'paper A']]);
  vi.stubGlobal('caches', { keys: async () => [...entries.keys()], delete: async (key: string) => entries.delete(key) });
  sessionStorage.setItem('edupro-api-cache:grades', 'student A');
  queryClient.setQueryData(['assessments', 'A'], { name: 'student A' });
  await clearClientSessionStorage();
  expect(entries.size).toBe(0);
  expect(sessionStorage.getItem('edupro-api-cache:grades')).toBeNull();
  expect(queryClient.getQueryData(['assessments', 'A'])).toBeUndefined();
});
it('still clears synchronous session data when browser CacheStorage is unavailable', async () => {
  vi.stubGlobal('caches', undefined);
  localStorage.setItem('auth-storage', 'A');
  await clearClientSessionStorage();
  expect(localStorage.getItem('auth-storage')).toBeNull();
});
it('normal logout removes private browser caches as well as auth state', async () => {
  const { useAuthStore } = await import('../store/auth.store');
  const remove = vi.fn(async () => true);
  vi.stubGlobal('caches', { keys: async () => ['private-evidence'], delete: remove });
  useAuthStore.setState({ accessToken: 'session-A', isAuthenticated: true });
  useAuthStore.getState().logout();
  await vi.waitFor(() => expect(remove).toHaveBeenCalledWith('private-evidence'));
  expect(useAuthStore.getState().accessToken).toBeNull();
});
