import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default: 'bg-cyber-700 text-gray-300 border border-cyber-600',
        success: 'bg-trade-up/10 text-trade-up border border-trade-up/30',
        warning: 'bg-trade-neutral/10 text-trade-neutral border border-trade-neutral/30',
        danger: 'bg-trade-down/10 text-trade-down border border-trade-down/30',
        info: 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30',
        'neon-pink': 'bg-neon-pink/10 text-neon-pink border border-neon-pink/50 shadow-neon-pink/20',
        'neon-cyan': 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/50 shadow-neon-cyan/20',
        'neon-purple': 'bg-neon-purple/10 text-neon-purple border border-neon-purple/50 shadow-neon-purple/20',
        'neon-green': 'bg-neon-green/10 text-neon-green border border-neon-green/50 shadow-neon-green/20',
        'solid-success': 'bg-trade-up text-cyber-900 border-0 font-bold',
        'solid-danger': 'bg-trade-down text-white border-0 font-bold',
        'solid-warning': 'bg-trade-neutral text-cyber-900 border-0 font-bold',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      pulse: {
        true: 'animate-glow-pulse motion-reduce:animate-none',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      pulse: false,
    },
  }
)
