# Quiz Offline HSK1 Split by Difficulty Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single offline HSK1 quiz with three offline HSK1 quizzes by difficulty, remove true/false questions, and keep each attempt limited to 20 random questions.

**Architecture:** Refactor the HSK1 mock data in `quizOffline.ts` into three pools (`easy`, `medium`, `hard`) and expose them as three separate offline quizzes. Each session keeps using a stable 20-question random subset from the chosen pool, and the tests are updated to assert the new structure and question-type rules.

**Tech Stack:** React 19, TypeScript, Node test runner

---

### Task 1: Update Tests for Three HSK1 Difficulty Quizzes

**Files:**
- Modify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Write the failing test**

Replace the single-HSK1 expectations with:

```ts
test('offline provider exposes three HSK1 quizzes by difficulty', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();

  const hskQuizzes = quizzes.items.filter((quiz) => quiz.topic === 'HSK1');

  assert.equal(hskQuizzes.length, 3);
  assert.deepEqual(
    hskQuizzes.map((quiz) => quiz.difficulty).sort(),
    ['EASY', 'HARD', 'MEDIUM'],
  );
  assert.equal(hskQuizzes.every((quiz) => quiz.questionType === 'MULTIPLE_CHOICE'), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL because only one HSK1 quiz exists today.

- [ ] **Step 3: Write minimal implementation**

No production code yet; this step is only to lock the new required structure in tests.

- [ ] **Step 4: Run test to verify it still fails for the expected reason**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL on the new HSK1 structure assertions.

### Task 2: Split the HSK1 Mock Data into Easy/Medium/Hard

**Files:**
- Modify: `education_fe/src/mocks/quizOffline.ts`

- [ ] **Step 1: Write the failing test**

Update/add tests in `education_fe/tests/quiz-offline.test.ts`:

```ts
test('each HSK1 difficulty quiz runs a 20-question randomized session', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();
  const hskQuizzes = quizzes.items.filter((quiz) => quiz.topic === 'HSK1');

  for (const quiz of hskQuizzes) {
    const session = await provider.startQuizSession(quiz.id);
    const questions = await provider.getSessionQuestions(session.id);

    assert.equal(questions.length, 20);
    assert.equal(questions.every((question) => question.type === 'MULTIPLE_CHOICE'), true);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL because the HSK1 data is still one quiz and still contains true/false entries.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/mocks/quizOffline.ts`:

- Replace `HSK1_QUESTIONS` with three generated pools:
  - `HSK1_EASY_QUESTIONS`
  - `HSK1_MEDIUM_QUESTIONS`
  - `HSK1_HARD_QUESTIONS`
- Remove all `TRUE_FALSE` question generation from HSK1.
- Keep only `MULTIPLE_CHOICE` generation.
- Replace the single HSK1 quiz entry with:

```ts
{
  id: 'offline-quiz-hsk1-easy',
  name: 'HSK1 Easy Practice',
  topic: 'HSK1',
  difficulty: 'EASY',
  questionType: 'MULTIPLE_CHOICE',
  questionCount: 20,
  ...
  questions: HSK1_EASY_QUESTIONS,
}
```

```ts
{
  id: 'offline-quiz-hsk1-medium',
  name: 'HSK1 Medium Practice',
  topic: 'HSK1',
  difficulty: 'MEDIUM',
  questionType: 'MULTIPLE_CHOICE',
  questionCount: 20,
  ...
  questions: HSK1_MEDIUM_QUESTIONS,
}
```

```ts
{
  id: 'offline-quiz-hsk1-hard',
  name: 'HSK1 Hard Practice',
  topic: 'HSK1',
  difficulty: 'HARD',
  questionType: 'MULTIPLE_CHOICE',
  questionCount: 20,
  ...
  questions: HSK1_HARD_QUESTIONS,
}
```

Keep each question pool at least 20 questions large so random selection is valid. If you want stronger randomness, make each pool larger than 20.

In `startQuizSession()`:
- keep random subset logic for `HSK1`
- always pick 20 from the chosen quiz pool

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: PASS.

### Task 3: Make Quiz Detail Consistent with 20-Question Attempts

**Files:**
- Modify: `education_fe/src/pages/quiz/QuizDetailPage.tsx`

- [ ] **Step 1: Write the failing test**

Use code-level verification for this page because there is no page test harness.

- [ ] **Step 2: Run a baseline search**

Run:

```bash
rg "quiz.questionCount|Questions \(" src/pages/quiz/QuizDetailPage.tsx
```

Expected: the page currently renders counts based on the raw question array.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/pages/quiz/QuizDetailPage.tsx`:

- Keep `Questions` and `questionCount` display aligned with the attempt model.
- For offline HSK1 quizzes, show `20` as the attempt question count.
- Limit preview list to 20 items maximum:

```ts
const previewQuestions = quiz.questions?.slice(0, 20) ?? [];
```

Then render:

```tsx
Questions ({previewQuestions.length})
```

and map over `previewQuestions` instead of the full question list.

- [ ] **Step 4: Run baseline search again**

Run:

```bash
rg "previewQuestions|slice\(0, 20\)" src/pages/quiz/QuizDetailPage.tsx
```

Expected: the preview now uses a capped 20-question subset.

### Task 4: Verify Frontend Behavior

**Files:**
- Verify: `education_fe/src/mocks/quizOffline.ts`
- Verify: `education_fe/src/pages/quiz/QuizDetailPage.tsx`
- Verify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Run targeted tests**

Run:

```bash
node --experimental-strip-types --test tests/quiz-offline.test.ts tests/quiz-session-view.test.ts tests/quiz-result-view.test.ts tests/quiz-list-view.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run frontend build**

Run:

```bash
npm run build
```

Expected: TypeScript build and Vite build succeed.

- [ ] **Step 3: Manual verification**

With:

```bash
VITE_QUIZ_OFFLINE_MODE=true
```

Verify:

```text
1. /quiz shows HSK1 Easy Practice, HSK1 Medium Practice, and HSK1 Hard Practice.
2. No HSK1 quiz uses TRUE_FALSE.
3. Starting any HSK1 quiz gives 20 questions only.
4. The detail page preview does not imply more than 20 questions per attempt.
```
