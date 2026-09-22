import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import AiTutor from './AiTutor';

const LESSON_ID = 'f2f4a1c8-0f5e-4a1f-9a11-2c3d4e5f6a7b';

const { listConversations, createConversation, getConversation } = vi.hoisted(() => ({
  listConversations: vi.fn(),
  createConversation: vi.fn(),
  getConversation: vi.fn(),
}));

vi.mock('@/api/ai.api', () => ({
  listConversations,
  createConversation,
  getConversation,
  deleteConversation: vi.fn(),
  sendMessage: vi.fn(),
}));

// BYOK off, so the component talks to the backend instead of staying local.
vi.mock('@/store/aiProvider.store', () => ({
  useAiProviderStore: () => ({ isConfigured: false, settings: {} }),
}));

const summary = (id: string, title = 'Old chat') => ({
  id,
  title,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const renderTutor = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/ai-tutor" element={<AiTutor />} />
      </Routes>
    </MemoryRouter>,
  );

describe('AiTutor lesson scoping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listConversations.mockResolvedValue([]);
    createConversation.mockImplementation(async (body?: { lessonId?: string }) =>
      summary(`${body?.lessonId ? 'grounded' : 'plain'}-1`),
    );
    getConversation.mockResolvedValue({
      id: 'grounded-1',
      title: 'Bài học',
      messages: [],
      updatedAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('opens a conversation scoped to the lesson in ?lessonId', async () => {
    renderTutor(`/ai-tutor?lessonId=${LESSON_ID}`);

    await waitFor(() =>
      expect(createConversation).toHaveBeenCalledWith({ lessonId: LESSON_ID }),
    );
  });

  // Reusing an existing chat would answer without the lesson context the link
  // just asked for, so a lesson-scoped visit must not adopt one.
  it('does not reuse an existing conversation when a lesson is requested', async () => {
    listConversations.mockResolvedValue([summary('existing-1')]);

    renderTutor(`/ai-tutor?lessonId=${LESSON_ID}`);

    await waitFor(() =>
      expect(createConversation).toHaveBeenCalledWith({ lessonId: LESSON_ID }),
    );
    expect(getConversation).not.toHaveBeenCalledWith('existing-1');
  });

  it('reuses the newest conversation when no lesson is requested', async () => {
    listConversations.mockResolvedValue([summary('existing-1')]);

    renderTutor('/ai-tutor');

    await waitFor(() => expect(getConversation).toHaveBeenCalledWith('existing-1'));
    expect(createConversation).not.toHaveBeenCalled();
  });
});