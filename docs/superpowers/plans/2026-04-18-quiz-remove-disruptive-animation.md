# Quiz Remove Disruptive Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove disruptive animation and motion from the quiz experience while keeping quiz logic and layout intact.

**Architecture:** Keep the change local to quiz pages and quiz components. Replace animated spinners with static loading placeholders, remove motion-heavy transitions and hover transforms, and flatten animated chart/progress effects to static rendering.

**Tech Stack:** React 19, TypeScript, Tailwind utility classes, Node test runner, ESLint

---

### Task 1: Remove Motion from QuizSessionPage

**Files:**
- Modify: `education_fe/src/pages/quiz/QuizSessionPage.tsx`

- [ ] **Step 1: Write the failing test**

Because this task is presentation-only and this repo does not have a component test harness for quiz pages, use code-level verification by removing the known motion classes from the file and verifying with lint/build after implementation.

- [ ] **Step 2: Run a baseline search**

Run:

```bash
rg "animate-spin|transition-all|duration-500|hover:bg|focus:ring-2|hover:border-accent-500/30" src/pages/quiz/QuizSessionPage.tsx
```

Expected: MATCHES exist before implementation.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/pages/quiz/QuizSessionPage.tsx`:

- Replace animated loader:

```tsx
<div className="w-12 h-12 border-2 border-accent-500/40 rounded-full"></div>
```

- Remove progress bar animation classes:

```tsx
className="h-full bg-gradient-to-r from-accent-600 to-fuchsia-600"
```

- Remove `transition-all` from answer options, inputs, and submit button.
- Keep hover color feedback only if it does not move or animate the UI.
- Remove `focus:ring-2` if it creates distracting animated emphasis; keep a clear border/focus outline.

- [ ] **Step 4: Run baseline search again**

Run:

```bash
rg "animate-spin|transition-all|duration-500" src/pages/quiz/QuizSessionPage.tsx
```

Expected: no remaining matches for the removed motion classes in this file.

### Task 2: Remove Motion from QuizStatsPage

**Files:**
- Modify: `education_fe/src/pages/quiz/QuizStatsPage.tsx`

- [ ] **Step 1: Write the failing test**

Use code-level verification for the chart animation removal.

- [ ] **Step 2: Run a baseline search**

Run:

```bash
rg "animate-spin|@keyframes|animation:|transition-all|hover:-translate-y-1|transition-transform" src/pages/quiz/QuizStatsPage.tsx
```

Expected: MATCHES exist before implementation.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/pages/quiz/QuizStatsPage.tsx`:

- Replace loading spinners with static placeholders.
- Remove bar growth animation:

```tsx
style={{ height: `${score}%` } as React.CSSProperties}
```

- Remove `animation`, `--target-height`, and the embedded `@keyframes growBar` block.
- Remove the hover translate on chart labels.
- Remove `transition-colors` on history rows if the motion feels distracting; keep simple background change only if needed.

- [ ] **Step 4: Run baseline search again**

Run:

```bash
rg "animate-spin|@keyframes|animation:|transition-transform" src/pages/quiz/QuizStatsPage.tsx
```

Expected: no remaining matches for the removed motion patterns in this file.

### Task 3: Remove Motion from Quiz Cards and Stats Components

**Files:**
- Modify: `education_fe/src/pages/quiz/QuizListPage.tsx`
- Modify: `education_fe/src/components/quiz/QuizCard.tsx`
- Modify: `education_fe/src/components/quiz/QuizStats.tsx`

- [ ] **Step 1: Write the failing test**

Use code-level verification for hover/scale motion in these UI files.

- [ ] **Step 2: Run a baseline search**

Run:

```bash
rg "hover:scale|hover:-translate-y-1|transition-all|duration-300|duration-500|duration-1000|transition-opacity" src/pages/quiz/QuizListPage.tsx src/components/quiz/QuizCard.tsx src/components/quiz/QuizStats.tsx
```

Expected: MATCHES exist before implementation.

- [ ] **Step 3: Write minimal implementation**

Update the three files as follows:

- `QuizListPage.tsx`
  - remove `hover:scale-105`, `hover:-translate-y-1`, `transition-transform`, and large `transition-all` usages on quiz action cards/buttons.
- `QuizCard.tsx`
  - remove hover translate, glow fade-in animation, and button scale effects.
  - keep clear hover state with border/background only.
- `QuizStats.tsx`
  - remove long `transition-all duration-300` on stat cards.
  - remove `transition-colors duration-500` and `duration-1000 ease-out` on decorative/stat bars.
  - keep static progress display.

- [ ] **Step 4: Run baseline search again**

Run:

```bash
rg "hover:scale|hover:-translate-y-1|duration-1000|transition-opacity" src/pages/quiz/QuizListPage.tsx src/components/quiz/QuizCard.tsx src/components/quiz/QuizStats.tsx
```

Expected: no remaining matches for the removed motion patterns in those files.

### Task 4: Verify Quiz UX Still Builds Cleanly

**Files:**
- Verify: `education_fe/src/pages/quiz/QuizSessionPage.tsx`
- Verify: `education_fe/src/pages/quiz/QuizStatsPage.tsx`
- Verify: `education_fe/src/pages/quiz/QuizListPage.tsx`
- Verify: `education_fe/src/components/quiz/QuizCard.tsx`
- Verify: `education_fe/src/components/quiz/QuizStats.tsx`

- [ ] **Step 1: Run frontend build**

Run:

```bash
npm run build
```

Expected: TypeScript build and Vite build succeed.

- [ ] **Step 2: Run lint on touched files**

Run:

```bash
npx eslint "src/pages/quiz/QuizSessionPage.tsx" "src/pages/quiz/QuizStatsPage.tsx" "src/pages/quiz/QuizListPage.tsx" "src/components/quiz/QuizCard.tsx" "src/components/quiz/QuizStats.tsx"
```

Expected: No lint errors in the touched files.

- [ ] **Step 3: Manual verification**

Verify in the UI:

```text
1. Quiz list no longer jumps or scales on hover.
2. Quiz session page feels static and stable while answering.
3. Stats page bars render directly without animated growth.
4. Quiz flow remains intact.
```
