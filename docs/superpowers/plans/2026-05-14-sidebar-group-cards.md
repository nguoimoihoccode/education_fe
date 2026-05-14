# Sidebar Group Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clear visual grouping to sidebar navigation sections.

**Architecture:** Update `NavSection` wrapper markup and add CSS classes for group cards. Keep nav items and behavior unchanged.

**Tech Stack:** React 19, TypeScript, CSS custom classes, Tailwind utilities.

---

## Files

- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/styles/education-shell.css`

## Task 1: Sidebar Group Cards

- [ ] Run `npm run test:run -- src/config/routes.test.ts`.
- [ ] Wrap each `NavSection` in a `.stock-sidebar-group` element.
- [ ] Add `.stock-sidebar-section-title` styling.
- [ ] Run `npm run test:run -- src/config/routes.test.ts`.
- [ ] Run `npm run build`.

## Self-Review

- Grouping visible expanded and collapsed.
- No route changes.
- No nav config changes.
