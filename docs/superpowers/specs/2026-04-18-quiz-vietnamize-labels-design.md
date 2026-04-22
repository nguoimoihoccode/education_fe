# Quiz Vietnamize Labels Design

## Goal

Vietnamize the remaining English labels in the quiz and HSK1 flow so the experience feels more consistent for Vietnamese users.

## Current State

- The HSK1 flow already has some Vietnamese labels.
- A few visible labels are still English, especially around preview/meta text and quiz actions.

## Chosen Approach

Change only user-facing text in the quiz domain.

## Scope

- Update remaining English labels in quiz pages/components to Vietnamese.
- Keep internal enums, route params, and data values unchanged where appropriate.

## Non-Goals

- No logic changes
- No API changes
- No route changes

## Testing

- Verify frontend build passes.
- Lint touched files.
