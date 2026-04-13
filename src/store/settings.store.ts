import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  theme: string;
  accentColor: string;
  fontSize: string;
  reducedMotion: boolean;
  compactMode: boolean;
  pushNotif: boolean;
  emailDigest: boolean;
  streakReminder: boolean;
  quizResults: boolean;
  communityMentions: boolean;
  soundEffects: boolean;
  quietHoursEnabled: boolean;
  dailyGoal: string;
  autoPlay: boolean;
  showHints: boolean;
  aiDifficulty: string;
  flashcardOrder: string;
  showProgressBar: boolean;
  autoSubmitQuiz: boolean;
  profileVisibility: string;
  showOnLeaderboard: boolean;
  activityStatus: boolean;
  shareProgress: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  highContrast: boolean;
  screenReader: boolean;
  keyboardNav: boolean;
  largeText: boolean;
  offlineMode: boolean;
  autoSync: boolean;
  devMode: boolean;
  betaFeatures: boolean;
  analyticsOpt: boolean;

  updateSetting: (key: string, value: any) => void;
  resetAppearance: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
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

      updateSetting: (key, value) => set({ [key]: value }),
      resetAppearance: () => set({
        theme: 'dark',
        accentColor: 'violet',
        fontSize: 'medium',
        reducedMotion: false,
        compactMode: false,
      })
    }),
    {
      name: 'edupro-settings',
    }
  )
);
