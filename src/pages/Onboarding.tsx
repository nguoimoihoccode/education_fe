import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Target,
  Brain,
  Globe,
  BookOpen,
  Trophy,
  Check,
  Rocket,
  Languages,
  Sprout,
  Coffee,
  Gem,
  Flame,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import './Education.css';

const ONBOARDING_STORAGE_KEY = 'edupro-onboarding';

/* ================================================================ */

const LANGUAGES = [
  { id: 'english', label: 'English', flag: '🇺🇸', popular: true },
  { id: 'japanese', label: 'Japanese', flag: '🇯🇵', popular: true },
  { id: 'korean', label: 'Korean', flag: '🇰🇷', popular: true },
  { id: 'spanish', label: 'Spanish', flag: '🇪🇸', popular: true },
  { id: 'french', label: 'French', flag: '🇫🇷', popular: false },
  { id: 'chinese', label: 'Chinese', flag: '🇨🇳', popular: false },
  { id: 'german', label: 'German', flag: '🇩🇪', popular: false },
  { id: 'vietnamese', label: 'Vietnamese', flag: '🇻🇳', popular: false },
];

const SKILL_LEVELS: Array<{ id: string; label: string; icon: LucideIcon; description: string }> = [
  { id: 'beginner', label: 'Beginner', icon: Sprout, description: 'I\'m just starting out' },
  { id: 'elementary', label: 'Elementary', icon: BookOpen, description: 'I know some basics' },
  { id: 'intermediate', label: 'Intermediate', icon: GraduationCap, description: 'I can hold a conversation' },
  { id: 'advanced', label: 'Advanced', icon: Trophy, description: 'I\'m near fluency' },
];

const GOALS = [
  { id: 'travel', label: 'Travel', icon: Globe, description: 'Communicate while abroad' },
  { id: 'career', label: 'Career', icon: Target, description: 'Boost professional skills' },
  { id: 'exam', label: 'Pass an Exam', icon: Trophy, description: 'TOEIC, IELTS, JLPT, etc.' },
  { id: 'culture', label: 'Culture', icon: BookOpen, description: 'Enjoy media in another language' },
  { id: 'brain', label: 'Brain Training', icon: Brain, description: 'Keep my mind sharp' },
  { id: 'social', label: 'Social', icon: Languages, description: 'Connect with people globally' },
];

const DAILY_TIMES: Array<{ id: string; label: string; description: string; icon: LucideIcon }> = [
  { id: '5', label: '5 min', description: 'Casual', icon: Coffee },
  { id: '15', label: '15 min', description: 'Regular', icon: BookOpen },
  { id: '30', label: '30 min', description: 'Serious', icon: Flame },
  { id: '60', label: '60 min', description: 'Intense', icon: Gem },
];

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const [step, setStep] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [dailyTime, setDailyTime] = useState('15');
  const displayName = user?.displayName || '';

  const toggleLanguage = (id: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true; // Welcome
      case 1: return selectedLanguages.length > 0;
      case 2: return skillLevel !== '';
      case 3: return selectedGoals.length > 0;
      case 4: return dailyTime !== '';
      default: return true;
    }
  };

  const handleFinish = () => {
    const payload = {
      languages: selectedLanguages,
      skillLevel,
      goals: selectedGoals,
      dailyTime,
      completedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota / private mode
    }
    // Map daily minutes onto existing learning preference
    if (dailyTime) {
      updateSetting('dailyGoal', dailyTime);
    }
    navigate('/education');
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        <div className="max-w-2xl mx-auto min-h-[75vh] flex flex-col">
          {/* Progress Bar */}
          {step > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step {step} of {TOTAL_STEPS - 1}</span>
                <span className="text-[10px] font-bold text-accent-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-600 to-fuchsia-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="flex-1 flex flex-col items-center justify-center">

            {/* ======== STEP 0: Welcome ======== */}
            {step === 0 && (
              <div className="text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-600 to-fuchsia-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(139,92,246,0.2)]">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-6">
                  <Sparkles className="w-4 h-4 text-accent-400" />
                  <span className="text-xs font-bold text-accent-400 tracking-widest uppercase">Welcome to EduPro</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black font-headline text-white mb-4 leading-tight">
                  Let's personalize
                  <br />
                  <span className="bg-gradient-to-r from-accent-400 to-fuchsia-400 bg-clip-text text-transparent">your journey</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-4">
                  Answer a few quick questions so we can tailor your learning experience. This will only take 30 seconds.
                </p>
                {displayName && (
                  <p className="text-slate-500 text-xs font-bold">
                    Hi, <span className="text-white">{displayName}</span>! 👋
                  </p>
                )}
              </div>
            )}

            {/* ======== STEP 1: Language ======== */}
            {step === 1 && (
              <div className="w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-2">What do you want to learn?</h2>
                  <p className="text-slate-400 text-sm">Select one or more languages you'd like to study</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {LANGUAGES.map((lang) => {
                    const selected = selectedLanguages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        onClick={() => toggleLanguage(lang.id)}
                        className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all ${
                          selected
                            ? 'bg-accent-600/10 border-accent-500/30 shadow-[0_0_20px_rgba(139,92,246,0.08)]'
                            : 'bg-slate-800/60 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                        }`}
                      >
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${selected ? 'text-white' : 'text-slate-300'}`}>{lang.label}</p>
                          {lang.popular && <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Popular</span>}
                        </div>
                        {selected && (
                          <div className="w-6 h-6 rounded-full bg-accent-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======== STEP 2: Skill Level ======== */}
            {step === 2 && (
              <div className="w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-2">What's your current level?</h2>
                  <p className="text-slate-400 text-sm">This helps us find the right starting point for you</p>
                </div>
                <div className="space-y-3">
                  {SKILL_LEVELS.map((level) => {
                    const selected = skillLevel === level.id;
                    const LevelIcon = level.icon;
                    return (
                      <button
                        key={level.id}
                        onClick={() => setSkillLevel(level.id)}
                        className={`w-full flex items-center gap-5 p-6 rounded-2xl border text-left transition-all ${
                          selected
                            ? 'bg-accent-600/10 border-accent-500/30 shadow-[0_0_20px_rgba(139,92,246,0.08)]'
                            : 'bg-slate-800/60 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className={`grid h-11 w-11 place-items-center rounded-xl ${selected ? 'bg-accent-600' : 'bg-slate-700'}`}>
                          <LevelIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-base font-bold ${selected ? 'text-white' : 'text-slate-300'}`}>{level.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{level.description}</p>
                        </div>
                        {selected && (
                          <div className="w-6 h-6 rounded-full bg-accent-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======== STEP 3: Goals ======== */}
            {step === 3 && (
              <div className="w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-2">What's your goal?</h2>
                  <p className="text-slate-400 text-sm">Select all that apply — we'll customize content recommendations</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map((goal) => {
                    const selected = selectedGoals.includes(goal.id);
                    const GoalIcon = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex flex-col items-center gap-3 p-6 rounded-2xl border text-center transition-all ${
                          selected
                            ? 'bg-accent-600/10 border-accent-500/30 shadow-[0_0_20px_rgba(139,92,246,0.08)]'
                            : 'bg-slate-800/60 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected ? 'bg-accent-600' : 'bg-slate-700'} transition-colors`}>
                          <GoalIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${selected ? 'text-white' : 'text-slate-300'}`}>{goal.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{goal.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======== STEP 4: Daily Time ======== */}
            {step === 4 && (
              <div className="w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-2">How much time per day?</h2>
                  <p className="text-slate-400 text-sm">Set a realistic daily goal — you can always change it later</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {DAILY_TIMES.map((time) => {
                    const selected = dailyTime === time.id;
                    const TimeIcon = time.icon;
                    return (
                      <button
                        key={time.id}
                        onClick={() => setDailyTime(time.id)}
                        className={`flex flex-col items-center gap-3 p-8 rounded-2xl border text-center transition-all ${
                          selected
                            ? 'bg-accent-600/10 border-accent-500/30 shadow-[0_0_25px_rgba(139,92,246,0.1)]'
                            : 'bg-slate-800/60 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className={`grid h-14 w-14 place-items-center rounded-2xl ${selected ? 'bg-accent-600' : 'bg-slate-700'}`}>
                          <TimeIcon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className={`text-xl font-black font-mono ${selected ? 'text-white' : 'text-slate-300'}`}>{time.label}</p>
                          <p className="text-xs text-slate-500 font-bold mt-1">{time.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-8 p-6 bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Your Learning Plan</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLanguages.map((l) => {
                      const lang = LANGUAGES.find((la) => la.id === l);
                      return lang ? (
                        <span key={l} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent-500/10 text-accent-400 border border-accent-500/20">
                          {lang.flag} {lang.label}
                        </span>
                      ) : null;
                    })}
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {SKILL_LEVELS.find((s) => s.id === skillLevel)?.label || 'Beginner'}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {dailyTime} min/day
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 pb-4 mt-auto">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white text-sm font-bold shadow-[0_0_25px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
              >
                {step === 0 ? 'Get Started' : 'Continue'} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base font-bold shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Rocket className="w-5 h-5" /> Start Learning!
              </button>
            )}
          </div>

          {/* Skip */}
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <div className="text-center pb-4">
              <button onClick={() => navigate('/education')} className="text-xs text-slate-600 hover:text-slate-400 font-bold transition-colors">
                Skip setup for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
