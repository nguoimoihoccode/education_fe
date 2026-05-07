# Education UI Must-Fix Now Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the highest-impact education UI mismatches so the learner-facing experience feels like a real language-learning product instead of a renamed stock dashboard.

**Architecture:** Keep changes small and page-local. Use the existing Node test runner contract style in `tests/learning-ui-contract.test.ts` to lock UI copy and learner-safe behavior before editing pages. Prefer honest, neutral progress messaging when the current API cannot provide personalized metrics yet, instead of inventing fake numbers.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind utility classes, Node test runner, ESLint, Vite

**Repository note:** `npm run lint` currently fails on unrelated existing files such as `src/pages/Social.tsx`, `src/pages/UserProfile.tsx`, and several community/user-profile helpers. Treat `npm run build` plus targeted ESLint on touched files as the verification gate for this plan.

---

## File Map

- Modify: `education_fe/tests/learning-ui-contract.test.ts`
  Purpose: Source-level regression checks for learner-safe copy, honest metrics, and education-first shell wording.
- Modify: `education_fe/src/pages/quiz/QuizDetailPage.tsx`
  Purpose: Remove answer leakage, fix duplicate metadata, and clean up learner-facing copy.
- Modify: `education_fe/src/components/layout/Layout.tsx`
  Purpose: Stop importing stock-branded shell styles directly and switch to education-first shell wiring.
- Modify: `education_fe/src/components/layout/Header.tsx`
  Purpose: Replace dashboard-first framing with education-first framing.
- Modify: `education_fe/src/components/layout/Sidebar.tsx`
  Purpose: Keep grouped learning navigation while removing stock/dashboard cues.
- Modify: `education_fe/src/components/layout/navConfig.tsx`
  Purpose: Reorder and relabel navigation around learning workflows.
- Create: `education_fe/src/styles/education-shell.css`
  Purpose: Hold the minimal shell styles needed by education pages without reusing `stock-redesign.css` as the source of truth.
- Modify: `education_fe/src/pages/Education.tsx`
  Purpose: Replace fake learning metrics with honest copy or available real data.
- Modify: `education_fe/src/pages/CourseDetail.tsx`
  Purpose: Remove fake XP, use real course progress fields, and localize the key learner actions.
- Modify: `education_fe/src/pages/LessonView.tsx`
  Purpose: Remove placeholder progress artifacts and standardize lesson copy.
- Modify: `education_fe/src/pages/quiz/QuizSessionPage.tsx`
  Purpose: Localize quiz session flow and keep the question flow focused.
- Modify: `education_fe/src/pages/quiz/QuizResultPage.tsx`
  Purpose: Localize result feedback and remove current lint issue in the touched file.
- Modify: `education_fe/src/pages/quiz/QuizStatsPage.tsx`
  Purpose: Localize quiz stats framing without changing the existing data model.
- Modify: `education_fe/src/components/quiz/QuizCard.tsx`
  Purpose: Localize quiz-card labels and learner-facing action text.

### Task 1: Fix Quiz Detail Learner Safety and Copy

**Files:**
- Modify: `education_fe/tests/learning-ui-contract.test.ts`
- Modify: `education_fe/src/pages/quiz/QuizDetailPage.tsx`
- Verify: `education_fe/tests/quiz-detail-preview.test.ts`

- [ ] **Step 1: Write the failing test**

Add this test to `education_fe/tests/learning-ui-contract.test.ts`:

```ts
test('quiz detail keeps preview learner-safe and localized', () => {
  const quizDetail = readSource('src/pages/quiz/QuizDetailPage.tsx');

  assert.match(quizDetail, /Bắt đầu làm bài/);
  assert.match(quizDetail, /Câu hỏi mẫu/);
  assert.doesNotMatch(quizDetail, /Bat dau lam bai|Cau hoi mau/);
  assert.doesNotMatch(quizDetail, /Correct Answer:/);

  const questionLabelCount =
    quizDetail.match(/<dt className="text-slate-400">Questions<\/dt>/g)?.length ?? 0;

  assert.equal(questionLabelCount, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/learning-ui-contract.test.ts
```

Expected: FAIL because `QuizDetailPage.tsx` still contains `Correct Answer`, non-accented Vietnamese strings, and duplicated `Questions` metadata.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/pages/quiz/QuizDetailPage.tsx` make these specific changes:

- Remove the answer reveal block from question previews:

```tsx
{/* delete the entire "Correct Answer" preview block */}
```

- Fix the duplicated questions value row so it keeps only one `<dd>`:

```tsx
<div className="flex justify-between">
  <dt className="text-slate-400">Số câu</dt>
  <dd className="text-white font-medium">
    {isOfflineHskQuiz ? selectedQuestionCount : quiz.questionCount}
  </dd>
</div>
```

- Replace learner-facing copy with Vietnamese text:

```tsx
<Link
  to={isOfflineHskQuiz
    ? `/quiz/${quiz.id}/session?difficulty=${selectedDifficulty}&count=${selectedQuestionCount}`
    : `/quiz/${quiz.id}/session`}
  className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-accent-900/30"
>
  <Play className="w-5 h-5" />
  Bắt đầu làm bài
</Link>
```

- Replace the HSK config heading and preview copy with generalized Vietnamese strings:

```tsx
<h3 className="font-bold text-white mb-4">Cấu hình luyện HSK</h3>
<p className="text-sm text-slate-400 mb-4">
  Xem trước {selectedQuestionCount} câu - Mức {selectedDifficulty === 'EASY' ? 'Dễ' : selectedDifficulty === 'MEDIUM' ? 'Vừa' : 'Khó'}
</p>
```

- [ ] **Step 4: Run tests to verify it passes**

Run:

```bash
node --test tests/learning-ui-contract.test.ts tests/quiz-detail-preview.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run targeted lint and build checks**

Run:

```bash
npx eslint "src/pages/quiz/QuizDetailPage.tsx" "tests/learning-ui-contract.test.ts"
npm run build
```

Expected: touched files lint clean, frontend build succeeds.

- [ ] **Step 6: Commit**

```bash
git add tests/learning-ui-contract.test.ts src/pages/quiz/QuizDetailPage.tsx
git commit -m "fix: clean up quiz detail learner ui"
```

### Task 2: Convert the Shared Shell to Education-First Framing

**Files:**
- Modify: `education_fe/tests/learning-ui-contract.test.ts`
- Modify: `education_fe/src/components/layout/Layout.tsx`
- Modify: `education_fe/src/components/layout/Header.tsx`
- Modify: `education_fe/src/components/layout/Sidebar.tsx`
- Modify: `education_fe/src/components/layout/navConfig.tsx`
- Create: `education_fe/src/styles/education-shell.css`

- [ ] **Step 1: Write the failing test**

Add this test to `education_fe/tests/learning-ui-contract.test.ts`:

```ts
test('shared shell is education-first instead of stock-first', () => {
  const layout = readSource('src/components/layout/Layout.tsx');
  const header = readSource('src/components/layout/Header.tsx');
  const navConfig = readSource('src/components/layout/navConfig.tsx');

  assert.doesNotMatch(layout, /stock-redesign\.css/);
  assert.match(navConfig, /Hôm nay|Khóa học|Flashcards|Quiz|Tài liệu|Tiến độ/);
  assert.doesNotMatch(header, /portfolio|market|trading|watchlist/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/learning-ui-contract.test.ts
```

Expected: FAIL because `Layout.tsx` still imports `stock-redesign.css` and the shell still reflects stock/dashboard language.

- [ ] **Step 3: Write minimal implementation**

Implement the shell change in this order:

- Create `education_fe/src/styles/education-shell.css` and copy only the selectors actually needed by `Layout`, `Header`, and `Sidebar`.
- Switch `Layout.tsx` to import the new stylesheet:

```tsx
import '@/styles/education-shell.css';
```

- Update `navConfig.tsx` so the primary labels follow learning flow, for example:

```tsx
title: 'Hôm nay'
title: 'Khóa học'
title: 'Flashcards'
title: 'Quiz'
title: 'Tài liệu'
title: 'Tiến độ'
```

- Keep the existing grouped-navigation structure, but remove stock/dashboard wording from `Header.tsx` and `Sidebar.tsx`.
- Do not rewrite all shell CSS. Copy the smallest set of shell styles needed to detach the education app from the stock-branded stylesheet.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test tests/learning-ui-contract.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run targeted lint and build checks**

Run:

```bash
npx eslint "src/components/layout/Layout.tsx" "src/components/layout/Header.tsx" "src/components/layout/Sidebar.tsx" "src/components/layout/navConfig.tsx" "src/styles/education-shell.css" "tests/learning-ui-contract.test.ts"
npm run build
```

Expected: touched files lint clean, frontend build succeeds.

- [ ] **Step 6: Commit**

```bash
git add tests/learning-ui-contract.test.ts src/components/layout/Layout.tsx src/components/layout/Header.tsx src/components/layout/Sidebar.tsx src/components/layout/navConfig.tsx src/styles/education-shell.css
git commit -m "refactor: frame shared shell around learning workflows"
```

### Task 3: Replace Fake Education Home Metrics with Honest Signals

**Files:**
- Modify: `education_fe/tests/learning-ui-contract.test.ts`
- Modify: `education_fe/src/pages/Education.tsx`

- [ ] **Step 1: Write the failing test**

Add this test to `education_fe/tests/learning-ui-contract.test.ts`:

```ts
test('education home avoids fake study metrics when api data is unavailable', () => {
  const education = readSource('src/pages/Education.tsx');

  assert.doesNotMatch(education, /15 phút/);
  assert.doesNotMatch(education, /Hoàn thành 1 bài/);
  assert.doesNotMatch(education, /value="Due"/);
  assert.doesNotMatch(education, /value="Quiz"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/learning-ui-contract.test.ts
```

Expected: FAIL because `Education.tsx` still hardcodes those placeholders.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/pages/Education.tsx`:

- Replace the fake lesson meta with honest copy based on available course data:

```tsx
<div className="edu-lesson-meta">
  <span>
    <Clock className="h-4 w-4" />
    {nextCourse ? `${nextCourse.totalLessons || 0} bài học` : 'Khám phá khóa học'}
  </span>
  <span>
    <Target className="h-4 w-4" />
    {isAuthenticated ? 'Mở lộ trình của bạn' : 'Bắt đầu học'}
  </span>
</div>
```

- Replace fake values in the study cards with honest labels that do not invent backend data:

```tsx
<StudyCard
  ...
  value={isAuthenticated ? 'Mở ôn tập' : 'Khám phá'}
/>
```

```tsx
<StudyCard
  ...
  value={isAuthenticated ? 'Xem quiz' : 'Bắt đầu'}
/>
```

- Keep the streak card numeric because `userProgress?.streak?.currentStreak` is real.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test tests/learning-ui-contract.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run targeted lint and build checks**

Run:

```bash
npx eslint "src/pages/Education.tsx" "tests/learning-ui-contract.test.ts"
npm run build
```

Expected: touched files lint clean, frontend build succeeds.

- [ ] **Step 6: Commit**

```bash
git add tests/learning-ui-contract.test.ts src/pages/Education.tsx
git commit -m "fix: remove fake learning metrics from education home"
```

### Task 4: Use Real Course Progress Data and Clean Up Lesson Copy

**Files:**
- Modify: `education_fe/tests/learning-ui-contract.test.ts`
- Modify: `education_fe/src/pages/CourseDetail.tsx`
- Modify: `education_fe/src/pages/LessonView.tsx`

- [ ] **Step 1: Write the failing test**

Add this test to `education_fe/tests/learning-ui-contract.test.ts`:

```ts
test('course and lesson pages avoid fake xp and placeholder progress copy', () => {
  const courseDetail = readSource('src/pages/CourseDetail.tsx');
  const lessonView = readSource('src/pages/LessonView.tsx');

  assert.doesNotMatch(courseDetail, /1,450/);
  assert.match(courseDetail, /Quay lại khóa học/);
  assert.match(courseDetail, /Tiếp tục học/);
  assert.doesNotMatch(courseDetail, /Back to Courses|Resume Learning|Overall Progress|Course Syllabus/);

  assert.doesNotMatch(lessonView, /const progress = 0/);
  assert.match(lessonView, /Quay lại khóa học/);
  assert.match(lessonView, /Nội dung bài học/);
  assert.match(lessonView, /Từ vựng/);
  assert.match(lessonView, /Bài tập/);
  assert.doesNotMatch(lessonView, /Back to Course|Lesson Content|Vocabulary|Exercises|Mark Complete/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/learning-ui-contract.test.ts
```

Expected: FAIL because `CourseDetail.tsx` still shows fake XP and English copy, and `LessonView.tsx` still contains placeholder progress and English labels.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/pages/CourseDetail.tsx`:

- Replace the fake XP card with a real metric already present in the data model, for example total time spent:

```tsx
<div>
  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Thời gian học</p>
  <p className="text-xl font-black text-white">
    {Math.round((userCourse?.totalTimeSpent || 0) / 60)} <span className="text-xs text-slate-400 font-medium">phút</span>
  </p>
</div>
```

- Replace the key learner-facing labels:

```tsx
Quay lại khóa học
Tiếp tục học
Thông tin khóa học
Tổng tiến độ
Giáo trình khóa học
Hoạt động hiện tại
```

In `education_fe/src/pages/LessonView.tsx`:

- Delete the placeholder line:

```tsx
// delete: const progress = 0;
```

- Replace lesson tab labels and action copy:

```tsx
{ id: 'content', icon: BookOpen, label: 'Nội dung bài học' }
{ id: 'vocabulary', icon: Lightbulb, label: 'Từ vựng' }
{ id: 'exercises', icon: Zap, label: 'Bài tập' }
```

```tsx
Quay lại khóa học
Hoàn thành bài học
Chưa có từ vựng cho bài này.
Làm lại bài tập
Nộp câu trả lời
Nhập câu trả lời...
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node --test tests/learning-ui-contract.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run targeted lint and build checks**

Run:

```bash
npx eslint "src/pages/CourseDetail.tsx" "src/pages/LessonView.tsx" "tests/learning-ui-contract.test.ts"
npm run build
```

Expected: touched files lint clean, frontend build succeeds.

- [ ] **Step 6: Commit**

```bash
git add tests/learning-ui-contract.test.ts src/pages/CourseDetail.tsx src/pages/LessonView.tsx
git commit -m "fix: use honest progress copy on course and lesson pages"
```

### Task 5: Localize the Core Quiz Flow

**Files:**
- Modify: `education_fe/tests/learning-ui-contract.test.ts`
- Modify: `education_fe/src/pages/quiz/QuizSessionPage.tsx`
- Modify: `education_fe/src/pages/quiz/QuizResultPage.tsx`
- Modify: `education_fe/src/pages/quiz/QuizStatsPage.tsx`
- Modify: `education_fe/src/components/quiz/QuizCard.tsx`

- [ ] **Step 1: Write the failing test**

Add this test to `education_fe/tests/learning-ui-contract.test.ts`:

```ts
test('quiz list, session, result, and stats use vietnamese learner copy', () => {
  const session = readSource('src/pages/quiz/QuizSessionPage.tsx');
  const result = readSource('src/pages/quiz/QuizResultPage.tsx');
  const stats = readSource('src/pages/quiz/QuizStatsPage.tsx');
  const card = readSource('src/components/quiz/QuizCard.tsx');

  assert.doesNotMatch(session, /Session Error|Back to Quizzes|Submit Answer|Type your answer/);
  assert.doesNotMatch(result, /Congratulations!|Keep Practicing!|Try Again|All Quizzes|Questions You Missed/);
  assert.doesNotMatch(stats, /Quiz Statistics|Track your performance and progress|Score History|Recent Attempts|Passed|Failed/);
  assert.doesNotMatch(card, /Easy|Medium|Hard|Mixed|Multiple Choice|Fill Blank|Questions|Time|Pass|Public|Private|Start/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/learning-ui-contract.test.ts
```

Expected: FAIL because those English strings still exist across the quiz flow.

- [ ] **Step 3: Write minimal implementation**

Make the following targeted replacements:

In `education_fe/src/pages/quiz/QuizSessionPage.tsx`:

```tsx
Phiên làm bài gặp lỗi
Quay lại danh sách quiz
Câu {displayQuestionIndex + 1} / {totalQuestions}
Đúng
Điểm
Nhập câu trả lời...
Nộp câu trả lời
Câu trả lời sẽ được ghi nhận ngay. Bạn không thể quay lại câu trước.
```

In `education_fe/src/pages/quiz/QuizResultPage.tsx`:

- Replace learner-facing copy with Vietnamese.
- Remove the unused `totalQuestions` binding from the destructuring to keep targeted ESLint green.
- Fix the typo class:

```tsx
bg-amber-500/5
```

In `education_fe/src/pages/quiz/QuizStatsPage.tsx`:

```tsx
Thống kê quiz
Theo dõi kết quả và tiến độ luyện tập
Lịch sử điểm số
Lần làm gần đây
Đạt
Chưa đạt
```

In `education_fe/src/components/quiz/QuizCard.tsx`:

```tsx
Dễ
Trung bình
Khó
Tổng hợp
Trắc nghiệm
Điền khuyết
Số câu
Thời gian
Mốc đạt
Công khai
Riêng tư
Bắt đầu
```

- [ ] **Step 4: Run tests to verify it passes**

Run:

```bash
node --test tests/learning-ui-contract.test.ts tests/quiz-list-view.test.ts tests/quiz-result-view.test.ts tests/quiz-session-view.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run targeted lint and build checks**

Run:

```bash
npx eslint "src/pages/quiz/QuizSessionPage.tsx" "src/pages/quiz/QuizResultPage.tsx" "src/pages/quiz/QuizStatsPage.tsx" "src/components/quiz/QuizCard.tsx" "tests/learning-ui-contract.test.ts"
npm run build
```

Expected: touched files lint clean, frontend build succeeds.

- [ ] **Step 6: Commit**

```bash
git add tests/learning-ui-contract.test.ts src/pages/quiz/QuizSessionPage.tsx src/pages/quiz/QuizResultPage.tsx src/pages/quiz/QuizStatsPage.tsx src/components/quiz/QuizCard.tsx
git commit -m "fix: localize core quiz learner flow"
```

### Task 6: Final Verification and UI Review Pass

**Files:**
- Verify: `education_fe/tests/learning-ui-contract.test.ts`
- Verify: all files touched by Tasks 1-5

- [ ] **Step 1: Run the contract and view-model tests together**

Run:

```bash
node --test tests/learning-ui-contract.test.ts tests/quiz-detail-preview.test.ts tests/quiz-list-view.test.ts tests/quiz-result-view.test.ts tests/quiz-session-view.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run frontend build**

Run:

```bash
npm run build
```

Expected: TypeScript build and Vite build succeed.

- [ ] **Step 3: Run targeted ESLint for all touched files**

Run:

```bash
npx eslint "src/components/layout/Layout.tsx" "src/components/layout/Header.tsx" "src/components/layout/Sidebar.tsx" "src/components/layout/navConfig.tsx" "src/pages/Education.tsx" "src/pages/CourseDetail.tsx" "src/pages/LessonView.tsx" "src/pages/quiz/QuizDetailPage.tsx" "src/pages/quiz/QuizSessionPage.tsx" "src/pages/quiz/QuizResultPage.tsx" "src/pages/quiz/QuizStatsPage.tsx" "src/components/quiz/QuizCard.tsx" "tests/learning-ui-contract.test.ts"
```

Expected: No lint errors in touched files.

- [ ] **Step 4: Manual verification**

Verify in the UI:

```text
1. Quiz detail preview no longer reveals answers before starting.
2. Shared shell feels like an education app, not a stock dashboard.
3. Education home no longer shows fake values like "15 phút", "Due", or "Quiz".
4. Course detail shows real progress/time data instead of fake XP.
5. Lesson view uses Vietnamese labels and no placeholder progress variable remains.
6. Quiz list/session/result/stats/cards all use a consistent language.
```

- [ ] **Step 5: Commit the verification sweep**

```bash
git add tests/learning-ui-contract.test.ts src/components/layout/Layout.tsx src/components/layout/Header.tsx src/components/layout/Sidebar.tsx src/components/layout/navConfig.tsx src/styles/education-shell.css src/pages/Education.tsx src/pages/CourseDetail.tsx src/pages/LessonView.tsx src/pages/quiz/QuizDetailPage.tsx src/pages/quiz/QuizSessionPage.tsx src/pages/quiz/QuizResultPage.tsx src/pages/quiz/QuizStatsPage.tsx src/components/quiz/QuizCard.tsx
git commit -m "chore: verify education ui must-fix cleanup"
```
