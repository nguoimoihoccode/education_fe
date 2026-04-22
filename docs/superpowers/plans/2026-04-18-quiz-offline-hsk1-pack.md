# Quiz Offline HSK1 Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a built-in HSK1 quiz pack to the frontend-only quiz offline mode so the user can run the frontend alone and immediately practice an HSK1 quiz without any backend.

**Architecture:** Keep the change entirely inside the existing quiz offline mock provider. Add one realistic HSK1 aggregate quiz with enough questions to exercise the full quiz flow, then extend the offline tests to verify the HSK1 quiz is present and usable.

**Tech Stack:** React 19, TypeScript, Node test runner

---

### Task 1: Add HSK1 Offline Quiz Data

**Files:**
- Modify: `education_fe/src/mocks/quizOffline.ts`
- Modify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `education_fe/tests/quiz-offline.test.ts`:

```ts
test('offline provider exposes an HSK1 quiz pack', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();

  const hsk1Quiz = quizzes.items.find((quiz) => quiz.topic === 'HSK1');

  assert.ok(hsk1Quiz);
  assert.equal(hsk1Quiz?.questionCount >= 15, true);
  assert.equal((hsk1Quiz?.questions?.length ?? 0) >= 15, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL because no HSK1 quiz exists yet in the offline provider.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/mocks/quizOffline.ts`, add one new `OfflineQuiz` entry to `OFFLINE_QUIZZES`:

```ts
{
  id: 'offline-quiz-hsk1',
  name: 'HSK1 Mock Exam',
  description: 'Offline HSK1 practice quiz for frontend-only mode.',
  topic: 'HSK1',
  questionType: 'MULTIPLE_CHOICE',
  questionCount: 15,
  timeLimit: 900,
  passingScore: 60,
  difficulty: 'EASY',
  isPublic: true,
  shuffleQuestions: false,
  shuffleAnswers: false,
  showCorrectAnswer: true,
  allowRetry: true,
  maxRetries: 99,
  userId: 1,
  createdAt: nowIso(),
  updatedAt: nowIso(),
  questions: [
    // 15+ HSK1 questions with realistic options, correctAnswer, explanation
  ],
}
```

Use simple HSK1 topics only:
- greetings
- numbers
- family members
- common verbs
- daily phrases
- date/time basics

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: PASS.

### Task 2: Verify HSK1 Quiz Can Complete Full Flow

**Files:**
- Modify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `education_fe/tests/quiz-offline.test.ts`:

```ts
test('offline HSK1 quiz can complete a session and appear in history', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();
  const quiz = quizzes.items.find((item) => item.topic === 'HSK1');

  assert.ok(quiz);

  const session = await provider.startQuizSession(quiz!.id);
  const firstQuestion = quiz!.questions![0];

  await provider.submitQuizAnswer(session.id, {
    questionId: firstQuestion.id,
    answer: firstQuestion.correctAnswer,
  });

  const completed = await provider.completeQuizSession(session.id);
  const history = await provider.getQuizHistory();

  assert.equal(completed.quizId, quiz!.id);
  assert.equal(history.items.some((item) => item.quizId === quiz!.id), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL before the HSK1 quiz data is complete and usable.

- [ ] **Step 3: Write minimal implementation**

Ensure the HSK1 quiz entry has:
- valid `questionCount`
- non-empty `questions`
- valid `correctAnswer` values matching one option
- explanations for at least the first few questions

No new architectural changes are needed beyond making the HSK1 dataset internally consistent.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: PASS.

### Task 3: Verify Frontend Build with HSK1 Pack

**Files:**
- Verify: `education_fe/src/mocks/quizOffline.ts`
- Verify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Run targeted tests**

Run:

```bash
node --experimental-strip-types --test tests/quiz-offline.test.ts
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
1. /quiz shows an HSK1 quiz card.
2. Opening the HSK1 quiz shows 15+ questions.
3. Starting and finishing the HSK1 quiz works without backend.
4. The HSK1 attempt appears in quiz history.
```
