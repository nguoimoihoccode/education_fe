import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('marks loading buttons as busy and disables interaction', () => {
    render(<Button isLoading>Đang lưu</Button>);

    const button = screen.getByRole('button', { name: 'Đang lưu' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('does not expose busy state when not loading', () => {
    render(<Button>Lưu</Button>);

    const button = screen.getByRole('button', { name: 'Lưu' });

    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('aria-busy');
  });
});
