# Quiz Offline HSK1 Expand to 200 Design

## Goal

Expand the offline HSK1 question bank to roughly 200 questions so the user can practice with a much larger and more diverse pool while keeping the existing HSK1 quiz flow intact.

## Current State

- The offline HSK1 flow already supports:
  - one HSK1 entry point
  - difficulty selection
  - question-count selection
  - random per-session subsets
- The current pool is usable but still limited in variety.

## Chosen Approach

Keep the current HSK1 architecture and significantly enlarge the content pool.

Use a controlled generator approach so the pool becomes larger and more diverse without devolving into unmaintainable hand-written duplication.

## Scope

### Pool Size

- Increase the total HSK1 pool to around 200 questions.

### Question Variety

- Keep the balanced mix already established:
  - direct vocabulary meaning questions
  - short contextual question-answer prompts
  - simple sentence/response understanding

### Difficulty Pools

- Preserve `EASY`, `MEDIUM`, and `HARD` pools.
- Expand each pool so random 10/20/30-question attempts feel less repetitive.

## Non-Goals

- No backend changes
- No routing changes
- No changes to the existing HSK1 entry/config/session flow

## Testing

- Update tests to verify the HSK1 pool is substantially larger.
- Keep existing session/history/build checks passing.
