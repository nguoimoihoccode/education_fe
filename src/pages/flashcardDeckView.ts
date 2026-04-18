import type {
  CreateFlashcardDeckDto,
  FlashcardDeck,
  UpdateFlashcardDeckDto,
} from '@/types/flashcard.types';

export interface FlashcardDeckFormState {
  name: string;
  description: string;
  icon: string;
  color: string;
  isPublic: boolean;
}

export function createDefaultDeckFormState(): FlashcardDeckFormState {
  return {
    name: '',
    description: '',
    icon: '📚',
    color: '#4F46E5',
    isPublic: false,
  };
}

export function createDeckFormStateFromDeck(deck: FlashcardDeck): FlashcardDeckFormState {
  return {
    name: deck.name,
    description: deck.description ?? '',
    icon: deck.icon ?? '📚',
    color: deck.color ?? '#4F46E5',
    isPublic: deck.isPublic,
  };
}

export function buildCreateDeckDto(form: FlashcardDeckFormState): CreateFlashcardDeckDto {
  return {
    name: form.name,
    description: form.description || undefined,
    icon: form.icon || undefined,
    color: form.color || undefined,
    isPublic: form.isPublic,
  };
}

export function buildUpdateDeckDto(form: FlashcardDeckFormState): UpdateFlashcardDeckDto {
  return {
    name: form.name,
    description: form.description || undefined,
    icon: form.icon || undefined,
    color: form.color || undefined,
    isPublic: form.isPublic,
  };
}

export function getDeckCreateErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  return 'Failed to create deck.';
}

export function getDeckUpdateErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  return 'Failed to update deck.';
}

export function getDeckDeleteErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  return 'Failed to delete deck.';
}
