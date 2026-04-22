# Quiz Offline HSK1 Expanded Pack Design

## Goal

Expand the existing frontend-only `HSK1 Mock Exam` so it contains enough questions for a longer, more useful HSK1 practice session without requiring any backend.

## Current State

- `education_fe/src/mocks/quizOffline.ts` already includes one `HSK1 Mock Exam` in offline quiz mode.
- The current HSK1 quiz contains only a small set of questions.
- The offline quiz flow already works end-to-end for:
  - list
  - detail
  - session
  - results
  - stats/history

## Chosen Approach

Keep a single HSK1 aggregate quiz and expand its question bank significantly.

This avoids adding more routes, more cards, or more mock architecture, while giving the user a longer HSK1 quiz to practice immediately.

## Scope

- Keep the existing quiz ID and title:
  - `offline-quiz-hsk1`
  - `HSK1 Mock Exam`
- Increase the question set to roughly `30-40` questions.
- Update `questionCount` to match the actual total.
- Keep question types simple and compatible with the current offline provider logic:
  - mostly `MULTIPLE_CHOICE`
  - some `TRUE_FALSE`

## Content Areas

Use only HSK1-level topics:

- greetings
- self-introduction
- family members
- numbers
- dates and time basics
- school and teacher/student vocabulary
- common verbs
- food and drink
- simple negation and everyday phrases

## Data Rules

- Every question must have:
  - `id`
  - `quizId`
  - `question`
  - `type`
  - `correctAnswer`
  - `points`
  - timestamps
- Multiple choice questions must have valid options and one correct answer that matches one of the options.
- The expanded set should remain internally consistent with the existing mock provider logic.

## Non-Goals

- No new HSK1 quiz cards
- No HSK2 content in this task
- No backend changes
- No change to the offline quiz architecture

## Testing

- Extend the offline quiz tests to require a larger HSK1 question set.
- Verify frontend build passes.
- Manually verify the HSK1 quiz still opens and completes in offline mode.
