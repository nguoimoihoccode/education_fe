# Sidebar Group Cards Design

## Goal

Make sidebar sections visually grouped so navigation is easier to scan.

## Design

- Wrap each section in a light group card.
- Show section title as a small chip when expanded.
- Keep collapsed mode compact but still separated with card spacing.
- Preserve existing nav config, active matching, mobile behavior.

## Scope

- Modify `src/components/layout/Sidebar.tsx`.
- Modify `src/styles/education-shell.css`.

## Verification

- Run route tests.
- Run frontend build.
