# Learning Coach Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/learning-coach` into a light EduPro Coach Command Center dashboard.

**Architecture:** Keep existing API and route. Replace `LearningCoach.tsx` markup with focused UI sections: hero command center, metric cards, next-action/tasks, coach insight/risks. Use Tailwind classes and existing app colors only.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, Tailwind CSS, Lucide icons.

---

## File Structure

- Modify: `src/pages/LearningCoach.tsx` - only page needing visual redesign.
- Existing verification tests: `src/config/routes.test.ts`, `src/components/layout/globalSearch.test.ts`.

## Task 1: Redesign LearningCoach Page

**Files:**
- Modify: `src/pages/LearningCoach.tsx`

- [ ] **Step 1: Confirm current tests pass before edit**

Run: `npm run test:run -- src/config/routes.test.ts src/components/layout/globalSearch.test.ts`
Expected: `2 passed`, `8 passed`.

- [ ] **Step 2: Replace page with Coach Command Center layout**

Use this structure:

```tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Brain, CheckCircle2, Flame, Sparkles, Target, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { getLearningCoachSummary } from '@/api/education.api';
import { QUERY_KEYS } from '@/config/query';
import type { LearningCoachSummary, TodayPlanTask } from '@/types/education.types';

export default function LearningCoach() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.LEARNING_COACH,
    queryFn: getLearningCoachSummary,
  });

  if (isLoading) return <CoachState label="Đang chuẩn bị dashboard coach..." />;
  if (error || !data) return <CoachState label="Không tải được coach học tập." tone="error" />;

  return <CoachDashboard data={data} />;
}
```

- [ ] **Step 3: Add page sections in same file**

Add `CoachDashboard`, `MetricCard`, `TaskCard`, `CoachState` functions below default component. Keep functions in one file because they are page-only.

- [ ] **Step 4: Run frontend tests**

Run: `npm run test:run -- src/config/routes.test.ts src/components/layout/globalSearch.test.ts`
Expected: `2 passed`, `8 passed`.

- [ ] **Step 5: Run frontend build**

Run: `npm run build`
Expected: `✓ built` and exit 0.

## Self-Review

- Spec coverage: hero, metrics, next action, tasks, risks, loading/error all covered by Task 1.
- Placeholder scan: no TODO/TBD placeholders.
- Type consistency: uses existing `LearningCoachSummary` and `TodayPlanTask` from `education.types.ts`.
