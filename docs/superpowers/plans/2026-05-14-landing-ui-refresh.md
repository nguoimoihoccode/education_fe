# Landing UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh landing UI so it remains cinematic but reads better, converts better, and matches EduPro learning UI.

**Architecture:** Keep the existing landing component structure. Modify nav, hero, add one learning preview section, improve footer links and shared landing CSS. No API or route changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, React Router, Lucide icons.

---

## Files

- Modify: `src/pages/landing/components/Navbar.tsx`
- Modify: `src/pages/landing/components/Hero.tsx`
- Create: `src/pages/landing/components/LearningPreview.tsx`
- Modify: `src/pages/landing/LandingPageNew.tsx`
- Modify: `src/pages/landing/components/CtaFooter.tsx`
- Modify: `src/pages/landing/Landing.css`

## Task 1: Refresh Landing UI

- [ ] Run existing landing test: `npm run test:run -- src/pages/landing/components/HlsVideo.memory.test.tsx`
- [ ] Update navbar links and focus/touch states.
- [ ] Update hero overlay, height, and CTA contrast.
- [ ] Add `LearningPreview` bridge section after hero.
- [ ] Replace footer dummy links with `/coming-soon` links.
- [ ] Add landing focus styles in `Landing.css`.
- [ ] Run `npm run test:run -- src/pages/landing/components/HlsVideo.memory.test.tsx`.
- [ ] Run `npm run build`.

## Self-Review

- Spec coverage complete.
- No placeholders.
- No backend changes.
