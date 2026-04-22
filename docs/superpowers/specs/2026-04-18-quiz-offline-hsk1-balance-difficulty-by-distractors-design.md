# Quiz Offline HSK1 Balance Difficulty by Distractors Design

## Goal

Make the HSK1 `EASY`, `MEDIUM`, and `HARD` pools feel meaningfully different by tuning how confusing the wrong answer choices are.

## Current State

- The HSK1 offline system already supports:
  - one HSK1 entry point
  - difficulty selection
  - question-count selection
  - randomized session subsets
- The content pool is now large and mixed, but the three difficulty levels are not yet differentiated strongly enough by answer-choice quality.

## Chosen Approach

Keep the same architecture and rebalance the difficulty mainly through distractor quality.

## Scope

### EASY

- Wrong answers should be clearly different from the correct one.
- Users who know the basic meaning should identify the answer quickly.

### MEDIUM

- Wrong answers should be closer in topic or likely context.
- At least one distractor should feel plausible.

### HARD

- Wrong answers should be much easier to confuse with the correct one.
- Distractors should often come from the same semantic or conversational neighborhood.

## Non-Goals

- No backend changes
- No routing or UI flow changes
- No changes to question-count/session mechanics

## Testing

- Keep existing offline/session/build tests passing.
- Add or update a regression test that checks the difficulty pools are not identical in distractor style.
