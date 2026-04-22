# Quiz Offline HSK2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `HSK2 Practice` to offline quiz mode with the same configuration and session flow used by HSK1.

**Architecture:** Extend the offline provider with HSK2 pools and generalize the HSK-specific detail/session logic so both HSK1 and HSK2 can share the same configuration path.

**Tech Stack:** React 19, TypeScript, Node test runner

---

### Task 1: Add Tests for HSK2 Entry and Session Support

**Files:**
- Modify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Write the failing test**

Add:

```ts
test('offline provider exposes an HSK2 entry point', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();
  const hsk2 = quizzes.items.find((quiz) => quiz.id === 'offline-quiz-hsk2');

  assert.ok(hsk2);
  assert.equal(hsk2?.topic, 'HSK2');
});

test('offline HSK2 sessions honor selected difficulty and question count', async () => {
  const provider = createQuizOfflineProvider();
  const session = await provider.startQuizSession('offline-quiz-hsk2', {
    difficulty: 'MEDIUM',
    questionCount: 20,
  });
  const questions = await provider.getSessionQuestions(session.id);

  assert.equal(questions.length, 20);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL because HSK2 does not exist yet.

- [ ] **Step 3: Write minimal implementation**

No production code yet; use the test to lock the new requirement first.

- [ ] **Step 4: Run test to verify it still fails for the expected reason**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL on missing HSK2 support.

### Task 2: Extend Provider with HSK2 Pools

**Files:**
- Modify: `education_fe/src/mocks/quizOffline.ts`

- [ ] **Step 1: Write the failing test**

Add to `tests/quiz-offline.test.ts`:

```ts
test('offline HSK2 includes both vocabulary and contextual prompts', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk2');
  const prompts = (quiz.questions ?? []).map((item) => item.question);

  const contextual = prompts.filter((question) => question.includes('如果') || question.includes('哪句') || question.includes('怎么回答')).length;
  const vocabulary = prompts.filter((question) => question.includes('有 nghĩa') || question.includes('ý gần đúng')).length;

  assert.equal(contextual > 0, true);
  assert.equal(vocabulary > 0, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL before HSK2 question bank exists.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/mocks/quizOffline.ts`:

- Add `HSK2_WORD_BANK`
- Add `HSK2_EASY_QUESTIONS`, `HSK2_MEDIUM_QUESTIONS`, `HSK2_HARD_QUESTIONS`
- Add one quiz:

```ts
{
  id: 'offline-quiz-hsk2',
  name: 'HSK2 Practice',
  description: 'Choose difficulty and number of questions before starting.',
  topic: 'HSK2',
  questionType: 'MULTIPLE_CHOICE',
  questionCount: 30,
  difficulty: 'MIXED',
  ...
}
```

- Update `startQuizSession()` so:
  - `offline-quiz-hsk1` uses HSK1 pools
  - `offline-quiz-hsk2` uses HSK2 pools

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: PASS.

### Task 3: Reuse HSK Config UI in QuizDetailPage

**Files:**
- Modify: `education_fe/src/pages/quiz/QuizDetailPage.tsx`

- [ ] **Step 1: Write the failing test**

Use code-level verification for this page-level reuse.

- [ ] **Step 2: Run a baseline search**

Run:

```bash
rg "offline-quiz-hsk1|HSK1" src/pages/quiz/QuizDetailPage.tsx
```

Expected: page still has HSK1-specific conditions before generalization.

- [ ] **Step 3: Write minimal implementation**

Generalize HSK-specific logic:

```ts
const isOfflineHskQuiz = quiz?.id === 'offline-quiz-hsk1' || quiz?.id === 'offline-quiz-hsk2';
```

Then use:
- `isOfflineHskQuiz` instead of `isOfflineHsk1Quiz`
- `quiz.topic === 'HSK1' ? ... : HSK2 pools ...`

Keep the same preview/config UX for both HSK quizzes.

- [ ] **Step 4: Run baseline search again**

Run:

```bash
rg "offline-quiz-hsk1|offline-quiz-hsk2|isOfflineHskQuiz" src/pages/quiz/QuizDetailPage.tsx
```

Expected: logic is generalized for both HSK1 and HSK2.

### Task 4: Verify Frontend Build

**Files:**
- Verify: `education_fe/src/mocks/quizOffline.ts`
- Verify: `education_fe/src/pages/quiz/QuizDetailPage.tsx`
- Verify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Run targeted tests**

Run:

```bash
node --experimental-strip-types --test tests/quiz-offline.test.ts tests/quiz-detail-preview.test.ts tests/quiz-session-view.test.ts tests/quiz-result-view.test.ts tests/quiz-list-view.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run frontend build**

Run:

```bash
npm run build
```

Expected: TypeScript build and Vite build succeed.
