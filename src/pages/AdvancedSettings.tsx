import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  Shield,
  Eye,
  Trash2,
  Monitor,
  Volume2,
  VolumeX,
  Palette,
  Languages,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Keyboard,
  Zap,
  BarChart2,
  Bot,
  Brain,
  BookOpen,
  Save,
  RotateCcw,
  AlertTriangle,
  Info,
  Check,
  HardDrive,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getAiSettings, updateAiSettings, testAiSettings } from '@/api/ai.api';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore, type SettingsState } from '@/store/settings.store';
import type { AiProviderSettingsView, ConfigSource } from '@/types/ai.types';
import './Education.css';

/* ================================================================ */

const BASE_SETTING_SECTIONS = [
  { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  { id: 'learning' as const, label: 'Learning', icon: Brain },
  { id: 'privacy' as const, label: 'Privacy & Security', icon: Shield },
  { id: 'accessibility' as const, label: 'Accessibility', icon: Eye },
  { id: 'data' as const, label: 'Data & Storage', icon: Database },
  { id: 'advanced' as const, label: 'Advanced', icon: Zap },
];

type SectionId = (typeof BASE_SETTING_SECTIONS)[number]['id'] | 'ai-provider';
type SettingsValues = Omit<SettingsState, 'updateSetting' | 'resetAppearance'>;

const SOURCE_BADGE: Record<ConfigSource, string> = {
  db: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  env: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  default: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

export default function AdvancedSettings() {
  const [activeSection, setActiveSection] = useState<SectionId>('appearance');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const savedToastTimeoutRef = useRef<number | null>(null);

  const userRoles = useAuthStore((s) => s.user?.roles ?? []);
  const canManageAi =
    userRoles.includes('admin') || userRoles.includes('education_admin');

  const settingSections = [
    ...BASE_SETTING_SECTIONS,
    ...(canManageAi
      ? [{ id: 'ai-provider' as const, label: 'AI Provider', icon: Bot }]
      : []),
  ];

  const [aiSettings, setAiSettings] = useState<AiProviderSettingsView | null>(null);
  const [aiBaseUrl, setAiBaseUrl] = useState('');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [aiMaxTokens, setAiMaxTokens] = useState(2048);
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [aiSystemRules, setAiSystemRules] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiTesting, setAiTesting] = useState(false);

  const s = useSettingsStore();

  const setSetting = <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) => {
    s.updateSetting(key, value);
  };

  const theme = s.theme; const setTheme = (v: string) => setSetting('theme', v);
  const accentColor = s.accentColor; const setAccentColor = (v: string) => setSetting('accentColor', v);
  const fontSize = s.fontSize; const setFontSize = (v: string) => setSetting('fontSize', v);
  const reducedMotion = s.reducedMotion; const setReducedMotion = (v: boolean) => setSetting('reducedMotion', v);
  const compactMode = s.compactMode; const setCompactMode = (v: boolean) => setSetting('compactMode', v);
  const pushNotif = s.pushNotif; const setPushNotif = (v: boolean) => setSetting('pushNotif', v);
  const emailDigest = s.emailDigest; const setEmailDigest = (v: boolean) => setSetting('emailDigest', v);
  const streakReminder = s.streakReminder; const setStreakReminder = (v: boolean) => setSetting('streakReminder', v);
  const quizResults = s.quizResults; const setQuizResults = (v: boolean) => setSetting('quizResults', v);
  const communityMentions = s.communityMentions; const setCommunityMentions = (v: boolean) => setSetting('communityMentions', v);
  const soundEffects = s.soundEffects; const setSoundEffects = (v: boolean) => setSetting('soundEffects', v);
  const quietHoursEnabled = s.quietHoursEnabled; const setQuietHoursEnabled = (v: boolean) => setSetting('quietHoursEnabled', v);
  const dailyGoal = s.dailyGoal; const setDailyGoal = (v: string) => setSetting('dailyGoal', v);
  const autoPlay = s.autoPlay; const setAutoPlay = (v: boolean) => setSetting('autoPlay', v);
  const showHints = s.showHints; const setShowHints = (v: boolean) => setSetting('showHints', v);
  const aiDifficulty = s.aiDifficulty; const setAiDifficulty = (v: string) => setSetting('aiDifficulty', v);
  const flashcardOrder = s.flashcardOrder; const setFlashcardOrder = (v: string) => setSetting('flashcardOrder', v);
  const showProgressBar = s.showProgressBar; const setShowProgressBar = (v: boolean) => setSetting('showProgressBar', v);
  const autoSubmitQuiz = s.autoSubmitQuiz; const setAutoSubmitQuiz = (v: boolean) => setSetting('autoSubmitQuiz', v);
  const profileVisibility = s.profileVisibility; const setProfileVisibility = (v: string) => setSetting('profileVisibility', v);
  const showOnLeaderboard = s.showOnLeaderboard; const setShowOnLeaderboard = (v: boolean) => setSetting('showOnLeaderboard', v);
  const activityStatus = s.activityStatus; const setActivityStatus = (v: boolean) => setSetting('activityStatus', v);
  const shareProgress = s.shareProgress; const setShareProgress = (v: boolean) => setSetting('shareProgress', v);
  const twoFactorAuth = s.twoFactorAuth; const setTwoFactorAuth = (v: boolean) => setSetting('twoFactorAuth', v);
  const loginAlerts = s.loginAlerts; const setLoginAlerts = (v: boolean) => setSetting('loginAlerts', v);
  const highContrast = s.highContrast; const setHighContrast = (v: boolean) => setSetting('highContrast', v);
  const screenReader = s.screenReader; const setScreenReader = (v: boolean) => setSetting('screenReader', v);
  const keyboardNav = s.keyboardNav; const setKeyboardNav = (v: boolean) => setSetting('keyboardNav', v);
  const largeText = s.largeText; const setLargeText = (v: boolean) => setSetting('largeText', v);
  const offlineMode = s.offlineMode; const setOfflineMode = (v: boolean) => setSetting('offlineMode', v);
  const autoSync = s.autoSync; const setAutoSync = (v: boolean) => setSetting('autoSync', v);
  const devMode = s.devMode; const setDevMode = (v: boolean) => setSetting('devMode', v);
  const betaFeatures = s.betaFeatures; const setBetaFeatures = (v: boolean) => setSetting('betaFeatures', v);
  const analyticsOpt = s.analyticsOpt; const setAnalyticsOpt = (v: boolean) => setSetting('analyticsOpt', v);

  const cacheSize = '245 MB';

  const markChanged = () => setHasChanges(true);

  const handleSave = () => {
    setHasChanges(false);
    setShowSavedToast(true);
    if (savedToastTimeoutRef.current !== null) {
      window.clearTimeout(savedToastTimeoutRef.current);
    }
    savedToastTimeoutRef.current = window.setTimeout(() => {
      setShowSavedToast(false);
      savedToastTimeoutRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (savedToastTimeoutRef.current !== null) {
        window.clearTimeout(savedToastTimeoutRef.current);
      }
    };
  }, []);

  const applyAiSettings = (view: AiProviderSettingsView) => {
    setAiSettings(view);
    setAiBaseUrl(view.baseUrl ?? '');
    setAiApiKey('');
    setAiModel(view.model ?? '');
    setAiMaxTokens(view.maxTokens ?? 2048);
    setAiTemperature(view.temperature ?? 0.7);
    setAiSystemRules(view.systemRules ?? '');
  };

  useEffect(() => {
    if (activeSection !== 'ai-provider' || !canManageAi) return;
    let cancelled = false;
    setAiLoading(true);
    getAiSettings()
      .then((view) => {
        if (!cancelled) applyAiSettings(view);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load AI settings');
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSection, canManageAi]);

  useEffect(() => {
    if (!canManageAi && activeSection === 'ai-provider') {
      setActiveSection('appearance');
    }
  }, [canManageAi, activeSection]);

  const handleSaveAi = async () => {
    setAiSaving(true);
    try {
      const body: Parameters<typeof updateAiSettings>[0] = {
        baseUrl: aiBaseUrl,
        model: aiModel,
        maxTokens: Number(aiMaxTokens),
        temperature: Number(aiTemperature),
        systemRules: aiSystemRules,
      };
      if (aiApiKey.trim()) body.apiKey = aiApiKey.trim();
      const view = await updateAiSettings(body);
      applyAiSettings(view);
      toast.success('AI settings saved');
      setShowSavedToast(true);
      if (savedToastTimeoutRef.current !== null) {
        window.clearTimeout(savedToastTimeoutRef.current);
      }
      savedToastTimeoutRef.current = window.setTimeout(() => {
        setShowSavedToast(false);
        savedToastTimeoutRef.current = null;
      }, 2500);
    } catch {
      toast.error('Failed to save AI settings');
    } finally {
      setAiSaving(false);
    }
  };

  const handleTestAi = async () => {
    setAiTesting(true);
    try {
      const result = await testAiSettings();
      if (result.ok) {
        toast.success(`Connection OK · ${result.latencyMs}ms`);
      } else {
        toast.error('Connection test failed');
      }
    } catch {
      toast.error('Connection test failed');
    } finally {
      setAiTesting(false);
    }
  };

  const handleClearAiKey = async () => {
    if (!window.confirm('Clear the stored API key? This cannot be undone.')) return;
    setAiSaving(true);
    try {
      const view = await updateAiSettings({ clearApiKey: true });
      applyAiSettings(view);
      toast.success('API key cleared');
    } catch {
      toast.error('Failed to clear API key');
    } finally {
      setAiSaving(false);
    }
  };

  const handleResetAiRules = async () => {
    if (
      !window.confirm(
        'Reset system rules to the built-in default? Custom rules will be removed.',
      )
    ) {
      return;
    }
    setAiSaving(true);
    try {
      const view = await updateAiSettings({ clearSystemRules: true });
      applyAiSettings(view);
      toast.success('System rules reset to default');
    } catch {
      toast.error('Failed to reset system rules');
    } finally {
      setAiSaving(false);
    }
  };

  const handleReset = () => {
    s.resetAppearance();
    setHasChanges(false);
  };

  const accentColors = [
    { id: 'violet', color: '#8b5cf6', label: 'Violet' },
    { id: 'emerald', color: '#10b981', label: 'Emerald' },
    { id: 'amber', color: '#f59e0b', label: 'Amber' },
    { id: 'rose', color: '#f43f5e', label: 'Rose' },
    { id: 'blue', color: '#3b82f6', label: 'Blue' },
    { id: 'fuchsia', color: '#d946ef', label: 'Fuchsia' },
  ];

  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-slate-400" />
            Advanced Settings
          </h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
            Customize your learning experience
          </p>
        </header>

        {/* Save Bar */}
        {(hasChanges || showSavedToast) && (
          <div className={`mb-6 px-6 py-4 rounded-2xl flex items-center justify-between transition-all ${
            showSavedToast
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-amber-500/10 border border-amber-500/20'
          }`}>
            <div className="flex items-center gap-3">
              {showSavedToast ? (
                <>
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">Settings saved successfully!</span>
                </>
              ) : (
                <>
                  <Info className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">You have unsaved changes</span>
                </>
              )}
            </div>
            {hasChanges && (
              <div className="flex gap-2">
                <button onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-bold hover:bg-white/10 transition-all">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                <button onClick={handleSave} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-95 transition-all">
                  <Save className="w-3 h-3" /> Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Section Navigation */}
          <nav className="lg:col-span-3">
            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-3xl p-3 space-y-1 lg:sticky lg:top-6">
              {settingSections.map((sec) => {
                const SIcon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                      activeSection === sec.id
                        ? 'bg-accent-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <SIcon className="w-4 h-4" />
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right: Settings Content */}
          <div className="lg:col-span-9 space-y-6">

            {/* ======== APPEARANCE ======== */}
            {activeSection === 'appearance' && (
              <SettingsPanel title="Appearance" icon={Palette} description="Customize the look and feel of your interface">
                {/* Theme */}
                <SettingRow label="Theme" description="Choose your preferred color scheme" icon={Moon}>
                  <div className="flex gap-2">
                    {[{ id: 'dark', label: 'Dark', icon: Moon }, { id: 'light', label: 'Light', icon: Sun }, { id: 'system', label: 'System', icon: Monitor }].map((t) => (
                      <button key={t.id} onClick={() => { setTheme(t.id); markChanged(); }}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${theme === t.id ? 'bg-accent-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        <t.icon className="w-3.5 h-3.5" />{t.label}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                {/* Accent Color */}
                <SettingRow label="Accent Color" description="Primary color used throughout the app" icon={Palette}>
                  <div className="flex gap-3">
                    {accentColors.map((c) => (
                      <button key={c.id} onClick={() => { setAccentColor(c.id); markChanged(); }}
                        className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${accentColor === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''}`}
                        style={{ background: c.color }} title={c.label} />
                    ))}
                  </div>
                </SettingRow>

                {/* Font Size */}
                <SettingRow label="Font Size" description="Adjust the default text size" icon={Languages}>
                  <div className="flex gap-2">
                    {[{ id: 'small', label: 'Small' }, { id: 'medium', label: 'Medium' }, { id: 'large', label: 'Large' }].map((s) => (
                      <button key={s.id} onClick={() => { setFontSize(s.id); markChanged(); }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${fontSize === s.id ? 'bg-accent-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <ToggleRow label="Reduced Motion" description="Disable animations for better performance" icon={Sparkles}
                  checked={reducedMotion} onChange={() => { setReducedMotion(!reducedMotion); markChanged(); }} />
                <ToggleRow label="Compact Mode" description="Denser layout with smaller spacing" icon={Monitor}
                  checked={compactMode} onChange={() => { setCompactMode(!compactMode); markChanged(); }} />
              </SettingsPanel>
            )}

            {/* ======== NOTIFICATIONS ======== */}
            {activeSection === 'notifications' && (
              <SettingsPanel title="Notifications" icon={Bell} description="Manage how and when you receive notifications">
                <ToggleRow label="Push Notifications" description="Receive real-time alerts on your device" icon={Bell}
                  checked={pushNotif} onChange={() => { setPushNotif(!pushNotif); markChanged(); }} />
                <ToggleRow label="Email Digest" description="Weekly summary of your learning progress" icon={Globe}
                  checked={emailDigest} onChange={() => { setEmailDigest(!emailDigest); markChanged(); }} />
                <ToggleRow label="Streak Reminders" description="Get reminded before your streak expires" icon={Clock}
                  checked={streakReminder} onChange={() => { setStreakReminder(!streakReminder); markChanged(); }} />
                <ToggleRow label="Quiz Results" description="Notifications when quiz results are available" icon={BarChart2}
                  checked={quizResults} onChange={() => { setQuizResults(!quizResults); markChanged(); }} />
                <ToggleRow label="Community Mentions" description="When someone mentions you in a post or comment" icon={Globe}
                  checked={communityMentions} onChange={() => { setCommunityMentions(!communityMentions); markChanged(); }} />
                <ToggleRow label="Sound Effects" description="Audio feedback for interactions" icon={soundEffects ? Volume2 : VolumeX}
                  checked={soundEffects} onChange={() => { setSoundEffects(!soundEffects); markChanged(); }} />
                <ToggleRow label="Quiet Hours" description="Mute all notifications during set hours" icon={Moon}
                  checked={quietHoursEnabled} onChange={() => { setQuietHoursEnabled(!quietHoursEnabled); markChanged(); }} />
              </SettingsPanel>
            )}

            {/* ======== LEARNING ======== */}
            {activeSection === 'learning' && (
              <SettingsPanel title="Learning Preferences" icon={Brain} description="Fine-tune your learning experience">
                <SettingRow label="Daily Goal" description="Minutes of study per day" icon={Clock}>
                  <div className="flex gap-2">
                    {['10', '20', '30', '60', '90'].map((min) => (
                      <button key={min} onClick={() => { setDailyGoal(min); markChanged(); }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${dailyGoal === min ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        {min}m
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <SettingRow label="AI Tutor Difficulty" description="How challenging AI responses should be" icon={Bot}>
                  <div className="flex gap-2">
                    {[{ id: 'easy', label: 'Easy' }, { id: 'adaptive', label: 'Adaptive' }, { id: 'hard', label: 'Hard' }].map((d) => (
                      <button key={d.id} onClick={() => { setAiDifficulty(d.id); markChanged(); }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${aiDifficulty === d.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <SettingRow label="Flashcard Order" description="How flashcards are ordered in review sessions" icon={BookOpen}>
                  <div className="flex gap-2">
                    {[{ id: 'spaced', label: 'Spaced Repetition' }, { id: 'random', label: 'Random' }, { id: 'sequential', label: 'Sequential' }].map((o) => (
                      <button key={o.id} onClick={() => { setFlashcardOrder(o.id); markChanged(); }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${flashcardOrder === o.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <ToggleRow label="Auto-Play Audio" description="Automatically play pronunciation audio" icon={Volume2}
                  checked={autoPlay} onChange={() => { setAutoPlay(!autoPlay); markChanged(); }} />
                <ToggleRow label="Show Hints" description="Display helpful hints during exercises" icon={Info}
                  checked={showHints} onChange={() => { setShowHints(!showHints); markChanged(); }} />
                <ToggleRow label="Progress Bar" description="Show progress indicator during lessons" icon={BarChart2}
                  checked={showProgressBar} onChange={() => { setShowProgressBar(!showProgressBar); markChanged(); }} />
                <ToggleRow label="Auto-Submit Quiz" description="Automatically submit when time runs out" icon={Zap}
                  checked={autoSubmitQuiz} onChange={() => { setAutoSubmitQuiz(!autoSubmitQuiz); markChanged(); }} />
              </SettingsPanel>
            )}

            {/* ======== PRIVACY ======== */}
            {activeSection === 'privacy' && (
              <SettingsPanel title="Privacy & Security" icon={Shield} description="Control your privacy and account security">
                <SettingRow label="Profile Visibility" description="Who can see your profile" icon={Eye}>
                  <div className="flex gap-2">
                    {[{ id: 'public', label: 'Public' }, { id: 'friends', label: 'Friends Only' }, { id: 'private', label: 'Private' }].map((v) => (
                      <button key={v.id} onClick={() => { setProfileVisibility(v.id); markChanged(); }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${profileVisibility === v.id ? 'bg-accent-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <ToggleRow label="Show on Leaderboard" description="Display your rank on public leaderboards" icon={BarChart2}
                  checked={showOnLeaderboard} onChange={() => { setShowOnLeaderboard(!showOnLeaderboard); markChanged(); }} />
                <ToggleRow label="Activity Status" description="Show when you're online to other users" icon={Wifi}
                  checked={activityStatus} onChange={() => { setActivityStatus(!activityStatus); markChanged(); }} />
                <ToggleRow label="Share Learning Progress" description="Allow others to see your course progress" icon={Globe}
                  checked={shareProgress} onChange={() => { setShareProgress(!shareProgress); markChanged(); }} />

                <div className="pt-4 mt-2 border-t border-white/5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Security</h4>
                </div>
                <ToggleRow label="Two-Factor Authentication" description="Add extra security to your account (recommended)" icon={Shield}
                  checked={twoFactorAuth} onChange={() => { setTwoFactorAuth(!twoFactorAuth); markChanged(); }} />
                <ToggleRow label="Login Alerts" description="Email notification when a new device logs in" icon={Lock}
                  checked={loginAlerts} onChange={() => { setLoginAlerts(!loginAlerts); markChanged(); }} />

                <SettingRow label="Change Password" description="Update your account password" icon={Lock}>
                  <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all">
                    Change Password
                  </button>
                </SettingRow>
              </SettingsPanel>
            )}

            {/* ======== ACCESSIBILITY ======== */}
            {activeSection === 'accessibility' && (
              <SettingsPanel title="Accessibility" icon={Eye} description="Make the app easier to use for everyone">
                <ToggleRow label="High Contrast" description="Increase contrast for better readability" icon={Eye}
                  checked={highContrast} onChange={() => { setHighContrast(!highContrast); markChanged(); }} />
                <ToggleRow label="Screen Reader Support" description="Optimize layout for screen readers" icon={Monitor}
                  checked={screenReader} onChange={() => { setScreenReader(!screenReader); markChanged(); }} />
                <ToggleRow label="Keyboard Navigation" description="Full keyboard shortcuts and tab navigation" icon={Keyboard}
                  checked={keyboardNav} onChange={() => { setKeyboardNav(!keyboardNav); markChanged(); }} />
                <ToggleRow label="Large Text" description="Increase text size across the application" icon={Languages}
                  checked={largeText} onChange={() => { setLargeText(!largeText); markChanged(); }} />
              </SettingsPanel>
            )}

            {/* ======== DATA ======== */}
            {activeSection === 'data' && (
              <SettingsPanel title="Data & Storage" icon={Database} description="Manage offline data and storage usage">
                <ToggleRow label="Offline Mode" description="Download content for offline access" icon={offlineMode ? Wifi : WifiOff}
                  checked={offlineMode} onChange={() => { setOfflineMode(!offlineMode); markChanged(); }} />
                <ToggleRow label="Auto-Sync" description="Automatically sync progress when online" icon={RotateCcw}
                  checked={autoSync} onChange={() => { setAutoSync(!autoSync); markChanged(); }} />

                <SettingRow label="Cache Storage" description={`Currently using ${cacheSize} of cached data`} icon={HardDrive}>
                  <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all">
                    Clear Cache
                  </button>
                </SettingRow>

                <SettingRow label="Export Data" description="Manage your data exports and view learning history" icon={Database}>
                  <Link to="/data-logs" className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-[0_0_15px_rgba(20,184,166,0.2)] text-xs font-bold hover:scale-105 active:scale-95 transition-all">
                    <Database className="w-3 h-3" /> Data & Logs
                  </Link>
                </SettingRow>

                {/* Danger zone */}
                <div className="mt-6 p-6 rounded-2xl bg-rose-950/20 border border-rose-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <h4 className="text-sm font-bold text-rose-400">Danger Zone</h4>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">These actions are permanent and cannot be undone.</p>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all">
                      <Trash2 className="w-3 h-3" /> Delete All Data
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all">
                      <Trash2 className="w-3 h-3" /> Delete Account
                    </button>
                  </div>
                </div>
              </SettingsPanel>
            )}

            {/* ======== ADVANCED ======== */}
            {activeSection === 'advanced' && (
              <SettingsPanel title="Advanced" icon={Zap} description="Developer tools and experimental features">
                <ToggleRow label="Developer Mode" description="Show debug info and additional tools" icon={Zap}
                  checked={devMode} onChange={() => { setDevMode(!devMode); markChanged(); }} />
                <ToggleRow label="Beta Features" description="Get early access to new features (may be unstable)" icon={Sparkles}
                  checked={betaFeatures} onChange={() => { setBetaFeatures(!betaFeatures); markChanged(); }} />
                <ToggleRow label="Analytics" description="Send anonymous usage data to help improve the app" icon={BarChart2}
                  checked={analyticsOpt} onChange={() => { setAnalyticsOpt(!analyticsOpt); markChanged(); }} />

                <SettingRow label="API Key" description="Your personal API key for external integrations" icon={Lock}>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-2 rounded-lg bg-black/30 border border-white/5 text-[10px] font-mono text-slate-400">
                      sk-****-****-****-7f3a
                    </code>
                    <button className="px-3 py-2 rounded-lg bg-white/5 text-slate-400 text-[10px] font-bold hover:bg-white/10 transition-all">
                      Copy
                    </button>
                  </div>
                </SettingRow>

                <SettingRow label="App Version" description="Current installation version" icon={Info}>
                  <span className="px-3 py-2 rounded-lg bg-black/20 border border-white/5 text-xs font-mono text-slate-400">v2.4.1</span>
                </SettingRow>
              </SettingsPanel>
            )}

            {/* ======== AI PROVIDER (admin) ======== */}
            {activeSection === 'ai-provider' && canManageAi && (
              <SettingsPanel title="AI Provider" icon={Bot} description="Configure the OpenAI-compatible provider used by the AI tutor">
                {aiLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-slate-400 text-sm font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
                  </div>
                ) : (
                  <>
                    <SettingRow label="Base URL" description="OpenAI-compatible API base URL" icon={Globe}>
                      <div className="flex flex-col items-end gap-1.5">
                        <SourceBadge source={aiSettings?.source.baseUrl} />
                        <input
                          type="text"
                          value={aiBaseUrl}
                          onChange={(e) => setAiBaseUrl(e.target.value)}
                          placeholder="https://api.openai.com/v1"
                          className="w-64 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-accent-500/50"
                        />
                      </div>
                    </SettingRow>

                    <SettingRow label="API Key" description="Provider API key (never shown in full)" icon={Lock}>
                      <div className="flex flex-col items-end gap-1.5">
                        <SourceBadge source={aiSettings?.source.apiKey} />
                        <input
                          type="password"
                          value={aiApiKey}
                          onChange={(e) => setAiApiKey(e.target.value)}
                          placeholder={
                            aiSettings?.apiKeyConfigured && aiSettings.apiKeyLast4
                              ? `••••${aiSettings.apiKeyLast4}`
                              : 'sk-…'
                          }
                          autoComplete="off"
                          className="w-64 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-accent-500/50"
                        />
                      </div>
                    </SettingRow>

                    <SettingRow label="Model" description="Model id sent to the provider" icon={Bot}>
                      <div className="flex flex-col items-end gap-1.5">
                        <SourceBadge source={aiSettings?.source.model} />
                        <input
                          type="text"
                          value={aiModel}
                          onChange={(e) => setAiModel(e.target.value)}
                          placeholder="gpt-4o-mini"
                          className="w-64 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-accent-500/50"
                        />
                      </div>
                    </SettingRow>

                    <SettingRow label="Max Tokens" description="Maximum completion tokens per response" icon={Zap}>
                      <div className="flex flex-col items-end gap-1.5">
                        <SourceBadge source={aiSettings?.source.maxTokens} />
                        <input
                          type="number"
                          min={1}
                          value={aiMaxTokens}
                          onChange={(e) => setAiMaxTokens(Number(e.target.value))}
                          className="w-32 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-accent-500/50"
                        />
                      </div>
                    </SettingRow>

                    <SettingRow label="Temperature" description="Sampling temperature (0–2)" icon={Sparkles}>
                      <div className="flex flex-col items-end gap-1.5">
                        <SourceBadge source={aiSettings?.source.temperature} />
                        <input
                          type="number"
                          min={0}
                          max={2}
                          step={0.1}
                          value={aiTemperature}
                          onChange={(e) => setAiTemperature(Number(e.target.value))}
                          className="w-32 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-accent-500/50"
                        />
                      </div>
                    </SettingRow>

                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-white flex items-center gap-2">
                            <Brain className="w-4 h-4 text-accent-400" />
                            System rules
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Prompt rules for every tutor reply (scope, tone, anti-hallucination). Max 8000 chars.
                          </p>
                        </div>
                        <SourceBadge source={aiSettings?.source.systemRules} />
                      </div>
                      <textarea
                        value={aiSystemRules}
                        onChange={(e) => setAiSystemRules(e.target.value)}
                        rows={8}
                        maxLength={8000}
                        placeholder="You are a practical language tutor..."
                        className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-accent-500/50 resize-y min-h-[140px]"
                      />
                      <p className="text-[10px] text-slate-500 text-right">
                        {aiSystemRules.length}/8000
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-6">
                      <button
                        type="button"
                        onClick={handleSaveAi}
                        disabled={aiSaving || aiTesting}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {aiSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleTestAi}
                        disabled={aiSaving || aiTesting}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {aiTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                        Test connection
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAiKey}
                        disabled={aiSaving || aiTesting || !aiSettings?.apiKeyConfigured}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <Trash2 className="w-3 h-3" /> Clear API key
                      </button>
                      <button
                        type="button"
                        onClick={handleResetAiRules}
                        disabled={aiSaving || aiTesting || aiSettings?.source.systemRules === 'default'}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset rules
                      </button>
                    </div>
                  </>
                )}
              </SettingsPanel>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
 * SUB-COMPONENTS
 * ================================================================ */

function SettingsPanel({ title, icon: Icon, description, children }: {
  title: string;
  icon: LucideIcon;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-fuchsia-500 flex items-center justify-center shadow-md">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black font-headline text-white">{title}</h2>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{description}</p>
        </div>
      </div>
      <div className="mt-8 space-y-0 divide-y divide-white/[0.04]">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, description, icon: Icon, children }: {
  label: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-5 gap-6">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, icon: Icon, checked, onChange }: {
  label: string;
  description: string;
  icon: LucideIcon;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-5 gap-6">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button onClick={onChange} className={`relative w-12 h-7 rounded-full transition-all flex-shrink-0 ${checked ? 'bg-accent-600' : 'bg-slate-700'}`}>
        <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function SourceBadge({ source }: { source?: ConfigSource }) {
  if (!source) return null;
  return (
    <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${SOURCE_BADGE[source]}`}>
      {source}
    </span>
  );
}
