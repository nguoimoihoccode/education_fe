import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Layout } from './Layout';

/* The marketing landing and the auth pages sit outside the app shell and carry
   their own light palette, so the theme must leave them alone. Layout marks
   those five routes with `data-theme-fixed`, and index.css restores the base
   (dark-theme) neutral values under that attribute -- without it the inverted
   scale would flip their `text-slate-900` to near-white on an already-light
   page.

   The shell is mocked out: it is not what this test is about, and mounting it
   would drag in the query client and auth-dependent chrome. */
vi.mock('./Sidebar', () => ({
  DesktopSidebar: () => null,
  MobileSidebar: () => null,
}));
vi.mock('./Header', () => ({ Header: () => null }));

afterEach(cleanup);

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Layout>
        <p>nội dung</p>
      </Layout>
    </MemoryRouter>,
  );

const PINNED = ['/login', '/register', '/auth/callback', '/', '/dashboard-landing'];

describe('Layout pins the standalone routes to one look', () => {
  it.each(PINNED)('marks %s with data-theme-fixed', (path) => {
    const { container } = renderAt(path);

    expect(container.querySelector('[data-theme-fixed="light"]')).not.toBeNull();
  });

  it.each(PINNED)('renders %s without the app shell', (path) => {
    const { container } = renderAt(path);

    expect(container.querySelector('main')).toBeNull();
  });

  it('leaves a shell route unpinned', () => {
    const { container } = renderAt('/today');

    expect(container.querySelector('[data-theme-fixed]')).toBeNull();
  });
});