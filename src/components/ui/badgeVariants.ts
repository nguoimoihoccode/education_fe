import { cva } from 'class-variance-authority'

/* Colour mapping, replacing the literal `cyber-*`/`trade-*`/`neon-*` scales.
   Those were fixed hexes with no light value, so on the light theme the dark
   `cyber-700` chip painted near-black behind `text-gray-300` (inverted to a dark
   grey) and the neon hues painted at 1.3-2:1. Every variant now reads from a
   token that has a value per theme:
     default  -> neutral surface        (was bg-cyber-700 / text-gray-300)
     success  -> --app-primary          (was trade-up,      #10B981 -- same value)
     warning  -> --app-warning          (was trade-neutral, #F59E0B -- same value)
     danger   -> --app-danger           (was trade-down,    #EF4444 -- same value)
     info     -> --app-accent
     neon-*   -> nearest semantic accent below; cyan and purple both land on
                 --app-accent, because the neon hues outside that set have no
                 light-mode-safe equivalent. The variant names stay as they are,
                 so no call site changes.
   Tints are `color-mix` over the token rather than a `/10` alpha modifier:
   Tailwind cannot put an opacity modifier on an arbitrary `var()` colour, and
   `color-mix` is the idiom the rest of the app already uses (LearningCoach,
   Education.css).

   These class strings must stay *literal*. Tailwind scans source text for
   candidate class names, so building them from a helper -- `bg-[var(${token})]`
   -- emits no CSS at all and the badge renders unstyled. */
const TONE_PRIMARY =
  'bg-[color-mix(in_srgb,var(--app-primary)_12%,transparent)] text-[var(--app-primary)] border border-[color:color-mix(in_srgb,var(--app-primary)_30%,transparent)]';
const TONE_WARNING =
  'bg-[color-mix(in_srgb,var(--app-warning)_12%,transparent)] text-[var(--app-warning)] border border-[color:color-mix(in_srgb,var(--app-warning)_30%,transparent)]';
const TONE_DANGER =
  'bg-[color-mix(in_srgb,var(--app-danger)_12%,transparent)] text-[var(--app-danger)] border border-[color:color-mix(in_srgb,var(--app-danger)_30%,transparent)]';
const TONE_ACCENT =
  'bg-[color-mix(in_srgb,var(--app-accent)_12%,transparent)] text-[var(--app-accent)] border border-[color:color-mix(in_srgb,var(--app-accent)_30%,transparent)]';

/* Glow counterparts, same four accents at a stronger edge. */
const GLOW_PRIMARY =
  'bg-[color-mix(in_srgb,var(--app-primary)_12%,transparent)] text-[var(--app-primary)] border border-[color:color-mix(in_srgb,var(--app-primary)_50%,transparent)] shadow-[0_0_10px_color-mix(in_srgb,var(--app-primary)_20%,transparent)]';
const GLOW_DANGER =
  'bg-[color-mix(in_srgb,var(--app-danger)_12%,transparent)] text-[var(--app-danger)] border border-[color:color-mix(in_srgb,var(--app-danger)_50%,transparent)] shadow-[0_0_10px_color-mix(in_srgb,var(--app-danger)_20%,transparent)]';
const GLOW_ACCENT =
  'bg-[color-mix(in_srgb,var(--app-accent)_12%,transparent)] text-[var(--app-accent)] border border-[color:color-mix(in_srgb,var(--app-accent)_50%,transparent)] shadow-[0_0_10px_color-mix(in_srgb,var(--app-accent)_20%,transparent)]';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]',
        success: TONE_PRIMARY,
        warning: TONE_WARNING,
        danger: TONE_DANGER,
        info: TONE_ACCENT,
        'neon-pink': GLOW_DANGER,
        'neon-cyan': GLOW_ACCENT,
        'neon-purple': GLOW_ACCENT,
        'neon-green': GLOW_PRIMARY,
        'solid-success':
          'bg-[var(--app-primary)] text-on-light-accent border-0 font-bold',
        'solid-danger':
          'bg-[var(--app-danger)] text-on-accent border-0 font-bold',
        'solid-warning':
          'bg-[var(--app-warning)] text-on-light-accent border-0 font-bold',
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