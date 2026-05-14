# Learning Coach Dashboard Redesign

## Selected Direction

Use **Coach Command Center** for `/learning-coach`.

## Goal

Make the dashboard feel like part of EduPro's learning experience, not a separate dark cyber dashboard. The page should guide the learner to one clear next action and explain why that action matters.

## Visual System

- Light learning dashboard matching `Education.tsx` and `Education.css`.
- White cards, slate text, emerald primary action, amber focus accents.
- Large hero with AI coach label, headline, focus area, and circular plan progress.
- Cards use soft shadows, rounded corners, and visible borders.

## Layout

1. Hero command center:
   - Kicker: `AI Learning Coach`
   - Headline from backend summary
   - Focus area text
   - Circular progress for today's plan completion
   - Primary next-best-action CTA
2. Metrics row:
   - Plan completion
   - Minutes progress
   - Current streak
   - Mastered vocabulary or XP
3. Main content:
   - Left: next best action + today's tasks
   - Right: coach reasoning + weak quiz risks

## UX Rules

- Primary action must be obvious and above the fold.
- Every clickable card needs hover, focus-visible, and cursor pointer.
- Loading and error states must use styled cards, not plain text.
- Empty risk state should feel encouraging, not blank.

## Scope

- Redesign only `LearningCoach.tsx`.
- No backend changes.
- No new dependencies.
- Preserve existing API shape.

## Verification

- Run frontend route/search tests.
- Run frontend build.
