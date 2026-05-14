import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSelectedFlashcards } from '../src/components/document/importPreviewSelection.ts';

const cards = [
  {
    id: 'card-1',
    front: '你好',
    back: 'hello',
    difficulty: 1,
    sourceSection: 'HSK1',
    confidence: 0.9,
  },
  {
    id: 'card-2',
    front: '谢谢',
    back: 'thanks',
    difficulty: 1,
    sourceSection: 'HSK1',
    confidence: 0.9,
  },
];

test('uses selected cards when the learner selects specific preview cards', () => {
  assert.deepEqual(buildSelectedFlashcards(cards, ['card-2']), [cards[1]]);
});

test('uses all cards when no explicit selection is made', () => {
  assert.deepEqual(buildSelectedFlashcards(cards, []), cards);
});
