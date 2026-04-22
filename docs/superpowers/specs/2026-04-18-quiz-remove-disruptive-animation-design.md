# Quiz Remove Disruptive Animation Design

## Goal

Reduce or remove disruptive motion in the quiz experience so the quiz pages are easier to use and less distracting.

## Current State

- Quiz pages and components currently include multiple motion-heavy patterns:
  - loading spinners
  - animated progress bar transitions
  - bar chart grow animations in quiz stats
  - hover scale and translate effects on quiz cards and actions
  - transition-heavy answer button interactions
- These effects are visually consistent with the current design system, but they add motion that is not necessary for quiz usability.

## Chosen Approach

Keep the quiz visual structure and styling, but remove or flatten motion within the quiz domain.

The change stays local to:

- `src/pages/quiz/*`
- `src/components/quiz/*`

## Scope

### Remove Motion from Quiz Pages

- Replace animated spinners with static loading placeholders where practical.
- Remove progress bar animation timing from `QuizSessionPage`.
- Remove chart grow animation from `QuizStatsPage` and render static bar heights directly.

### Remove Motion from Quiz Interactions

- Remove hover scale/translate effects on quiz list cards and action buttons.
- Remove unnecessary `transition-all` usage on answer options and quiz action buttons.
- Keep selected/active states and semantic colors.

### Keep Layout and Semantics

- Do not redesign quiz pages.
- Do not change quiz logic or routing.
- Keep the same information architecture and visual hierarchy.

## Non-Goals

- No global animation removal for the whole app.
- No changes outside the quiz domain.
- No visual redesign beyond reducing motion.

## Testing

- Verify frontend build passes.
- Run lint on touched quiz files.
- Manual verification should confirm quiz flow is still intact and visually calmer.
