import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const Boom = () => {
  throw new Error('Failed to fetch dynamically imported module');
};

describe('ErrorBoundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders children untouched when nothing throws', () => {
    render(
      <ErrorBoundary>
        <div>Settings content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Settings content')).toBeInTheDocument();
  });

  it('shows a reload affordance instead of leaving the boot splash up', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Không tải được trang')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('surfaces the underlying message so the failure is diagnosable', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Failed to fetch dynamically imported module/)).toBeInTheDocument();
  });
});