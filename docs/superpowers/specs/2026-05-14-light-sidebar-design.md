# Light Sidebar Design

## Goal

Make the left navigation match the light premium learning UI.

## Changes

- Convert sidebar/header shell tokens from dark glass to light glass.
- Sidebar background becomes warm white with slate borders.
- Active links become emerald pills.
- Hover/focus states become light emerald, no dark neon feel.
- Logo and user footer become light cards.
- Keep collapse and mobile drawer behavior.

## Scope

- Modify `src/styles/education-shell.css`.
- Modify dark inline styles in `src/components/layout/Sidebar.tsx` if needed.

## Verification

- Run route tests.
- Run frontend build.
