import { describe, expect, it, vi } from 'vitest';
import { authApi } from './auth.api';
import { apiClient, CACHE_PROFILES } from './client';

vi.mock('./client', () => ({
  CACHE_PROFILES: {
    NO_CACHE: { cache: false },
  },
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

describe('auth api sessions', () => {
  it('lists and revokes current user sessions with no cache', async () => {
    const sessions = [
      {
        tokenId: 'token-id',
        userId: 1,
        email: 'user@example.com',
        device: 'Desktop',
        browser: 'Chrome',
        os: 'macOS',
        createdAt: '2024-01-15T10:30:00Z',
        expiresAt: '2024-01-22T10:30:00Z',
        isRevoked: false,
        isCurrentSession: true,
      },
    ];

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: sessions });
    vi.mocked(apiClient.delete).mockResolvedValue({ data: { message: 'ok' } });

    await expect(authApi.getMySessions()).resolves.toBe(sessions);
    await authApi.revokeMySession('token-id');
    await authApi.revokeOtherSessions();

    expect(apiClient.get).toHaveBeenCalledWith('/auth/sessions', CACHE_PROFILES.NO_CACHE);
    expect(apiClient.delete).toHaveBeenCalledWith('/auth/sessions/token-id', { cache: false });
    expect(apiClient.delete).toHaveBeenCalledWith('/auth/sessions', { cache: false });
  });

  it('lists and revokes admin sessions with filters and no cache', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { message: 'ok' } });

    await expect(
      authApi.getAdminSessions({ userId: 1, email: 'user@example.com', active: true })
    ).resolves.toEqual([]);
    await authApi.revokeAdminSession('token-id');

    expect(apiClient.get).toHaveBeenCalledWith('/auth/admin/sessions', {
      params: { userId: 1, email: 'user@example.com', active: true },
      ...CACHE_PROFILES.NO_CACHE,
    });
    expect(apiClient.delete).toHaveBeenCalledWith('/auth/admin/sessions/token-id', { cache: false });
  });
});
