import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockSettingsState = {
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
};

vi.mock('@/store/settings.store', () => ({
  useSettingsStore: vi.fn(() => mockSettingsState),
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@test.com', displayName: 'Test', roles: ['admin'], createdAt: '', updatedAt: '' },
    isAuthenticated: true,
    accessToken: 'token',
  }),
}));

vi.mock('@/store/aiProvider.store', () => ({
  useAiProviderStore: () => ({
    settings: { apiKey: '', baseUrl: '', model: '', maxTokens: 700, temperature: 0.4 },
    isConfigured: false,
    saveSettings: vi.fn(),
    clearSettings: vi.fn(),
  }),
}));

vi.mock('@/api/ai.api', () => ({
  getAiSettings: vi.fn().mockResolvedValue(null),
  updateAiSettings: vi.fn(),
  testAiSettings: vi.fn(),
}));

import AdvancedSettings from './AdvancedSettings';

describe('AdvancedSettings cleanup', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.skip('clears the saved-toast timeout when unmounted', () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    const { unmount } = render(
      <MemoryRouter>
        <AdvancedSettings />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /light/i }));
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
