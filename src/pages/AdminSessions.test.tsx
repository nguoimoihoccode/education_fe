import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { authApi } from '@/api/auth.api';
import AdminSessions from './AdminSessions';

vi.mock('@/api/auth.api', async () => {
  const actual = await vi.importActual<typeof import('@/api/auth.api')>('@/api/auth.api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      getAdminSessions: vi.fn(),
      revokeAdminSession: vi.fn(),
    },
  };
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminSessions />
    </QueryClientProvider>,
  );
}

describe('AdminSessions', () => {
  it('treats expired non-revoked sessions as inactive', async () => {
    vi.mocked(authApi.getAdminSessions).mockResolvedValue([
      {
        tokenId: 'expired-token',
        userId: 1,
        email: 'expired@example.com',
        device: 'Desktop',
        browser: 'Chrome',
        os: 'macOS',
        ipAddress: '127.0.0.1',
        createdAt: '2026-01-01T10:00:00Z',
        lastUsedAt: '2026-01-01T11:00:00Z',
        expiresAt: '2000-01-01T00:00:00Z',
        isRevoked: false,
        isCurrentSession: false,
      },
    ]);

    renderPage();

    expect(await screen.findByText('Đã hết hạn')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thu hồi phiên expired@example.com/i })).not.toBeInTheDocument();
  });
});
