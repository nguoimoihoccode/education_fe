# Quiz Detail Preview Follow HSK1 Difficulty Design

## Goal

Make the HSK1 preview on the quiz detail page reflect the currently selected difficulty so the preview feels more meaningful before the user starts the quiz.

## Current State

- HSK1 detail already supports selecting:
  - difficulty
  - question count
- The preview is now less repetitive than before, but it still does not clearly follow the selected difficulty.

## Chosen Approach

Keep the preview separate from the actual session, but make it use the pool for the currently selected HSK1 difficulty.

## Scope

- On the HSK1 detail page:
  - when `EASY` is selected, preview uses the easy HSK1 pool
  - when `MEDIUM` is selected, preview uses the medium HSK1 pool
  - when `HARD` is selected, preview uses the hard HSK1 pool
- The preview still shows only a representative subset, not the full pool.
- The actual session start flow stays unchanged and continues to randomize from the selected difficulty pool.

## Non-Goals

- No backend changes
- No change to session mechanics
- No change to non-HSK1 quiz detail pages

## Testing

- Extend the preview helper test coverage so different seeds and different difficulty pools produce different preview sets.
- Verify frontend build passes.
