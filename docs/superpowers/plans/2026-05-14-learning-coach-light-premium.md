# Learning Coach Light Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/learning-coach` as a light premium learning dashboard with one clear action and a timeline path.

**Architecture:** Replace only the page markup in `LearningCoach.tsx`. Keep existing `getLearningCoachSummary`, query key, routes, and types. Add page-local helper components in same file.

**Tech Stack:** React 19, TypeScript, TanStack Query, React Router, Tailwind CSS, Lucide icons.

---

## Files

- Modify: `src/pages/LearningCoach.tsx`

## Task 1: Redesign Page

- [ ] Run current tests: `npm run test:run -- src/config/routes.test.ts src/components/layout/globalSearch.test.ts`
- [ ] Replace dense card layout with light premium hero, compact metrics, path timeline, insight panel, risk panel.
- [ ] Keep loading and error states styled.
- [ ] Run `npm run test:run -- src/config/routes.test.ts src/components/layout/globalSearch.test.ts`.
- [ ] Run `npm run build`.

## Self-Review

- Spec covered.
- No backend changes.
- No placeholders.
