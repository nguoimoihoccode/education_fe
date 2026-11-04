import { afterEach, expect, it } from 'vitest';
import { apiClient, clearApiSessionState } from './client';
import { useAuthStore } from '../store/auth.store';
afterEach(() => { clearApiSessionState(); useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false }); });
it('rejects a private response from session A that arrives after session B starts', async () => {
  useAuthStore.setState({ accessToken: 'A', isAuthenticated: true });
  let finish: (() => void) | undefined;
  const pending = apiClient.get('/assessments/private', { cache: false, adapter: config => new Promise(resolve => { finish = () => resolve({ status: 200, statusText: 'OK', data: { student: 'A' }, headers: {}, config }); }) });
  const outcome = pending.then(() => 'leaked', () => 'cancelled');
  while (!finish) await Promise.resolve();
  useAuthStore.getState().logout();
  useAuthStore.setState({ accessToken: 'B', isAuthenticated: true });
  finish();
  expect(await outcome).toBe('cancelled');
  expect(useAuthStore.getState().accessToken).toBe('B');
});
it('session B fetches its own same-URL data after session A cached a response', async () => {
  let calls = 0;
  const read = () => apiClient.get('/privacy-same-url', { adapter: async config => ({ status: 200, statusText: 'OK', headers: {}, config, data: { token: config.headers.Authorization, call: ++calls } }) });
  useAuthStore.setState({ accessToken: 'A', isAuthenticated: true });
  expect((await read()).data.token).toBe('Bearer A');
  expect((await read()).data.token).toBe('Bearer A');
  expect(calls).toBe(1);
  useAuthStore.getState().logout();
  useAuthStore.setState({ accessToken: 'B', isAuthenticated: true });
  expect((await read()).data.token).toBe('Bearer B');
  expect(calls).toBe(2);
});
