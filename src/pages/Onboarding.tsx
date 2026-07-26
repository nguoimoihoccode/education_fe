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

const LANGUAGES = [
  { id: 'english', label: 'Tiếng Anh', flag: '🇺🇸', popular: true },
  { id: 'japanese', label: 'Tiếng Nhật', flag: '🇯🇵', popular: true },
  { id: 'korean', label: 'Tiếng Hàn', flag: '🇰🇷', popular: true },
  { id: 'chinese', label: 'Tiếng Trung', flag: '🇨🇳', popular: true },
  { id: 'spanish', label: 'Tiếng Tây Ban Nha', flag: '🇪🇸', popular: false },
  { id: 'french', label: 'Tiếng Pháp', flag: '🇫🇷', popular: false },
  { id: 'german', label: 'Tiếng Đức', flag: '🇩🇪', popular: false },
  { id: 'vietnamese', label: 'Tiếng Việt', flag: '🇻🇳', popular: false },
];

const SKILL_LEVELS: Array<{ id: string; label: string; icon: LucideIcon; description: string }> = [
  { id: 'beginner', label: 'Mới bắt đầu', icon: Sprout, description: 'Chưa có nền tảng, học từ con số 0' },
  { id: 'elementary', label: 'Cơ bản', icon: BookOpen, description: 'Biết một số từ vựng và ngữ pháp' },
  { id: 'intermediate', label: 'Trung cấp', icon: GraduationCap, description: 'Giao tiếp được ở mức độ vừa' },
  { id: 'advanced', label: 'Nâng cao', icon: Trophy, description: 'Gần thành thạo, muốn luyện tập thêm' },
];

const GOALS = [
  { id: 'travel', label: 'Du lịch', icon: Globe, description: 'Giao tiếp khi đi nước ngoài' },
  { id: 'career', label: 'Công việc', icon: Target, description: 'Phát triển kỹ năng nghề nghiệp' },
  { id: 'exam', label: 'Thi chứng chỉ', icon: Trophy, description: 'TOEIC, IELTS, JLPT, HSK...' },
  { id: 'culture', label: 'Văn hoá', icon: BookOpen, description: 'Xem phim, đọc sách bằng ngôn ngữ gốc' },
  { id: 'brain', label: 'Rèn não', icon: Brain, description: 'Giữ trí não sắc bén' },
  { id: 'social', label: 'Kết bạn', icon: Languages, description: 'Kết nối với bạn bè quốc tế' },
];

const DAILY_TIMES: Array<{ id: string; label: string; description: string; icon: LucideIcon }> = [
  { id: '5', label: '5 phút', description: 'Học nhẹ nhàng', icon: Coffee },
  { id: '15', label: '15 phút', description: 'Học đều đặn', icon: BookOpen },
  { id: '30', label: '30 phút', description: 'Học nghiêm túc', icon: Flame },
  { id: '60', label: '60 phút', description: 'Học chuyên sâu', icon: Gem },
];

const TOTAL_STEPS = 5;

const STEP_LABELS = ['Chào mừng', 'Ngôn ngữ', 'Trình độ', 'Mục tiêu', 'Thời gian'];

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
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
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
      // ignore
    }
    if (dailyTime) {
      updateSetting('dailyGoal', dailyTime);
    }
    navigate('/education');
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="education-container education-path-page" style={{ color: 'var(--app-text)' }}>
      <div className="dashboard-wrapper">
        <div className="max-w-2xl mx-auto min-h-[80vh] flex flex-col">

          {/* Step indicator */}
          {step > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--app-text-subtle)' }}>
                  Bước {step} / {TOTAL_STEPS - 1}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--app-primary)' }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: TOTAL_STEPS - 1 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1.5 rounded-full transition-colors"
                    style={{
                      background: i < step ? 'var(--app-primary)' : i === step - 1 ? 'var(--app-primary)' : 'var(--app-surface-hover)',
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {STEP_LABELS.slice(1).map((label, i) => (
                  <div key={label} className="flex-1 text-center">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: i === step - 1 ? 'var(--app-primary)' : 'var(--app-text-subtle)' }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center">

            {/* ======== STEP 0: Welcome ======== */}
            {step === 0 && (
              <div className="text-center">
                <div
                  className="w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto mb-10"
                  style={{
                    background: 'linear-gradient(135deg, var(--app-accent), var(--app-primary))',
                    boxShadow: '0 20px 60px rgba(139,92,246,0.25)',
                  }}
                >
                  <GraduationCap className="w-14 h-14 text-white" />
                </div>

                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                  style={{
                    background: 'color-mix(in srgb, var(--app-accent) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--app-accent) 25%, transparent)',
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--app-accent)' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--app-accent)' }}>
                    EduPro Learning
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-5 leading-tight" style={{ color: 'var(--app-text)' }}>
                  Cá nhân hoá
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, var(--app-accent), var(--app-primary))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    hành trình học
                  </span>
                </h1>

                <p className="text-sm max-w-md mx-auto leading-relaxed mb-6" style={{ color: 'var(--app-text-muted)' }}>
                  Trả lời vài câu hỏi nhanh để chúng tôi thiết kế lộ trình học phù hợp nhất với bạn. Chỉ mất khoảng 30 giây.
                </p>

                {displayName && (
                  <p className="text-xs font-bold" style={{ color: 'var(--app-text-subtle)' }}>
                    Xin chào, <span style={{ color: 'var(--app-text)' }}>{displayName}</span>!
                  </p>
                )}
              </div>
            )}

            {/* ======== STEP 1: Language ======== */}
            {step === 1 && (
              <div className="w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--app-text)' }}>
                    Bạn muốn học gì?
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>
                    Chọn một hoặc nhiều ngôn ngữ
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {LANGUAGES.map((lang) => {
                    const selected = selectedLanguages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        onClick={() => toggleLanguage(lang.id)}
                        className="flex items-center gap-4 p-5 rounded-2xl border text-left transition-colors"
                        style={{
                          background: selected
                            ? 'color-mix(in srgb, var(--app-accent) 10%, var(--app-surface))'
                            : 'var(--app-surface)',
                          borderColor: selected
                            ? 'color-mix(in srgb, var(--app-accent) 35%, transparent)'
                            : 'var(--app-border)',
                        }}
                      >
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{ color: selected ? 'var(--app-text)' : 'var(--app-text-muted)' }}>
                            {lang.label}
                          </p>
                          {lang.popular && (
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--app-text-subtle)' }}>
                              Phổ biến
                            </span>
                          )}
                        </div>
                        {selected && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--app-accent)' }}
                          >
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
                  <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--app-text)' }}>
                    Trình độ hiện tại?
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>
                    Giúp chúng tôi tìm điểm bắt đầu phù hợp
                  </p>
                </div>
                <div className="space-y-3">
                  {SKILL_LEVELS.map((level) => {
                    const selected = skillLevel === level.id;
                    const LevelIcon = level.icon;
                    return (
                      <button
                        key={level.id}
                        onClick={() => setSkillLevel(level.id)}
                        className="w-full flex items-center gap-5 p-5 rounded-2xl border text-left transition-colors"
                        style={{
                          background: selected
                            ? 'color-mix(in srgb, var(--app-accent) 10%, var(--app-surface))'
                            : 'var(--app-surface)',
                          borderColor: selected
                            ? 'color-mix(in srgb, var(--app-accent) 35%, transparent)'
                            : 'var(--app-border)',
                        }}
                      >
                        <div
                          className="grid h-11 w-11 place-items-center rounded-xl"
                          style={{ background: selected ? 'var(--app-accent)' : 'var(--app-surface-hover)' }}
                        >
                          <LevelIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-bold" style={{ color: selected ? 'var(--app-text)' : 'var(--app-text-muted)' }}>
                            {level.label}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--app-text-subtle)' }}>
                            {level.description}
                          </p>
                        </div>
                        {selected && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--app-accent)' }}
                          >
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
                  <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--app-text)' }}>
                    Mục tiêu của bạn?
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>
                    Chọn tất cả mục tiêu phù hợp — chúng tôi sẽ gợi ý nội dung
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map((goal) => {
                    const selected = selectedGoals.includes(goal.id);
                    const GoalIcon = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl border text-center transition-colors"
                        style={{
                          background: selected
                            ? 'color-mix(in srgb, var(--app-accent) 10%, var(--app-surface))'
                            : 'var(--app-surface)',
                          borderColor: selected
                            ? 'color-mix(in srgb, var(--app-accent) 35%, transparent)'
                            : 'var(--app-border)',
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: selected ? 'var(--app-accent)' : 'var(--app-surface-hover)' }}
                        >
                          <GoalIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: selected ? 'var(--app-text)' : 'var(--app-text-muted)' }}>
                            {goal.label}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--app-text-subtle)' }}>
                            {goal.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======== STEP 4: Daily Time + Summary ======== */}
            {step === 4 && (
              <div className="w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--app-text)' }}>
                    Thời gian mỗi ngày?
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>
                    Đặt mục tiêu thực tế — bạn có thể thay đổi sau
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {DAILY_TIMES.map((time) => {
                    const selected = dailyTime === time.id;
                    const TimeIcon = time.icon;
                    return (
                      <button
                        key={time.id}
                        onClick={() => setDailyTime(time.id)}
                        className="flex flex-col items-center gap-3 p-8 rounded-2xl border text-center transition-colors"
                        style={{
                          background: selected
                            ? 'color-mix(in srgb, var(--app-accent) 10%, var(--app-surface))'
                            : 'var(--app-surface)',
                          borderColor: selected
                            ? 'color-mix(in srgb, var(--app-accent) 35%, transparent)'
                            : 'var(--app-border)',
                        }}
                      >
                        <div
                          className="grid h-14 w-14 place-items-center rounded-2xl"
                          style={{ background: selected ? 'var(--app-accent)' : 'var(--app-surface-hover)' }}
                        >
                          <TimeIcon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-black font-mono" style={{ color: selected ? 'var(--app-text)' : 'var(--app-text-muted)' }}>
                            {time.label}
                          </p>
                          <p className="text-xs font-bold mt-1" style={{ color: 'var(--app-text-subtle)' }}>
                            {time.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Summary */}
                <div
                  className="mt-8 p-6 rounded-2xl border"
                  style={{
                    background: 'var(--app-surface)',
                    borderColor: 'var(--app-border)',
                  }}
                >
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--app-text-subtle)' }}>
                    Lộ trình học của bạn
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLanguages.map((l) => {
                      const lang = LANGUAGES.find((la) => la.id === l);
                      return lang ? (
                        <span
                          key={l}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{
                            background: 'color-mix(in srgb, var(--app-accent) 12%, transparent)',
                            color: 'var(--app-accent)',
                            border: '1px solid color-mix(in srgb, var(--app-accent) 25%, transparent)',
                          }}
                        >
                          {lang.flag} {lang.label}
                        </span>
                      ) : null;
                    })}
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{
                        background: 'color-mix(in srgb, var(--app-primary) 12%, transparent)',
                        color: 'var(--app-primary)',
                        border: '1px solid color-mix(in srgb, var(--app-primary) 25%, transparent)',
                      }}
                    >
                      {SKILL_LEVELS.find((s) => s.id === skillLevel)?.label || 'Mới bắt đầu'}
                    </span>
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{
                        background: 'color-mix(in srgb, var(--app-warning) 12%, transparent)',
                        color: 'var(--app-warning)',
                        border: '1px solid color-mix(in srgb, var(--app-warning) 25%, transparent)',
                      }}
                    >
                      {dailyTime} phút/ngày
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 pb-4 mt-auto">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-bold transition-colors"
                style={{
                  background: 'var(--app-surface)',
                  borderColor: 'var(--app-border)',
                  color: 'var(--app-text)',
                }}
              >
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, var(--app-accent), var(--app-primary))',
                  boxShadow: '0 8px 25px color-mix(in srgb, var(--app-accent) 25%, transparent)',
                }}
              >
                {step === 0 ? 'Bắt đầu' : 'Tiếp tục'}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-transform hover:scale-[1.03] active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, var(--app-primary), #0d9488)',
                  boxShadow: '0 8px 30px color-mix(in srgb, var(--app-primary) 30%, transparent)',
                }}
              >
                <Rocket className="w-5 h-5" /> Bắt đầu học!
              </button>
            )}
          </div>

          {/* Skip */}
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <div className="text-center pb-4">
              <button
                onClick={() => navigate('/education')}
                className="text-xs font-bold transition-colors"
                style={{ color: 'var(--app-text-subtle)' }}
              >
                Bỏ qua bước này
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
