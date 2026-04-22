# Quiz Offline HSK1 Config Before Start Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user open a single HSK1 quiz entry, choose difficulty and question count (10/20/30), and only then start the offline quiz attempt.

**Architecture:** Collapse the current three visible HSK1 entries into one HSK1 entry point, then add a configuration panel on the HSK1 detail page. Extend the offline provider/session start path so the selected difficulty and question count control the random session subset.

**Tech Stack:** React 19, TypeScript, TanStack Query, React Router, Node test runner

---

### Task 1: Update Offline Tests to Expect a Single HSK1 Entry and Configurable Session Sizes

**Files:**
- Modify: `education_fe/tests/quiz-offline.test.ts`

- [ ] **Step 1: Write the failing test**

Replace the HSK1 structure test with:

```ts
test('offline provider exposes a single HSK1 entry point', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();

  const hskQuizzes = quizzes.items.filter((quiz) => quiz.topic === 'HSK1');

  assert.equal(hskQuizzes.length, 1);
  assert.equal(hskQuizzes[0]?.id, 'offline-quiz-hsk1');
});
```

Add a new session-size test:

```ts
test('offline HSK1 sessions honor selected difficulty and question count', async () => {
  const provider = createQuizOfflineProvider();

  const easy10 = await provider.startQuizSession('offline-quiz-hsk1', {
    difficulty: 'EASY',
    questionCount: 10,
  });
  const easyQuestions = await provider.getSessionQuestions(easy10.id);
  assert.equal(easyQuestions.length, 10);

  const hard30 = await provider.startQuizSession('offline-quiz-hsk1', {
    difficulty: 'HARD',
    questionCount: 30,
  });
  const hardQuestions = await provider.getSessionQuestions(hard30.id);
  assert.equal(hardQuestions.length, 30);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL because the provider still exposes three HSK1 quizzes and does not accept session config yet.

- [ ] **Step 3: Write minimal implementation**

No production code in this step; lock the new behavior in tests first.

- [ ] **Step 4: Run test to verify it still fails for the expected reason**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL on the new HSK1 entry/config expectations.

### Task 2: Collapse HSK1 Into One Entry Point and Add Configurable Session Start

**Files:**
- Modify: `education_fe/src/mocks/quizOffline.ts`
- Modify: `education_fe/src/api/quiz.api.ts`

- [ ] **Step 1: Write the failing test**

Add one more regression case to `tests/quiz-offline.test.ts`:

```ts
test('offline HSK1 detail still exposes enough pool questions to configure from', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk1');

  assert.ok(quiz.questions);
  assert.equal((quiz.questions?.length ?? 0) >= 60, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: FAIL before the HSK1 data is collapsed into one provider entry.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/mocks/quizOffline.ts`:

- Replace the three visible HSK1 quiz objects with one:

```ts
{
  id: 'offline-quiz-hsk1',
  name: 'HSK1 Practice',
  description: 'Choose difficulty and number of questions before starting.',
  topic: 'HSK1',
  questionType: 'MULTIPLE_CHOICE',
  questionCount: 30,
  difficulty: 'MIXED',
  ...
  questions: [...HSK1_EASY_QUESTIONS, ...HSK1_MEDIUM_QUESTIONS, ...HSK1_HARD_QUESTIONS],
}
```

- Add a start config type:

```ts
type OfflineQuizStartConfig = {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount?: 10 | 20 | 30;
};
```

- Change `startQuizSession()` signature to accept config:

```ts
async startQuizSession(quizId: string, config?: OfflineQuizStartConfig): Promise<QuizSession>
```

- For HSK1, choose the source pool based on `config.difficulty` and pick exactly `config.questionCount ?? 20`.
- For non-HSK1 quizzes, keep current behavior.

In `education_fe/src/api/quiz.api.ts`:

- pass the optional `dto` to offline provider:

```ts
if (quizOfflineMode) {
  return offlineQuizProvider.startQuizSession(quizId, dto as {
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    questionCount?: 10 | 20 | 30;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/quiz-offline.test.ts`
Expected: PASS.

### Task 3: Add HSK1 Config Panel Before Start

**Files:**
- Modify: `education_fe/src/pages/quiz/QuizDetailPage.tsx`

- [ ] **Step 1: Write the failing test**

Use code-level verification because this repo does not have a page-level test harness for quiz detail interactions.

- [ ] **Step 2: Run a baseline search**

Run:

```bash
rg "Start Quiz|offline-quiz-hsk1-easy|offline-quiz-hsk1-medium|offline-quiz-hsk1-hard" src/pages/quiz/QuizDetailPage.tsx src/mocks/quizOffline.ts
```

Expected: the old structure or direct start flow is still present before implementation.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/pages/quiz/QuizDetailPage.tsx`:

- detect the new single HSK1 entry:

```ts
const isOfflineHsk1Quiz = quiz?.id === 'offline-quiz-hsk1';
```

- add local state for config:

```ts
const [selectedDifficulty, setSelectedDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
const [selectedQuestionCount, setSelectedQuestionCount] = useState<10 | 20 | 30>(20);
```

- for HSK1 only, render a config block with:
  - difficulty buttons or select
  - question count buttons for `10`, `20`, `30`

- update start link to include query params:

```tsx
to={`/quiz/${quiz.id}/session?difficulty=${selectedDifficulty}&count=${selectedQuestionCount}`}
```

- keep preview capped at 20 sample questions.

- [ ] **Step 4: Run baseline search again**

Run:

```bash
rg "selectedDifficulty|selectedQuestionCount|difficulty=|count=" src/pages/quiz/QuizDetailPage.tsx
```

Expected: the config flow is now present.

### Task 4: Read Config in QuizSessionPage

**Files:**
- Modify: `education_fe/src/pages/quiz/QuizSessionPage.tsx`

- [ ] **Step 1: Write the failing test**

Use provider tests as the behavioral guarantee and code-level verification for page query-param wiring.

- [ ] **Step 2: Run a baseline search**

Run:

```bash
rg "useSearchParams|difficulty|count" src/pages/quiz/QuizSessionPage.tsx
```

Expected: no config parsing exists yet.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/pages/quiz/QuizSessionPage.tsx`:

- import `useSearchParams`
- read config from query params:

```ts
const [searchParams] = useSearchParams();
const difficulty = searchParams.get('difficulty') as 'EASY' | 'MEDIUM' | 'HARD' | null;
const count = searchParams.get('count');
```

- pass config into `startMutation`:

```ts
mutationFn: () => startQuizSession(quizId!, {
  difficulty: difficulty ?? undefined,
  questionCount: count === '10' || count === '20' || count === '30' ? Number(count) as 10 | 20 | 30 : undefined,
}),
```

- [ ] **Step 4: Run baseline search again**

Run:

```bash
rg "useSearchParams|questionCount" src/pages/quiz/QuizSessionPage.tsx
```

Expected: the session page now consumes HSK1 config.

### Task 5: Verify Frontend Build and Offline Flow

**Files:**
- Verify: `education_fe/src/mocks/quizOffline.ts`
- Verify: `education_fe/src/pages/quiz/QuizDetailPage.tsx`
- Verify: `education_fe/src/pages/quiz/QuizSessionPage.tsx`
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
1. /quiz shows one HSK1 Practice entry.
2. Opening HSK1 shows difficulty and question-count selectors.
3. Starting with Easy + 10 gives 10 questions.
4. Starting with Hard + 30 gives 30 questions.
5. Review still happens only at the end.
```
