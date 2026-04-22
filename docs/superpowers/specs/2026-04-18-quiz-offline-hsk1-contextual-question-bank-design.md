# Quiz Offline HSK1 Contextual Question Bank Design

## Goal

Rewrite the offline HSK1 question bank so it feels more like an actual HSK1 practice test, with emphasis on short contextual question-and-answer patterns instead of mostly isolated vocabulary-to-meaning prompts.

## Current State

- The HSK1 offline quiz flow is already configurable:
  - choose difficulty
  - choose question count
  - start the attempt
- The current HSK1 content still leans too heavily toward direct vocabulary recognition.
- This makes the quiz usable, but not close enough to the feeling of a real HSK1-style practice test.

## Chosen Approach

Keep the existing offline quiz architecture and rewrite the HSK1 question banks so contextual question-answer items dominate the pools.

## Scope

### Keep Existing Flow

- Keep the single `HSK1 Practice` entry point.
- Keep the difficulty selector:
  - `EASY`
  - `MEDIUM`
  - `HARD`
- Keep question counts:
  - `10`
  - `20`
  - `30`

### Rewrite HSK1 Question Content

- Shift the HSK1 pools toward:
  - short dialogues
  - question-response matching
  - sentence completion in context
  - choosing the correct reply to a simple prompt
  - understanding a short everyday situation

- Reduce the share of purely direct prompts like:
  - “Từ nào có nghĩa là X?”

### Difficulty Shape

- `EASY`
  - very direct question/answer pairs
  - simple greetings, identity, family, numbers, time, location
- `MEDIUM`
  - short contextual prompts
  - slightly less direct answer choices
- `HARD`
  - still within HSK1 vocabulary
  - more distractors that are plausible in the same context

## Non-Goals

- No backend changes
- No audio/listening simulation in this task
- No changes to the session/randomization architecture
- No changes outside the HSK1 offline question content

## Testing

- Keep the existing offline/session tests passing.
- Add or update tests so HSK1 content includes contextual prompt patterns, not only direct vocabulary checks.
- Verify frontend build passes.
