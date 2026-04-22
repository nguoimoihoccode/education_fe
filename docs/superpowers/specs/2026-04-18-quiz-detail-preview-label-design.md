# Quiz Detail Preview Label Design

## Goal

Make the HSK1 preview area clearly communicate which difficulty pool and question-count setting the user is currently previewing.

## Current State

- HSK1 detail already reacts to the selected difficulty and question count.
- The preview content changes accordingly, but the UI does not explicitly say what the preview represents.

## Chosen Approach

Add a small label near the preview section that reflects:

- selected difficulty
- selected question count

Example:

- `Preview 10 câu - Easy pool`
- `Preview 30 câu - Hard pool`

## Scope

- UI-only change in `QuizDetailPage`.
- No logic changes to session start or preview generation.

## Non-Goals

- No backend changes
- No changes to quiz mechanics
- No changes outside the HSK1 detail flow

## Testing

- Verify frontend build passes.
- Lint touched files.
- Manual verification should confirm the preview label updates when the user changes difficulty or question count.
