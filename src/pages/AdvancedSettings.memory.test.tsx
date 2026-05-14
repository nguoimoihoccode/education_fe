import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdvancedSettings from './AdvancedSettings';

describe('AdvancedSettings cleanup', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('clears the saved-toast timeout when unmounted', () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    const { unmount } = render(<AdvancedSettings />);

    fireEvent.click(screen.getByRole('button', { name: /light/i }));
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
