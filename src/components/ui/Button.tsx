import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'neon-pink' | 'neon-cyan' | 'neon-purple';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Cyberpunk-themed Button component with neon variants
 * 
 * @example
 * ```tsx
 * <Button variant="neon-pink" size="lg">
 *   Trade Now
 * </Button>
 * 
 * <Button variant="neon-cyan" isLoading>
 *   Loading...
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
        'bg-gradient-to-br from-neon-purple to-neon-pink',
        'text-white',
        'shadow-neon-purple',
        'hover:shadow-neon-purple-lg hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        'active:translate-y-0',
        'focus-visible:ring-neon-purple'
      ),
      secondary: cn(
        'bg-cyber-700/50 backdrop-blur-md',
        'border border-neon-cyan/30',
        'text-white',
        'hover:bg-cyber-600/50 hover:border-neon-cyan/50',
        'hover:shadow-neon-cyan-sm',
        'focus-visible:ring-neon-cyan'
      ),
      ghost: cn(
        'bg-transparent',
        'text-gray-300',
        'hover:bg-white/5 hover:text-white',
        'focus-visible:ring-gray-500'
      ),
      danger: cn(
        'bg-gradient-to-br from-neon-red to-red-600',
        'text-white',
        'shadow-neon-red',
        'hover:shadow-lg hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        'active:translate-y-0',
        'focus-visible:ring-neon-red'
      ),
      'neon-pink': cn(
        'bg-cyber-800/50 backdrop-blur-md',
        'border-2 border-neon-pink/50',
        'text-neon-pink',
        'shadow-neon-pink',
        'hover:bg-neon-pink/10 hover:border-neon-pink hover:shadow-neon-pink-lg',
        'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        'active:translate-y-0',
        'focus-visible:ring-neon-pink',
        'glow-pulse motion-reduce:animate-none'
      ),
      'neon-cyan': cn(
        'bg-cyber-800/50 backdrop-blur-md',
        'border-2 border-neon-cyan/50',
        'text-neon-cyan',
        'shadow-neon-cyan',
        'hover:bg-neon-cyan/10 hover:border-neon-cyan hover:shadow-neon-cyan-lg',
        'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        'active:translate-y-0',
        'focus-visible:ring-neon-cyan',
        'glow-pulse motion-reduce:animate-none'
      ),
      'neon-purple': cn(
        'bg-cyber-800/50 backdrop-blur-md',
        'border-2 border-neon-purple/50',
        'text-neon-purple',
        'shadow-neon-purple',
        'hover:bg-neon-purple/10 hover:border-neon-purple hover:shadow-neon-purple-lg',
        'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        'active:translate-y-0',
        'focus-visible:ring-neon-purple',
        'glow-pulse motion-reduce:animate-none'
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
