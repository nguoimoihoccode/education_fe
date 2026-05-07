# Design System MVP Refactor

## Goal

Bring the frontend closer to a consistent design system without a broad visual rewrite. This MVP focuses on shared tokens, core primitives, shell accessibility, and obvious form/modal issues in the main learning flows.

## Scope

The MVP covers these areas:

- `src/index.css` as the canonical token layer.
- Core primitives in `src/components/ui/Button.tsx`, `Card.tsx`, and `Input.tsx`.
- App shell accessibility in `src/components/layout/Header.tsx` and `Sidebar.tsx`.
- Quick accessibility and consistency fixes in `Education.tsx`, `quiz/QuizListPage.tsx`, and `FlashcardDecks.tsx`.

The MVP does not attempt to restyle every page, remove all legacy CSS, or provide full light-mode parity. Existing page-specific CSS remains in place unless it directly conflicts with the fixes above.

## Design Decisions

### Tokens

`src/index.css` remains the source of truth. Add a semantic token layer for app background, surfaces, text, borders, primary/accent colors, focus rings, and motion timing. Map common legacy aliases such as `stock-*` and `edu-*` to those semantic tokens where needed so existing shell styles continue to work.

### Primitives

Button, Card, and Input should represent the preferred interaction defaults:

- Motion should use 150-300ms timing.
- Focus states must be visible.
- Touch targets should remain at least 44px where practical.
- Loading buttons should be disabled and expose understandable text.
- Inputs with errors should set `aria-invalid` and link helper or error text via `aria-describedby`.

### Shell Accessibility

Icon-only controls in the header and sidebars get clear `aria-label` values. Drawer and collapse controls should be understandable to screen readers. The visible UI should not change materially.

### Forms And Modals

The quiz and flashcard create/edit modals get accessible dialog semantics with `role="dialog"`, `aria-modal="true"`, and title IDs. High-use search inputs receive `aria-label`. Form labels in the touched modals should be linked to inputs with `htmlFor` and `id` where practical.

### Visual Consistency

Remove obvious emoji UI defaults from touched form controls. Keep user-generated emoji-style deck icons possible, but avoid using emoji as system UI labels. Prefer text and Lucide icons.

## Verification

Run `npm run build` in `education_fe`. If the build fails, fix failures caused by this change. If unrelated pre-existing failures appear, document them clearly.

## Out Of Scope

- Full migration of every raw Tailwind button/card/input to primitives.
- Full dark/light theme parity.
- Removing `Education.css`, `stock-redesign.css`, or `education-shell.css`.
- Visual redesign of landing, profile, premium, or HRM pages.
- Backend changes.
