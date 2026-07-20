import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('links error text to invalid input for assistive technology', () => {
    render(<Input id="email" label="Email" error="Email không hợp lệ" />);

    const input = screen.getByLabelText('Email');
    const message = screen.getByText('Email không hợp lệ');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-message');
    expect(message).toHaveAttribute('id', 'email-message');
  });

  it('links helper text without marking the input invalid', () => {
    render(<Input id="password" label="Mật khẩu" helperText="Tối thiểu 8 ký tự" />);

    const input = screen.getByLabelText('Mật khẩu');
    const message = screen.getByText('Tối thiểu 8 ký tự');

    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute('aria-describedby', 'password-message');
    expect(message).toHaveAttribute('id', 'password-message');
  });

  it('uses app focus ring instead of neon default', () => {
    render(<Input id="name" label="Tên" />);

    const input = screen.getByLabelText('Tên');
    const className = input.className;

    expect(className).toContain('focus-visible:ring-[var(--app-focus)]');
    expect(className).not.toContain('focus-visible:ring-neon-cyan');
    expect(className).not.toContain('focus:border-neon-cyan');
  });
});
