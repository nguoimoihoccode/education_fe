import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { useWebSocket } from './useWebSocket';

const disconnect = vi.fn();
const emit = vi.fn();
const off = vi.fn();
const on = vi.fn();

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    disconnect,
    emit,
    off,
    on,
  })),
}));

describe('useWebSocket cleanup', () => {
  afterEach(() => {
    localStorage.clear();
    useAuthStore.setState({ accessToken: null });
    vi.clearAllMocks();
  });

  it('removes socket listeners before disconnecting', () => {
    useAuthStore.setState({ accessToken: 'token' });

    const { unmount } = renderHook(() =>
      useWebSocket({ symbols: ['AAA'], enabled: true }),
    );

    unmount();

    expect(off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(off).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(off).toHaveBeenCalledWith('price-update', expect.any(Function));
    expect(off).toHaveBeenCalledWith('chart-update', expect.any(Function));
    expect(disconnect).toHaveBeenCalled();
  });

  it('authenticates socket with the persisted auth store token', () => {
    localStorage.setItem('accessToken', 'stale-token');
    useAuthStore.setState({ accessToken: 'store-token' });

    renderHook(() => useWebSocket({ symbols: ['AAA'], enabled: true }));

    expect(io).toHaveBeenCalledWith('http://localhost:3000/prices', {
      auth: { token: 'store-token' },
      transports: ['websocket'],
    });
  });
});
