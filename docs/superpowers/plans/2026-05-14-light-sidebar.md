# Light Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the left navigation shell to a light premium style.

**Architecture:** Update shared shell CSS tokens and sidebar inline dark styles. Keep component behavior and route config unchanged.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, CSS custom properties.

---

## Files

- Modify: `src/styles/education-shell.css`
- Modify: `src/components/layout/Sidebar.tsx`

## Task 1: Light Sidebar

- [ ] Run `npm run test:run -- src/config/routes.test.ts`.
- [ ] Update shell CSS colors and link states.
- [ ] Remove dark inline sidebar footer gradients and dark tooltip background.
- [ ] Run `npm run test:run -- src/config/routes.test.ts`.
- [ ] Run `npm run build`.

## Self-Review

- Sidebar behavior unchanged.
- Mobile drawer still works.
- No route changes.
