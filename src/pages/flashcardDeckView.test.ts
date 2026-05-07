import { describe, expect, it } from 'vitest';
import {
  buildCreateDeckDto,
  buildUpdateDeckDto,
  createDeckFormStateFromDeck,
  getDeckDeleteErrorMessage,
  getDeckUpdateErrorMessage,
} from './flashcardDeckView';

describe('flashcardDeckView', () => {
  it('keeps only editable deck fields in update DTO', () => {
    expect(buildUpdateDeckDto({
      name: 'Edited Deck',
      description: 'Updated description',
      icon: 'Brain',
      color: '#10B981',
      isPublic: true,
    })).toEqual({
      name: 'Edited Deck',
      description: 'Updated description',
      icon: 'Brain',
      color: '#10B981',
      isPublic: true,
    });
  });

  it('hydrates the edit modal from deck data', () => {
    const form = createDeckFormStateFromDeck({
      id: 'deck-1',
      name: 'Travel Japanese',
      description: 'Trip vocabulary',
      icon: 'Plane',
      color: '#F59E0B',
      cardCount: 32,
      type: 'USER',
      isPublic: true,
      createdAt: '2026-04-18T00:00:00.000Z',
      updatedAt: '2026-04-18T00:00:00.000Z',
      userId: 1,
    });

    expect(form.name).toBe('Travel Japanese');
    expect(form.icon).toBe('Plane');
    expect(form.color).toBe('#F59E0B');
    expect(form.isPublic).toBe(true);
  });

  it('preserves optional deck metadata in create DTO', () => {
    expect(buildCreateDeckDto({
      name: 'Kanji Basics',
      description: 'Common kanji',
      icon: 'Kanji',
      color: '#8B5CF6',
      isPublic: false,
    })).toEqual({
      name: 'Kanji Basics',
      description: 'Common kanji',
      icon: 'Kanji',
      color: '#8B5CF6',
      isPublic: false,
    });
  });

  it('prefers backend string messages for deck errors', () => {
    expect(getDeckDeleteErrorMessage({ response: { data: { message: 'Cannot delete this deck' } } })).toBe('Cannot delete this deck');
    expect(getDeckUpdateErrorMessage({ response: { data: { message: 'Cannot update this deck' } } })).toBe('Cannot update this deck');
  });
});
