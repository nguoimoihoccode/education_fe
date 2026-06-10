import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { authApi } from '@/api/auth.api';
import SessionManagement from './SessionManagement';

vi.mock('@/api/auth.api', async () => {
  const actual = await vi.importActual<typeof import('@/api/auth.api')>('@/api/auth.api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      getMySessions: vi.fn(),
      revokeMySession: vi.fn(),
      revokeOtherSessions: vi.fn(),
    },
  };
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SessionManagement />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SessionManagement', () => {
  it('renders current badge and session metadata', async () => {
    vi.mocked(authApi.getMySessions).mockResolvedValue([
      {
        tokenId: 'current-token',
        userId: 1,
        email: 'user@example.com',
        device: 'Desktop',
        browser: 'Chrome',
        os: 'macOS',
        ipAddress: '127.0.0.1',
        createdAt: '2026-06-01T10:00:00Z',
        lastUsedAt: '2026-06-10T10:00:00Z',
        expiresAt: '2026-06-30T10:00:00Z',
        isRevoked: false,
        isCurrentSession: true,
      },
    ]);

    renderPage();

    expect(await screen.findByText('Phiên hiện tại')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText(/Chrome/)).toBeInTheDocument();
    expect(screen.getByText(/macOS/)).toBeInTheDocument();
    expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng xuất thiết bị khác/i })).toBeInTheDocument();
  });
});
