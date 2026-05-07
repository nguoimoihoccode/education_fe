import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * EduPro button component for learning workflows.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Bắt đầu học
 * </Button>
 * 
 * <Button variant="secondary" isLoading>
 *   Đang tải...
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      // Base styles
      'inline-flex items-center justify-center gap-2',
      'font-semibold rounded-xl',
      'transition-all duration-400 motion-reduce:transition-none',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'relative overflow-hidden',
      // Cursor
      'cursor-pointer',
      // Prevent text selection
      'select-none',
      // Touch-friendly
      'touch-target'
    );

    const variants = {
      primary: cn(
        'bg-gradient-to-br from-accent-600 to-emerald-600',
        'text-white',
        'shadow-lg shadow-accent-900/25',
        'hover:from-accent-500 hover:to-emerald-500 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        'active:translate-y-0',
        'focus-visible:ring-accent-400'
      ),
      secondary: cn(
        'bg-slate-800/70 backdrop-blur-md',
        'border border-white/10',
        'text-slate-100',
        'hover:bg-slate-700/70 hover:border-accent-400/40',
        'focus-visible:ring-accent-400'
      ),
      ghost: cn(
        'bg-transparent',
        'text-slate-300',
        'hover:bg-white/5 hover:text-white',
        'focus-visible:ring-slate-500'
      ),
      danger: cn(
        'bg-gradient-to-br from-red-500 to-rose-600',
        'text-white',
        'shadow-lg shadow-red-950/25',
        'hover:from-red-400 hover:to-rose-500 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        'active:translate-y-0',
        'focus-visible:ring-red-400'
      ),
      success: cn(
        'bg-gradient-to-br from-emerald-500 to-teal-600',
        'text-white',
        'shadow-lg shadow-emerald-950/25',
        'hover:from-emerald-400 hover:to-teal-500 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        'active:translate-y-0',
        'focus-visible:ring-emerald-400'
      ),
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="animate-spin motion-reduce:animate-none -ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}

        {/* Button text */}
        <span>{children}</span>

        {/* Right icon */}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
