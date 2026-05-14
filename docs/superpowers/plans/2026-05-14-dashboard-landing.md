# Dashboard Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dedicated light premium dashboard preview at `/dashboard-landing`.

**Architecture:** Add one standalone page component and update the existing route lazy import. No API calls are needed; this is a static dashboard preview with links into existing app routes.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS, Lucide icons.

---

## Files

- Create: `src/pages/DashboardLanding.tsx`
- Modify: `src/App.tsx`

## Task 1: Add Dashboard Landing Page

- [ ] Run route tests: `npm run test:run -- src/config/routes.test.ts`
- [ ] Create `DashboardLanding.tsx` with hero, quick cards, progress preview, timeline, right insight panel.
- [ ] Update `App.tsx` so `/dashboard-landing` renders `DashboardLanding`, not `LandingPageNew`.
- [ ] Run `npm run test:run -- src/config/routes.test.ts`.
- [ ] Run `npm run build`.

## Self-Review

- `/` unchanged.
- `/dashboard-landing` uses new page.
- No backend changes.
