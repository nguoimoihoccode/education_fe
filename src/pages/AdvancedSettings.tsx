import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Download,
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
  Smartphone,
  Keyboard,
  Zap,
  BarChart2,
  Bot,
  Brain,
  BookOpen,
  Save,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  Info,
  Check,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import './Education.css';

/* ================================================================ */

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
}

interface SettingSelect {
  id: string;
  label: string;
  description: string;
  icon: any;
  value: string;
  options: { value: string; label: string }[];
}

const SETTING_SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'learning', label: 'Learning', icon: Brain },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'accessibility', label: 'Accessibility', icon: Eye },
  { id: 'data', label: 'Data & Storage', icon: Database },
  { id: 'advanced', label: 'Advanced', icon: Zap },
] as const;

type SectionId = typeof SETTING_SECTIONS[number]['id'];

export default function AdvancedSettings() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SectionId>('appearance');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const s = useSettingsStore();

  const theme = s.theme; const setTheme = (v: any) => s.updateSetting('theme', v);
  const accentColor = s.accentColor; const setAccentColor = (v: any) => s.updateSetting('accentColor', v);
  const fontSize = s.fontSize; const setFontSize = (v: any) => s.updateSetting('fontSize', v);
  const reducedMotion = s.reducedMotion; const setReducedMotion = (v: any) => s.updateSetting('reducedMotion', v);
  const compactMode = s.compactMode; const setCompactMode = (v: any) => s.updateSetting('compactMode', v);
  const pushNotif = s.pushNotif; const setPushNotif = (v: any) => s.updateSetting('pushNotif', v);
  const emailDigest = s.emailDigest; const setEmailDigest = (v: any) => s.updateSetting('emailDigest', v);
  const streakReminder = s.streakReminder; const setStreakReminder = (v: any) => s.updateSetting('streakReminder', v);
  const quizResults = s.quizResults; const setQuizResults = (v: any) => s.updateSetting('quizResults', v);
  const communityMentions = s.communityMentions; const setCommunityMentions = (v: any) => s.updateSetting('communityMentions', v);
  const soundEffects = s.soundEffects; const setSoundEffects = (v: any) => s.updateSetting('soundEffects', v);
  const quietHoursEnabled = s.quietHoursEnabled; const setQuietHoursEnabled = (v: any) => s.updateSetting('quietHoursEnabled', v);
  const dailyGoal = s.dailyGoal; const setDailyGoal = (v: any) => s.updateSetting('dailyGoal', v);
  const autoPlay = s.autoPlay; const setAutoPlay = (v: any) => s.updateSetting('autoPlay', v);
  const showHints = s.showHints; const setShowHints = (v: any) => s.updateSetting('showHints', v);
  const aiDifficulty = s.aiDifficulty; const setAiDifficulty = (v: any) => s.updateSetting('aiDifficulty', v);
  const flashcardOrder = s.flashcardOrder; const setFlashcardOrder = (v: any) => s.updateSetting('flashcardOrder', v);
  const showProgressBar = s.showProgressBar; const setShowProgressBar = (v: any) => s.updateSetting('showProgressBar', v);
  const autoSubmitQuiz = s.autoSubmitQuiz; const setAutoSubmitQuiz = (v: any) => s.updateSetting('autoSubmitQuiz', v);
  const profileVisibility = s.profileVisibility; const setProfileVisibility = (v: any) => s.updateSetting('profileVisibility', v);
  const showOnLeaderboard = s.showOnLeaderboard; const setShowOnLeaderboard = (v: any) => s.updateSetting('showOnLeaderboard', v);
  const activityStatus = s.activityStatus; const setActivityStatus = (v: any) => s.updateSetting('activityStatus', v);
  const shareProgress = s.shareProgress; const setShareProgress = (v: any) => s.updateSetting('shareProgress', v);
  const twoFactorAuth = s.twoFactorAuth; const setTwoFactorAuth = (v: any) => s.updateSetting('twoFactorAuth', v);
  const loginAlerts = s.loginAlerts; const setLoginAlerts = (v: any) => s.updateSetting('loginAlerts', v);
  const highContrast = s.highContrast; const setHighContrast = (v: any) => s.updateSetting('highContrast', v);
  const screenReader = s.screenReader; const setScreenReader = (v: any) => s.updateSetting('screenReader', v);
  const keyboardNav = s.keyboardNav; const setKeyboardNav = (v: any) => s.updateSetting('keyboardNav', v);
  const largeText = s.largeText; const setLargeText = (v: any) => s.updateSetting('largeText', v);
  const offlineMode = s.offlineMode; const setOfflineMode = (v: any) => s.updateSetting('offlineMode', v);
  const autoSync = s.autoSync; const setAutoSync = (v: any) => s.updateSetting('autoSync', v);
  const devMode = s.devMode; const setDevMode = (v: any) => s.updateSetting('devMode', v);
  const betaFeatures = s.betaFeatures; const setBetaFeatures = (v: any) => s.updateSetting('betaFeatures', v);
  const analyticsOpt = s.analyticsOpt; const setAnalyticsOpt = (v: any) => s.updateSetting('analyticsOpt', v);

  const cacheSize = '245 MB';

  const markChanged = () => setHasChanges(true);

  const handleSave = () => {
    setHasChanges(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
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
              {SETTING_SECTIONS.map((sec) => {
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
  icon: any;
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
  icon: any;
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
  icon: any;
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
