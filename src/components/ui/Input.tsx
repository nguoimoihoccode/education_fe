import { forwardRef, useState, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  neonColor?: 'pink' | 'cyan' | 'purple' | 'green' | 'app';
}

/**
 * Cyberpunk-themed Input component with neon focus states
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="you@example.com"
 *   leftIcon={<MailIcon />}
 *   neonColor="cyan"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      neonColor = 'app',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const messageId = `${inputId}-message`;

    const neonColors = {
      pink: {
        border: 'focus:border-neon-pink',
        shadow: 'focus:shadow-neon-pink-sm',
        ring: 'focus-visible:ring-neon-pink',
      },
      cyan: {
        border: 'focus:border-neon-cyan',
        shadow: 'focus:shadow-neon-cyan-sm',
        ring: 'focus-visible:ring-neon-cyan',
      },
      purple: {
        border: 'focus:border-neon-purple',
        shadow: 'focus:shadow-neon-purple-sm',
        ring: 'focus-visible:ring-neon-purple',
      },
      green: {
        border: 'focus:border-trade-up',
        shadow: 'focus:shadow-neon-green',
        ring: 'focus-visible:ring-trade-up',
      },
      app: {
        border: 'focus:border-[var(--app-primary)]',
        shadow: 'focus:shadow-[0_0_0_3px_rgba(16,185,129,0.25)]',
        ring: 'focus-visible:ring-[var(--app-focus)]',
      },
    };

    const currentInputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--app-text-muted)] mb-2">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex-shrink-0">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={currentInputType}
            aria-invalid={!!error || undefined}
            aria-describedby={(error || helperText) ? messageId : props['aria-describedby']}
            className={cn(
              // Base styles
              'w-full rounded-xl',
              'bg-[var(--app-surface)] backdrop-blur-md',
              'border border-[var(--app-border)]',
              'text-[var(--app-text)] placeholder:text-[var(--app-text-subtle)]',
              'transition-colors duration-200 motion-reduce:transition-none',
              // Padding - compact size
              leftIcon ? 'pl-10' : 'pl-3.5',
              (rightIcon || type === 'password') ? 'pr-10' : 'pr-3.5',
              'py-2.5',
              // Focus states
              'outline-none',
              neonColors[neonColor].border,
              neonColors[neonColor].shadow,
              neonColors[neonColor].ring,
              'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)]',
              // Error state
              error && 'border-[var(--app-danger)] focus:border-[var(--app-danger)]',
              // Disabled state
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {type === 'password' ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors touch-target p-1 cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex-shrink-0">
                {rightIcon}
              </div>
            )
          )}

          {/* Animated border glow — only for non-app neon colors */}
          {isFocused && !error && neonColor !== 'app' && (
            <div
              className={cn(
                'absolute inset-0 rounded-xl pointer-events-none',
                'transition-opacity duration-400 motion-reduce:transition-none',
                neonColor === 'pink' && 'bg-neon-pink/5',
                neonColor === 'cyan' && 'bg-neon-cyan/5',
                neonColor === 'purple' && 'bg-neon-purple/5',
                neonColor === 'green' && 'bg-trade-up/5'
              )}
            />
          )}
        </div>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <div className="mt-2 flex items-start gap-1">
            {error && (
              <svg
                className="w-4 h-4 text-[var(--app-danger)] flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p
              id={messageId}
              className={cn(
                'text-sm',
                error ? 'text-[var(--app-danger)]' : 'text-gray-400'
              )}
            >
              {error || helperText}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
