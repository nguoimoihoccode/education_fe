import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCreateDeckDto,
  buildUpdateDeckDto,
  createDeckFormStateFromDeck,
  getDeckDeleteErrorMessage,
  getDeckUpdateErrorMessage,
} from '../src/pages/flashcardDeckView.ts';

test('buildUpdateDeckDto keeps only editable deck fields', () => {
  const dto = buildUpdateDeckDto({
    name: 'Edited Deck',
    description: 'Updated description',
    icon: '🧠',
    color: '#10B981',
    isPublic: true,
  });

  assert.deepEqual(dto, {
    name: 'Edited Deck',
    description: 'Updated description',
    icon: '🧠',
    color: '#10B981',
    isPublic: true,
  });
});

test('createDeckFormStateFromDeck hydrates the edit modal from deck data', () => {
  const form = createDeckFormStateFromDeck({
    id: 'deck-1',
    name: 'Travel Japanese',
    description: 'Trip vocabulary',
    icon: '✈️',
    color: '#F59E0B',
    cardCount: 32,
    type: 'USER',
    isPublic: true,
    createdAt: '2026-04-18T00:00:00.000Z',
    updatedAt: '2026-04-18T00:00:00.000Z',
    userId: 1,
  });

  assert.equal(form.name, 'Travel Japanese');
  assert.equal(form.icon, '✈️');
  assert.equal(form.color, '#F59E0B');
  assert.equal(form.isPublic, true);
});

test('buildCreateDeckDto preserves optional deck metadata', () => {
  const dto = buildCreateDeckDto({
    name: 'Kanji Basics',
    description: 'Common kanji',
    icon: '🈶',
    color: '#8B5CF6',
    isPublic: false,
  });

  assert.deepEqual(dto, {
    name: 'Kanji Basics',
    description: 'Common kanji',
    icon: '🈶',
    color: '#8B5CF6',
    isPublic: false,
  });
});

test('getDeckDeleteErrorMessage prefers backend string message', () => {
  const result = getDeckDeleteErrorMessage({
    response: { data: { message: 'Cannot delete this deck' } },
  });

  assert.equal(result, 'Cannot delete this deck');
});

test('getDeckUpdateErrorMessage prefers backend string message', () => {
  const result = getDeckUpdateErrorMessage({
    response: { data: { message: 'Cannot update this deck' } },
  });

  assert.equal(result, 'Cannot update this deck');
});
