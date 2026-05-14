import type { SuggestedFlashcard } from '@/types/document.types';

export function buildSelectedFlashcards(
  cards: SuggestedFlashcard[],
  selectedIds: string[],
): SuggestedFlashcard[] {
  if (selectedIds.length === 0) {
    return cards;
  }

  const selected = new Set(selectedIds);
  return cards.filter((card) => selected.has(card.id));
}
