# Quiz Offline HSK1 Split by Difficulty Design

## Goal

Replace the single offline HSK1 quiz with separate HSK1 practice quizzes by difficulty, remove true/false questions, and keep each attempt limited to 20 questions.

## Current State

- Offline mode currently uses one large `HSK1 Mock Exam` pool.
- The pool includes `TRUE_FALSE` questions.
- Each attempt already uses 20 random questions in session scope.
- Quiz detail currently previews the full question list, which can feel inconsistent with the actual session size.

## Chosen Approach

Split the offline HSK1 content into three separate quizzes:

- `HSK1 Easy Practice`
- `HSK1 Medium Practice`
- `HSK1 Hard Practice`

Each quiz keeps its own pool and each started session still uses only 20 random questions.

## Scope

### HSK1 Quiz Structure

- Remove the single `HSK1 Mock Exam` entry.
- Add three offline HSK1 quizzes with `difficulty` set to:
  - `EASY`
  - `MEDIUM`
  - `HARD`
- Keep all three under topic `HSK1`.

### Question Types

- Remove `TRUE_FALSE` from HSK1 offline questions.
- Use `MULTIPLE_CHOICE` only for the HSK1 packs in this task.

### Session Behavior

- Each started HSK1 session should still use exactly 20 random questions from that quiz’s own pool.
- Session-scoped subset remains stable for the duration of the attempt.

### Quiz Detail Consistency

- Quiz detail should not imply that the user will answer more than 20 questions in one attempt.
- The preview can show a representative subset consistent with the current 20-question attempt model.

## Non-Goals

- No backend changes
- No new quiz mechanics beyond current offline mode
- No HSK2 content in this task

## Testing

- Verify there are 3 HSK1 quizzes by difficulty.
- Verify each HSK1 quiz is `MULTIPLE_CHOICE` only.
- Verify each HSK1 session uses exactly 20 questions.
- Verify frontend build passes.
