import React from 'react'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from './badgeVariants'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before the badge text
   */
  icon?: React.ReactNode
  /**
   * Icon to display after the badge text
   */
  endIcon?: React.ReactNode
}

/**
 * Badge Component
 * 
 * A versatile badge component with cyberpunk neon styling for status indicators,
 * labels, and tags.
 * 
 * @example
 * // Basic usage
 * <Badge>Default</Badge>
 * 
 * @example
 * // Success badge with icon
 * <Badge variant="success" icon={<CheckIcon />}>Active</Badge>
 * 
 * @example
 * // Pulsing neon badge
 * <Badge variant="neon-pink" pulse>Live</Badge>
 * 
 * @example
 * // Large danger badge
 * <Badge variant="danger" size="lg">Critical</Badge>
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, pulse, icon, endIcon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, pulse }), className)}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
        {endIcon && <span className="inline-flex shrink-0">{endIcon}</span>}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
