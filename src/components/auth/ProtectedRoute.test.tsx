import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from './ProtectedRoute';

const renderProtectedRoute = (roles?: string[]) =>
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={roles}>
              <div>Admin content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('redirects unauthenticated users to login', () => {
    renderProtectedRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('renders authenticated users when no roles are required', () => {
    useAuthStore.setState({ isAuthenticated: true });

    renderProtectedRoute();

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('renders authenticated users with a matching role', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { roles: ['admin'] } as never,
    });

    renderProtectedRoute(['admin']);

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('redirects authenticated users without a required role', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { roles: ['student'] } as never,
    });

    renderProtectedRoute(['admin']);

    expect(screen.getByText('Unauthorized page')).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });
});
