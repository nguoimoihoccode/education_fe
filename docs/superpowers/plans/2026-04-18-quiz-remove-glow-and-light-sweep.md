# Quiz Remove Glow and Light Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining glow and light-sweep style decoration from the quiz UI so the quiz experience feels visually calmer and less distracting.

**Architecture:** Keep the change small and local to quiz presentation components. Remove decorative glow layers and shine overlays from `QuizCard` and `QuizStats` without touching quiz logic, routing, or data structures.

**Tech Stack:** React 19, TypeScript, Tailwind utility classes, ESLint

---

### Task 1: Remove Glow Layers from QuizCard

**Files:**
- Modify: `education_fe/src/components/quiz/QuizCard.tsx`

- [ ] **Step 1: Write the failing test**

Use code-level verification for this cosmetic change.

- [ ] **Step 2: Run a baseline search**

Run:

```bash
rg "blur\[60px\]|group-hover:opacity-100|hover:shadow" src/components/quiz/QuizCard.tsx
```

Expected: MATCHES exist before implementation.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/components/quiz/QuizCard.tsx`:

- Remove the absolute decorative glow element entirely:

```tsx
{/* delete the absolute blur circle block */}
```

- Remove the hover neon shadow class from the root card container.

- [ ] **Step 4: Run baseline search again**

Run:

```bash
rg "blur\[60px\]|group-hover:opacity-100|hover:shadow" src/components/quiz/QuizCard.tsx
```

Expected: no remaining matches.

### Task 2: Remove Glow and Light Sweep from QuizStats

**Files:**
- Modify: `education_fe/src/components/quiz/QuizStats.tsx`

- [ ] **Step 1: Write the failing test**

Use code-level verification for this presentation-only task.

- [ ] **Step 2: Run a baseline search**

Run:

```bash
rg "blur-3xl|bg-white/20 blur\[2px\]|group hover:shadow" src/components/quiz/QuizStats.tsx
```

Expected: MATCHES exist before implementation.

- [ ] **Step 3: Write minimal implementation**

In `education_fe/src/components/quiz/QuizStats.tsx`:

- Remove the decorative glow element from `StatCard`:

```tsx
{/* delete the absolute blur glow div */}
```

- Remove the `hover:shadow` styling from the stat card wrapper.
- Remove the inner shine overlay on progress bars:

```tsx
{/* delete <div className="absolute inset-0 bg-white/20 blur-[2px]"></div> */}
```

- [ ] **Step 4: Run baseline search again**

Run:

```bash
rg "blur-3xl|bg-white/20 blur\[2px\]|group hover:shadow" src/components/quiz/QuizStats.tsx
```

Expected: no remaining matches.

### Task 3: Verify Frontend Build and Lint

**Files:**
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
npx eslint "src/components/quiz/QuizCard.tsx" "src/components/quiz/QuizStats.tsx"
```

Expected: No lint errors.

- [ ] **Step 3: Manual verification**

Verify in the UI:

```text
1. Quiz cards no longer show corner glow or neon hover shine.
2. Quiz stats cards no longer show blur glow backgrounds.
3. Quiz progress bars no longer have a bright inner sweep overlay.
```
