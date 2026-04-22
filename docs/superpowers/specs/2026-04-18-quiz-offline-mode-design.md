# Quiz Offline Mode Design

## Goal

Allow the frontend to run a complete quiz flow without any backend or database, so a developer can start the frontend only and manually try quiz features end-to-end.

## Current State

- All quiz routes are protected by `ProtectedRoute` and require `isAuthenticated = true` in the auth store.
- `quiz.api.ts` currently assumes a live backend for all quiz endpoints.
- Quiz pages depend on a broad set of quiz data, not just list/detail:
  - quiz list
  - quiz detail with questions
  - quiz session start
  - answer submission
  - session completion
  - result page
  - quiz stats
  - history

## Chosen Approach

Add a frontend-only quiz offline mode, enabled by environment variable:

- `VITE_QUIZ_OFFLINE_MODE=true`

When enabled, the frontend should:

1. auto-authenticate with a mock user so quiz routes are accessible
2. route quiz API calls to an in-memory mock provider instead of the backend

This keeps the change narrow and avoids introducing a full mocking framework.

## Scope

### Auto-Auth for Quiz Offline Mode

- On app startup, if offline mode is enabled and no authenticated session exists:
  - set a mock access token
  - set a mock refresh token
  - set a mock user
  - mark `isAuthenticated = true`

This is only to satisfy route protection and layout expectations.

### Mock Quiz Provider

Add an in-memory quiz provider that supports:

- quiz list
- quiz detail
- quiz questions
- start session
- get session
- submit answer
- complete session
- wrong answers for a session
- quiz stats
- quiz history

The mock state should live entirely in the browser runtime and reset on full reload unless persisted intentionally.

### API Integration

- `quiz.api.ts` should branch on `VITE_QUIZ_OFFLINE_MODE`
- If enabled:
  - use mock provider functions
- If disabled:
  - keep current backend behavior unchanged

## Data Rules

- Keep mock data small but realistic.
- Include at least 2 quizzes with multiple questions.
- Support correct/incorrect answers, scoring, timing, pass/fail, and wrong answer review.
- Keep the mock contract aligned with the existing frontend types so pages do not need route-specific forks.

## Non-Goals

- No mock support for flashcards, education, community, or auth pages beyond minimal auto-auth.
- No MSW or external mock server.
- No backend changes.
- No replacement of the real backend integration path.

## Testing

- Add pure tests for the mock provider and any helper logic introduced.
- Verify frontend build passes.
- Manual verification should confirm the full quiz flow works with frontend only.
