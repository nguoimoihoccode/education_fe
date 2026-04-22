# Quiz Remove Glow and Light Sweep Design

## Goal

Remove the remaining glow and light-sweep style effects from the quiz UI so the quiz experience feels visually stable and less distracting.

## Current State

- Motion-heavy quiz UI was already reduced, but some decorative lighting remains.
- The remaining visual distraction comes from glow/blur overlays and shine-like decoration in quiz cards and stat cards.
- These effects are cosmetic and not required for quiz usability.

## Chosen Approach

Keep the quiz layout, spacing, and color hierarchy, but remove decorative glow layers and shiny overlays from the quiz domain.

## Scope

### Remove Decorative Glow from Quiz Cards

- Remove absolute glow/blur circles from `QuizCard.tsx`.
- Remove neon-like hover shadow effects from quiz cards.

### Remove Decorative Glow from Quiz Stats

- Remove blur glow decoration from `QuizStats.tsx` stat cards.
- Remove inner light-sweep style overlays from progress bars.

## Non-Goals

- No logic changes
- No changes outside the quiz domain
- No redesign of card structure or data presentation

## Testing

- Verify frontend build passes.
- Run lint on touched quiz files.
- Manual verification should confirm the quiz UI no longer shows glow or sweeping light decorations.
