# Quiz Offline HSK1 Config Before Start Design

## Goal

Make the offline HSK1 quiz flow configurable before the user starts the attempt.

The user should:

- enter the HSK1 quiz page
- choose difficulty
- choose question count
- start the quiz only after that

## Current State

- HSK1 offline content is currently split into multiple HSK1 quiz entries by difficulty.
- Each session already supports a random question subset.
- The current flow starts a quiz directly once the user enters the session route.

## Chosen Approach

Replace the multiple visible HSK1 quiz entries with one HSK1 entry point and move difficulty/question-count selection into the HSK1 detail page.

## Scope

### Quiz List

- Show one HSK1 entry point instead of separate easy/medium/hard HSK1 cards.

### Quiz Detail

- If the quiz is the offline HSK1 entry point, show a configuration panel with:
  - difficulty: `EASY`, `MEDIUM`, `HARD`
  - question count: `10`, `20`, `30`
- Start button should use the selected configuration.

### Session Start

- The offline provider should accept the selected difficulty and question count.
- The session should randomize from the correct pool based on the chosen difficulty.
- The number of questions in the session should match the chosen count.

## Non-Goals

- No backend changes
- No changes to non-HSK1 quiz flows
- No changes to the real backend quiz contract

## Testing

- Verify the HSK1 list now shows a single entry point.
- Verify the provider can start 10/20/30-question sessions for each difficulty.
- Verify frontend build passes.
