# Quiz Offline HSK1 Contextual Question Bank Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the offline HSK1 question bank so it feels more like a real HSK1 practice test, with contextual question-answer prompts instead of mostly direct vocabulary meaning lookups.

**Architecture:** Keep the existing HSK1 offline structure intact (single HSK1 entry, difficulty selector, configurable question count), but rewrite the HSK1 question content generators so contextual prompts dominate the pools. Preserve session/randomization logic and only change the content generation layer plus the tests that describe that content.

**Tech Stack:** React 19, TypeScript, Node test runner

---

### Task 1: Tighten Tests Toward Contextual HSK1 Content

**Files:**
- Modify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Write the failing test**

Add a new test to `education_fe/tests/quiz-offline.test.ts`:

```ts
test('offline HSK1 pools emphasize contextual prompts instead of only word-meaning lookups', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk1');

  const prompts = (quiz.questions ?? []).map((item) => item.question);
  const contextualCount = prompts.filter((question) =>
    question.includes('如果') ||
    question.includes('哪句') ||
    question.includes('怎么回答') ||
    question.includes('什么意思') ||
    question.includes('正在问') ||
    question.includes('说')
  ).length;

  assert.equal(contextualCount >= 20, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL because the current HSK1 pools are still too vocabulary-lookup heavy.

- [ ] **Step 3: Write minimal implementation**

Do not change production code yet; first lock the new contextual expectation in tests.

- [ ] **Step 4: Run test to verify it still fails for the expected reason**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL on the new contextual prompt count.

### Task 2: Rewrite HSK1 Question Generators Around Contextual Prompts

**Files:**
- Modify: `education_fe/src/mocks/quizOffline.ts`

- [ ] **Step 1: Write the failing test**

Add one more test to `education_fe/tests/quiz-offline.test.ts`:

```ts
test('offline HSK1 still covers key beginner topic groups after contextual rewrite', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk1');
  const questionText = (quiz.questions ?? []).map((item) => item.question).join(' ');

  assert.equal(questionText.includes('老师'), true);
  assert.equal(questionText.includes('学生'), true);
  assert.equal(questionText.includes('喜欢'), true);
  assert.equal(questionText.includes('星期'), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL before the new contextual pools are written.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/mocks/quizOffline.ts`:

- Replace the current `createHsk1Questions()` implementation so it generates contextual questions like:

```ts
question: '如果有人说“你好”，你怎么回答？'
question: '“你叫什么名字？” 这句话正在问什么？'
question: '哪一句最适合回答“你是哪国人？”'
question: '“老师有几个学生？” 这句话是什么意思？'
```

- Rewrite or expand `createHsk1ContextQuestions()` so the majority of prompts in all three difficulty pools are contextual.
- Keep all HSK1 questions `MULTIPLE_CHOICE` only.
- Keep easy/medium/hard separation by:
  - `EASY`: direct dialogue response and obvious context
  - `MEDIUM`: short sentence interpretation and likely distractors
  - `HARD`: more plausible distractors and slightly less direct context

Do not change the offline provider’s session logic, only the content generation.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: PASS.

### Task 3: Verify Frontend Build and Quiz Flow Stability

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
1. HSK1 Practice still appears as one entry point.
2. Difficulty and question-count selection still works.
3. Started quizzes show contextual question-answer prompts instead of mostly word-meaning prompts.
4. Result/history flow remains intact.
```
