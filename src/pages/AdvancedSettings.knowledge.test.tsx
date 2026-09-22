import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import type { AiProviderSettingsView } from '@/types/ai.types';

const {
  mockReindexKnowledge,
  mockUpdateAiSettings,
  mockGetKnowledgeIndexStatus,
  mockToast,
  settingsView,
} = vi.hoisted(() => {
  const view: AiProviderSettingsView = {
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 2048,
    temperature: 0.7,
    systemRules: 'rules',
    apiKeyConfigured: true,
    apiKeyLast4: 'abcd',
    source: {
      baseUrl: 'env',
      apiKey: 'env',
      model: 'default',
      maxTokens: 'default',
      temperature: 'default',
      systemRules: 'default',
    },
    updatedAt: null,
    embedding: {
      baseUrl: 'https://api.openai.com/v1',
      model: 'text-embedding-3-small',
      dimensions: 1536,
      apiKeyConfigured: true,
      apiKeyLast4: 'wxyz',
      source: {
        baseUrl: 'db',
        apiKey: 'db',
        model: 'db',
        dimensions: 'db',
      },
      updatedAt: '2026-09-17T00:00:00.000Z',
    },
  };
  return {
    mockReindexKnowledge: vi.fn(),
    mockUpdateAiSettings: vi.fn(),
    // A default on creation: the settings effect fires on the very first render,
    // before any afterEach has had a chance to (re)install one.
    mockGetKnowledgeIndexStatus: vi.fn().mockResolvedValue({
      embeddingConfigured: true,
      lessons: 4,
      chunks: 20,
      embedded: 19,
      pending: 1,
      bySourceType: [],
      lastEmbeddedAt: '2026-09-22T04:00:00.000Z',
    }),
    mockToast: { success: vi.fn(), error: vi.fn() },
    settingsView: view,
  };
});

vi.mock('react-hot-toast', () => ({
  default: mockToast,
}));

vi.mock('@/api/ai.api', () => ({
  getAiSettings: vi.fn().mockResolvedValue(settingsView),
  updateAiSettings: mockUpdateAiSettings,
  testAiSettings: vi.fn(),
  reindexKnowledge: mockReindexKnowledge,
  getKnowledgeIndexStatus: mockGetKnowledgeIndexStatus,
}));

vi.mock('@/store/settings.store', () => ({
  useSettingsStore: () => ({
    theme: 'dark',
    accentColor: 'violet',
    fontSize: 'medium',
    reducedMotion: false,
    compactMode: false,
    pushNotif: true,
    emailDigest: true,
    streakReminder: true,
    quizResults: true,
    communityMentions: true,
    soundEffects: true,
    quietHoursEnabled: false,
    dailyGoal: '30',
    autoPlay: true,
    showHints: true,
    aiDifficulty: 'adaptive',
    flashcardOrder: 'spaced',
    showProgressBar: true,
    autoSubmitQuiz: false,
    profileVisibility: 'public',
    showOnLeaderboard: true,
    activityStatus: true,
    shareProgress: true,
    twoFactorAuth: false,
    loginAlerts: true,
    highContrast: false,
    screenReader: false,
    keyboardNav: true,
    largeText: false,
    offlineMode: false,
    autoSync: true,
    devMode: false,
    betaFeatures: false,
    analyticsOpt: true,
    updateSetting: vi.fn(),
    resetAppearance: vi.fn(),
  }),
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({ user: { id: '1', roles: ['admin'] } }),
}));

vi.mock('@/store/aiProvider.store', () => ({
  useAiProviderStore: () => ({
    settings: { apiKey: '', baseUrl: '', model: '', maxTokens: 700, temperature: 0.4 },
    isConfigured: false,
    saveSettings: vi.fn(),
    clearSettings: vi.fn(),
  }),
}));

import AdvancedSettings from './AdvancedSettings';

const renderAiSection = () =>
  render(
    <MemoryRouter initialEntries={['/settings?section=ai-provider']}>
      <AdvancedSettings />
    </MemoryRouter>,
  );

describe('AdvancedSettings knowledge index controls', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockUpdateAiSettings.mockReset();
    mockReindexKnowledge.mockReset();
    mockGetKnowledgeIndexStatus.mockReset();
    mockGetKnowledgeIndexStatus.mockResolvedValue({
      embeddingConfigured: true,
      lessons: 4,
      chunks: 20,
      embedded: 19,
      pending: 1,
      bySourceType: [],
      lastEmbeddedAt: '2026-09-22T04:00:00.000Z',
    });
  });

  it('sends the embedding provider nested under `embedding`, not as top-level fields', async () => {
    mockUpdateAiSettings.mockResolvedValue(settingsView);
    renderAiSection();

    const saveButton = await screen.findByRole('button', { name: /save embedding provider/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(mockUpdateAiSettings).toHaveBeenCalledTimes(1));
    // The admin DTO whitelists its keys, so a flat body would be accepted and
    // silently ignored — the admin would believe the provider had been saved.
    expect(mockUpdateAiSettings).toHaveBeenCalledWith({
      embedding: {
        baseUrl: 'https://api.openai.com/v1',
        model: 'text-embedding-3-small',
        dimensions: 1536,
      },
    });
  });

  it('reindexes incrementally, without force', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockReindexKnowledge.mockResolvedValue({
      lessons: 4,
      chunks: 20,
      embedded: 6,
      removed: 1,
    });
    renderAiSection();

    fireEvent.click(await screen.findByRole('button', { name: /đánh lại chỉ mục/i }));

    await waitFor(() => expect(mockReindexKnowledge).toHaveBeenCalledTimes(1));
    expect(mockReindexKnowledge).toHaveBeenCalledWith(undefined);
  });

  it('re-embeds everything when force is asked for', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockReindexKnowledge.mockResolvedValue({
      lessons: 4,
      chunks: 20,
      embedded: 20,
      removed: 0,
    });
    renderAiSection();

    fireEvent.click(await screen.findByRole('button', { name: /re-embed all/i }));

    await waitFor(() => expect(mockReindexKnowledge).toHaveBeenCalledTimes(1));
    expect(mockReindexKnowledge).toHaveBeenCalledWith({ force: true });
  });

  it('does not call the server when the reindex confirmation is declined', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderAiSection();

    fireEvent.click(await screen.findByRole('button', { name: /đánh lại chỉ mục/i }));

    expect(mockReindexKnowledge).not.toHaveBeenCalled();
  });

  // A failed nightly run leaves rows without their vector, and nothing else
  // surfaces that — the counters here are the only place an admin would see it.
  it('shows the index status counters from the status endpoint', async () => {
    renderAiSection();

    expect(
      await screen.findByText(/1 chờ embed/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/20 chunks/i)).toBeInTheDocument();
    expect(screen.getByText(/4 bài/i)).toBeInTheDocument();
    expect(mockGetKnowledgeIndexStatus).toHaveBeenCalled();
  });

  it('warns when the embedding provider is not configured', async () => {
    mockGetKnowledgeIndexStatus.mockResolvedValue({
      embeddingConfigured: false,
      lessons: 0,
      chunks: 0,
      embedded: 0,
      pending: 0,
      bySourceType: [],
      lastEmbeddedAt: null,
    });
    renderAiSection();

    expect(
      await screen.findByText(/chưa cấu hình embedding provider/i),
    ).toBeInTheDocument();
  });

  it('refreshes the status counters after a reindex run', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockReindexKnowledge.mockResolvedValue({
      lessons: 4,
      chunks: 20,
      embedded: 6,
      removed: 1,
    });
    renderAiSection();

    fireEvent.click(await screen.findByRole('button', { name: /đánh lại chỉ mục/i }));

    await waitFor(() => expect(mockReindexKnowledge).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockGetKnowledgeIndexStatus.mock.calls.length).toBeGreaterThanOrEqual(2),
    );
  });
});