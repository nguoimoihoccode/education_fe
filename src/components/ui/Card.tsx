import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-dark' | 'neon-border';
  neonColor?: 'pink' | 'cyan' | 'purple' | 'green';
  hover?: boolean;
  glow?: boolean;
}

/**
 * Cyberpunk-themed Card component with glassmorphism and neon borders
 * 
 * @example
 * ```tsx
 * <Card variant="glass-dark" neonColor="cyan" hover glow>
 *   Content
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'glass',
      neonColor = 'cyan',
      hover = false,
      glow = false,
      children,
      ...props
    },
    ref
  ) => {
    const neonBorderColors = {
      pink: 'border-neon-pink/30',
      cyan: 'border-neon-cyan/30',
      purple: 'border-neon-purple/30',
      green: 'border-trade-up/30',
    };

    const neonShadows = {
      pink: 'shadow-neon-pink',
      cyan: 'shadow-neon-cyan',
      purple: 'shadow-neon-purple',
      green: 'shadow-neon-green',
    };

    const variants = {
      glass: cn(
        'bg-white/5',
        'backdrop-blur-md',
        'border border-white/10'
      ),
      'glass-dark': cn(
        'bg-cyber-800/70',
        'backdrop-blur-xl',
        'border',
        neonBorderColors[neonColor]
      ),
      'neon-border': cn(
        'bg-cyber-900/80',
        'backdrop-blur-lg',
        'border-2',
        neonBorderColors[neonColor]
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
            variant === 'glass-dark' && 'hover:bg-cyber-700/70',
            'cursor-pointer'
          ),
          // Glow effect
          glow && cn(
            neonShadows[neonColor],
            hover && `hover:${neonShadows[neonColor]}-lg`
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
  neonColor?: 'pink' | 'cyan' | 'purple' | 'green';
  glow?: boolean;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, neonColor, glow = false, ...props }, ref) => {
    const neonTextColors = {
      pink: 'text-neon-pink',
      cyan: 'text-neon-cyan',
      purple: 'text-neon-purple',
      green: 'text-trade-up',
    };

    return (
      <h3
        ref={ref}
        className={cn(
          'text-2xl font-bold',
          neonColor && neonTextColors[neonColor],
          glow && neonColor && `neon-text-${neonColor}`,
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
