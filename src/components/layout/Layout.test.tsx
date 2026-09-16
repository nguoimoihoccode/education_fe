import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/auth.store';
import { Layout } from './Layout';

// The shell renders a <footer>; a bypassed Layout renders nothing but children.
const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <div>Landing page</div>
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <div>Login page</div>
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <div>Register page</div>
            </Layout>
          }
        />
        <Route
          path="/today"
          element={
            <Layout>
              <div>Today page</div>
            </Layout>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

const shellIsRendered = () => document.querySelector('footer') !== null;

describe('Layout shell bypass', () => {
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

  it('wraps authenticated pages in the app shell', () => {
    renderAt('/today');

    expect(screen.getByText('Today page')).toBeInTheDocument();
    expect(shellIsRendered()).toBe(true);
  });

  it('renders auth pages standalone', () => {
    renderAt('/login');

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(shellIsRendered()).toBe(false);
  });

  it('renders the landing page standalone', () => {
    renderAt('/');

    expect(screen.getByText('Landing page')).toBeInTheDocument();
    expect(shellIsRendered()).toBe(false);
  });

  // React Router resolves "/login/" to path="/login", so a raw pathname
  // comparison used to miss it and wrap the login page in the shell -- which
  // showed the sidebar (with its own "Đăng nhập" button) around the login form.
  it('renders auth pages standalone when the path has a trailing slash', () => {
    renderAt('/login/');

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(shellIsRendered()).toBe(false);
  });

  it('renders auth pages standalone regardless of path casing', () => {
    renderAt('/Login');

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(shellIsRendered()).toBe(false);
  });

  it('renders auth pages standalone with a trailing slash and odd casing', () => {
    renderAt('/Register/');

    expect(screen.getByText('Register page')).toBeInTheDocument();
    expect(shellIsRendered()).toBe(false);
  });
});