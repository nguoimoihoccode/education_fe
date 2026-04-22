# Quiz Offline HSK1 Balanced Question Mix Design

## Goal

Adjust the offline HSK1 question bank so it feels more like a realistic HSK1 practice set by mixing:

- direct vocabulary meaning questions
- short contextual question-answer prompts
- simple sentence/response understanding

## Current State

- The HSK1 offline flow already supports:
  - one HSK1 entry point
  - difficulty selection
  - question count selection
  - random session subsets
- The question bank currently leans too far toward contextual prompts after the recent rewrite.
- The user wants a more balanced mix between word meaning and question-answer style prompts.

## Chosen Approach

Keep the current offline quiz architecture and rebalance the HSK1 question generators so each difficulty pool contains a deliberate mix of question styles.

## Scope

### Question Style Mix

For each HSK1 difficulty pool, keep a balanced blend of:

- direct vocabulary meaning recognition
- contextual question-answer prompts
- short sentence understanding / best-response selection

The bank should not collapse into only one style.

### Difficulty Shape

- `EASY`
  - more direct vocabulary and simple QA prompts
- `MEDIUM`
  - balanced mix of vocabulary and context
- `HARD`
  - still HSK1 vocabulary, but with more plausible distractors and slightly more contextual interpretation

## Non-Goals

- No backend changes
- No changes to the existing HSK1 entry/config/session architecture
- No audio/listening simulation in this task

## Testing

- Update tests so they verify the HSK1 bank contains both vocabulary-style and contextual-style prompts.
- Keep the existing session/history/build checks passing.
