# Quiz Offline HSK2 Design

## Goal

Add an HSK2 practice set to the frontend-only quiz mode, matching the same user flow already used for HSK1.

## Scope

- Add one quiz entry:
  - `HSK2 Practice`
- Support the same configuration flow as HSK1:
  - difficulty: `EASY`, `MEDIUM`, `HARD`
  - question count: `10`, `20`, `30`
- Preview should follow the selected difficulty and question count.
- Session should randomize from the selected HSK2 pool and review results only at the end.

## Non-Goals

- No backend changes
- No new routing model
- No change to the existing HSK1 mechanics

## Notes

- Reuse the HSK1 architecture rather than creating a separate parallel system.
- Keep the content balanced between vocabulary, contextual Q&A, and simple sentence understanding.
