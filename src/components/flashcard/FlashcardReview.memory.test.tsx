import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FlashcardReview } from './FlashcardReview';
import type { Flashcard, ReviewSession } from '@/types/flashcard.types';

const flashcards = [
  {
    id: 'card-1',
    front: 'hello',
    back: 'xin chao',
  },
] as Flashcard[];

const session = {
  id: 'session-1',
} as ReviewSession;

describe('FlashcardReview cleanup', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('clears the delayed review timeout when unmounted', () => {
    vi.useFakeTimers();
    const onReview = vi.fn();

    const { unmount } = render(
      <FlashcardReview
        flashcards={flashcards}
        session={session}
        onReview={onReview}
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /flashcard - press space or enter to flip/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /hard/i }));
    unmount();
    vi.advanceTimersByTime(300);

    expect(onReview).not.toHaveBeenCalled();
  });
});
