# Landing UI Refresh Design

## Goal

Keep landing cinematic, but make it clearer, faster-feeling, more accessible, and closer to EduPro learning product.

## Changes

- Strengthen hero overlay for readable white text.
- Replace fixed `1000px` hero height with responsive min-height.
- Make primary hero CTA solid and high contrast.
- Add visible focus states and cursor pointers to landing links/buttons.
- Fix navbar links: courses route goes to `/education?view=courses`, community route goes to `/community`.
- Add a light learning preview section after hero to bridge landing and app dashboard style.
- Replace footer `href="#"` links with `/coming-soon`.

## Scope

- Frontend only.
- Modify landing components and CSS only.
- No backend changes.

## Verification

- Run landing-related tests if present.
- Run frontend build.
