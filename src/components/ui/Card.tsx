import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-dark' | 'outline';
  accentColor?: 'violet' | 'emerald' | 'amber' | 'rose';
  hover?: boolean;
  glow?: boolean;
}

/**
 * EduPro card component with restrained learning-dashboard surfaces.
 * 
 * @example
 * ```tsx
 * <Card variant="glass-dark" accentColor="emerald" hover>
 *   Content
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'glass',
      accentColor = 'violet',
      hover = false,
      glow = false,
      children,
      ...props
    },
    ref
  ) => {
    const accentBorders = {
      violet: 'border-accent-500/30',
      emerald: 'border-emerald-500/30',
      amber: 'border-amber-500/30',
      rose: 'border-rose-500/30',
    };

    const accentShadows = {
      violet: 'shadow-accent-950/20',
      emerald: 'shadow-emerald-950/20',
      amber: 'shadow-amber-950/20',
      rose: 'shadow-rose-950/20',
    };

    const variants = {
      glass: cn(
        'bg-white/5',
        'backdrop-blur-md',
        'border border-white/10'
      ),
      'glass-dark': cn(
        'bg-slate-800/70',
        'backdrop-blur-xl',
        'border',
        accentBorders[accentColor]
      ),
      outline: cn(
        'bg-slate-900/80',
        'backdrop-blur-lg',
        'border',
        accentBorders[accentColor]
      ),
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-2xl',
          'transition-all duration-400 motion-reduce:transition-none',
          'relative overflow-hidden',
          // Variant
          variants[variant],
          // Hover effect
          hover && cn(
            'hover:-translate-y-1 motion-reduce:hover:translate-y-0',
            'hover:border-opacity-50',
            variant === 'glass-dark' && 'hover:bg-slate-700/70',
            'cursor-pointer'
          ),
          // Glow effect
          glow && cn(
            'shadow-lg',
            accentShadows[accentColor]
          ),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 pb-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  accentColor?: 'violet' | 'emerald' | 'amber' | 'rose';
  glow?: boolean;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, accentColor, glow = false, ...props }, ref) => {
    const accentTextColors = {
      violet: 'text-accent-300',
      emerald: 'text-emerald-300',
      amber: 'text-amber-300',
      rose: 'text-rose-300',
    };

    return (
      <h3
        ref={ref}
        className={cn(
          'text-2xl font-bold',
          accentColor && accentTextColors[accentColor],
          glow && 'drop-shadow-sm',
          'text-white',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-gray-400 mt-2', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 pt-0', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-6 pt-0',
          'flex items-center gap-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
