# Quiz Offline Random 20 and Final Review Design

## Goal

Make the frontend-only HSK1 quiz behave more like a real practice exam:

- keep a large offline HSK1 question pool
- select only 20 random questions per attempt
- show review of correct/incorrect answers only after the quiz is finished

## Current State

- `HSK1 Mock Exam` in `quizOffline.ts` currently exposes a very large question set directly.
- The offline provider starts a session against the full question list.
- `QuizSessionPage.tsx` currently shows per-question feedback immediately after each answer.

## Chosen Approach

Keep the large HSK1 bank in the offline provider, but create a per-session random subset of 20 questions and run the session only against that subset.

For UX, suppress per-question feedback during the attempt and keep answer review on the result page only.

## Scope

### Offline Question Selection

- Keep the HSK1 pool larger than 100 questions.
- On `startQuizSession()` in offline mode:
  - choose 20 random questions from the full HSK1 pool
  - bind those 20 questions to the created session
- The quiz detail page can still show the full quiz metadata, but the actual session should use only the selected 20 questions.

### Session Behavior

- During the quiz attempt:
  - selecting and submitting an answer should move to the next question
  - no immediate correct/incorrect feedback banner should block the flow
- After finishing:
  - result page should show score
  - wrong answers review remains available there

## Data Rules

- Random selection should happen once per started session, not per question render.
- Session-scoped question order should remain stable for that session.
- `questionCount` used during the attempt should match the selected 20-question subset.

## Non-Goals

- No backend changes
- No change to real backend quiz flow
- No need to add timer randomization or adaptive difficulty in this task

## Testing

- Extend offline tests to verify:
  - HSK1 bank remains large
  - a started HSK1 session uses exactly 20 questions
  - repeated starts can produce different question subsets
- Verify frontend build passes.
