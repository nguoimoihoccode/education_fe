# Quiz Offline HSK1 Expanded Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing frontend-only `HSK1 Mock Exam` so it contains a much larger question bank for longer HSK1 practice without any backend.

**Architecture:** Keep the change entirely inside the existing quiz offline mock provider. Add more HSK1 questions to the existing `offline-quiz-hsk1` data entry, then tighten the offline tests so they require the larger question set and verify the expanded pack still completes full quiz flow.

**Tech Stack:** React 19, TypeScript, Node test runner

---

### Task 1: Tighten HSK1 Offline Quiz Expectations

**Files:**
- Modify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Write the failing test**

Update the HSK1 expectation in `education_fe/tests/quiz-offline.test.ts` to require a larger pack:

```ts
test('offline provider exposes an HSK1 quiz pack', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();

  const hsk1Quiz = quizzes.items.find((quiz) => quiz.topic === 'HSK1');

  assert.ok(hsk1Quiz);
  assert.equal(hsk1Quiz?.questionCount >= 30, true);
  assert.equal((hsk1Quiz?.questions?.length ?? 0) >= 30, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL because the HSK1 quiz currently only contains around 15 questions.

- [ ] **Step 3: Write minimal implementation**

No production code yet; the purpose of this task is to lock the higher expected size before editing mock data.

- [ ] **Step 4: Run test to verify it still fails for the expected reason**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL on the HSK1 size assertion.

### Task 2: Expand the HSK1 Question Bank

**Files:**
- Modify: `education_fe/src/mocks/quizOffline.ts`

- [ ] **Step 1: Write the failing test**

Add one more regression case to `education_fe/tests/quiz-offline.test.ts`:

```ts
test('offline HSK1 quiz includes multiple beginner topic groups', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();
  const quiz = quizzes.items.find((item) => item.topic === 'HSK1');

  assert.ok(quiz);

  const questionText = (quiz?.questions ?? []).map((item) => item.question).join(' ');

  assert.equal(questionText.includes('老师'), true);
  assert.equal(questionText.includes('学生'), true);
  assert.equal(questionText.includes('几'), true);
  assert.equal(questionText.includes('喜欢'), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL because those extra topic groups are not all present yet.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/mocks/quizOffline.ts`:

- Keep the existing `offline-quiz-hsk1` entry
- Increase `questionCount` from `15` to at least `30`
- Append 15 or more new HSK1 questions covering:
  - school words like `老师`, `学生`
  - question forms like `几`
  - basic preference/action verbs like `喜欢`
  - classroom/daily vocabulary
  - additional family, number, and time questions

Each new question must include:

```ts
{
  id: 'hsk1-q16',
  quizId: 'offline-quiz-hsk1',
  question: '...',
  type: 'MULTIPLE_CHOICE',
  options: ['...', '...', '...', '...'],
  correctAnswer: '...',
  explanation: '...',
  points: 1,
  createdAt: nowIso(),
  updatedAt: nowIso(),
}
```

Keep question quality simple and internally consistent; do not add new runtime behavior.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: PASS.

### Task 3: Verify Expanded HSK1 Pack

**Files:**
- Verify: `education_fe/src/mocks/quizOffline.ts`
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
1. /quiz still shows HSK1 Mock Exam.
2. The quiz detail page shows the expanded question count.
3. The HSK1 quiz can still start, submit, and complete offline.
4. HSK1 attempts still appear in history.
```
