import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import type { Variants } from 'framer-motion';
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
  Clock,
  Compass,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import { markOnboarded } from '@/utils/onboarding';
import './Education.css';
import './Onboarding.css';

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

const SKILL_LEVELS: Array<{
  id: string;
  label: string;
  cefr: string;
  color: string;
  icon: LucideIcon;
  description: string;
}> = [
  { id: 'beginner', label: 'Mới bắt đầu', cefr: 'A1', color: '#10b981', icon: Sprout, description: 'Chưa có nền tảng, học từ con số 0' },
  { id: 'elementary', label: 'Cơ bản', cefr: 'A2', color: '#14b8a6', icon: BookOpen, description: 'Biết một số từ vựng và ngữ pháp' },
  { id: 'intermediate', label: 'Trung cấp', cefr: 'B1', color: '#8b5cf6', icon: GraduationCap, description: 'Giao tiếp được ở mức độ vừa' },
  { id: 'advanced', label: 'Nâng cao', cefr: 'C1', color: '#f59e0b', icon: Trophy, description: 'Gần thành thạo, muốn luyện tập thêm' },
];

const GOALS: Array<{ id: string; label: string; icon: LucideIcon; color: string; description: string }> = [
  { id: 'travel', label: 'Du lịch', icon: Globe, color: '#06b6d4', description: 'Giao tiếp khi đi nước ngoài' },
  { id: 'career', label: 'Công việc', icon: Target, color: '#10b981', description: 'Phát triển kỹ năng nghề nghiệp' },
  { id: 'exam', label: 'Thi chứng chỉ', icon: Trophy, color: '#f59e0b', description: 'TOEIC, IELTS, JLPT, HSK...' },
  { id: 'culture', label: 'Văn hoá', icon: BookOpen, color: '#8b5cf6', description: 'Xem phim, đọc sách gốc' },
  { id: 'brain', label: 'Rèn não', icon: Brain, color: '#f43f5e', description: 'Giữ trí não sắc bén' },
  { id: 'social', label: 'Kết bạn', icon: Languages, color: '#3b82f6', description: 'Kết nối bạn bè quốc tế' },
];

const DAILY_TIMES: Array<{ id: string; label: string; description: string; icon: LucideIcon }> = [
  { id: '5', label: '5 phút', description: 'Học nhẹ nhàng', icon: Coffee },
  { id: '15', label: '15 phút', description: 'Học đều đặn', icon: BookOpen },
  { id: '30', label: '30 phút', description: 'Học nghiêm túc', icon: Flame },
  { id: '60', label: '60 phút', description: 'Học chuyên sâu', icon: Gem },
];

const GREETINGS = [
  { text: 'Xin chào', lang: 'Tiếng Việt' },
  { text: 'Hello', lang: 'Tiếng Anh' },
  { text: 'こんにちは', lang: 'Tiếng Nhật' },
  { text: '안녕하세요', lang: 'Tiếng Hàn' },
  { text: '你好', lang: 'Tiếng Trung' },
  { text: 'Hola', lang: 'Tiếng Tây Ban Nha' },
  { text: 'Bonjour', lang: 'Tiếng Pháp' },
  { text: 'Hallo', lang: 'Tiếng Đức' },
];

const GLYPHS: Array<{ ch: string; top: string; left: string; size: string; delay: string; dur: string; tint?: 'p' | 'a' }> = [
  { ch: 'あ', top: '6%', left: '68%', size: '2.6rem', delay: '0s', dur: '9s', tint: 'a' },
  { ch: 'A', top: '16%', left: '12%', size: '2rem', delay: '0.8s', dur: '11s' },
  { ch: '你', top: '30%', left: '78%', size: '2.2rem', delay: '1.6s', dur: '8s', tint: 'p' },
  { ch: '한', top: '44%', left: '8%', size: '2.4rem', delay: '0.4s', dur: '10s' },
  { ch: 'Ñ', top: '58%', left: '70%', size: '1.9rem', delay: '2.2s', dur: '9.5s' },
  { ch: 'é', top: '70%', left: '16%', size: '2.1rem', delay: '1.2s', dur: '8.5s', tint: 'p' },
  { ch: 'ß', top: '82%', left: '62%', size: '2.3rem', delay: '0.2s', dur: '10.5s' },
  { ch: 'ع', top: '88%', left: '28%', size: '1.8rem', delay: '1.9s', dur: '9s', tint: 'a' },
  { ch: 'я', top: '38%', left: '42%', size: '1.6rem', delay: '2.6s', dur: '12s' },
  { ch: 'ฮ', top: '12%', left: '44%', size: '1.7rem', delay: '3s', dur: '11s', tint: 'p' },
];

const PERKS: Array<{ icon: LucideIcon; color: string; title: string; description: string }> = [
  { icon: Compass, color: '#10b981', title: 'Lộ trình riêng', description: 'May đo theo trình độ và mục tiêu của bạn' },
  { icon: Brain, color: '#8b5cf6', title: 'Ôn tập ngắt quãng', description: 'Ghi nhớ từ vựng lâu hơn với SRS' },
  { icon: Flame, color: '#f59e0b', title: 'Streak & XP', description: 'Giữ lửa học tập mỗi ngày cùng phần thưởng' },
];

const TOTAL_STEPS = 5;

const STEP_LABELS = ['Chào mừng', 'Ngôn ngữ', 'Trình độ', 'Mục tiêu', 'Thời gian'];

const stepVariants: Variants = {
  enter: (dir: number) => ({ x: dir * 56, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir: number) => ({ x: dir * -56, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } }),
};

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [greetIdx, setGreetIdx] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [dailyTime, setDailyTime] = useState('15');
  const displayName = user?.displayName || '';

  useEffect(() => {
    const timer = setInterval(() => setGreetIdx((i) => (i + 1) % GREETINGS.length), 2400);
    return () => clearInterval(timer);
  }, []);

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
    };
    markOnboarded(payload);
    if (dailyTime) {
      updateSetting('dailyGoal', dailyTime);
    }
    navigate('/today');
  };

  const handleSkip = () => {
    markOnboarded({ skipped: true });
    navigate('/today');
  };

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const goNext = () => goTo(step + 1);
  const goBack = () => goTo(step - 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.target instanceof HTMLButtonElement) return;
      if (step === TOTAL_STEPS - 1) handleFinish();
      else if (canProceed()) goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const progress = (step / (TOTAL_STEPS - 1)) * 100;
  const selectedLevel = SKILL_LEVELS.find((s) => s.id === skillLevel);
  const ticketCode = `EDU-${selectedLanguages.length}${skillLevel ? selectedLevel?.cefr : 'A1'}-${dailyTime}`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="education-container education-path-page" style={{ color: 'var(--app-text)' }}>
        <div className="dashboard-wrapper">
          <div className="ob-shell">

            <aside className="ob-rail">
              <div className="ob-glyphs" aria-hidden="true">
                {GLYPHS.map((g) => (
                  <span
                    key={g.ch}
                    className={`ob-glyph${g.tint === 'p' ? ' ob-glyph--p' : g.tint === 'a' ? ' ob-glyph--a' : ''}`}
                    style={{ top: g.top, left: g.left, fontSize: g.size, animationDelay: g.delay, animationDuration: g.dur }}
                  >
                    {g.ch}
                  </span>
                ))}
              </div>

              <div className="ob-rail-inner">
                <div className="ob-brand">
                  <span className="ob-brand-mark">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </span>
                  <span className="ob-brand-name">LinguaAI</span>
                  <span className="ob-brand-tag">Learning</span>
                </div>

                <div className="ob-greet">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={greetIdx}
                      className="ob-greet-word"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {GREETINGS[greetIdx].text}
                    </motion.p>
                  </AnimatePresence>
                  <p className="ob-greet-sub">
                    {GREETINGS[greetIdx].lang} · {GREETINGS.length} ngôn ngữ đang chờ bạn
                  </p>
                </div>

                <ol className="ob-track">
                  {STEP_LABELS.map((label, i) => {
                    const state = i < step ? 'is-done' : i === step ? 'is-active' : '';
                    return (
                      <li key={label} className={`ob-track-item ${state}`}>
                        <button
                          type="button"
                          className="ob-track-btn"
                          disabled={i >= step}
                          onClick={() => goTo(i)}
                        >
                          <span className="ob-track-dot">
                            {i < step ? <Check className="w-4 h-4" strokeWidth={3} /> : String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="ob-track-label">{label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>

                <div className="ob-rail-foot">
                  <span className="ob-foot-chip">
                    <Clock className="w-3.5 h-3.5" /> ~30 giây
                  </span>
                  <span className="ob-foot-chip">
                    <Sparkles className="w-3.5 h-3.5" /> Tuỳ chỉnh lại bất cứ lúc nào
                  </span>
                </div>
              </div>
            </aside>

            <main className="ob-main">
              <div className="ob-topline">
                <span className="ob-stepcount">
                  BƯỚC {String(step).padStart(2, '0')}<em> / 0{TOTAL_STEPS - 1}</em>
                </span>
                <span className="ob-steplabel">{STEP_LABELS[step]}</span>
              </div>
              <div className="ob-progress" aria-hidden="true">
                <motion.i animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
              </div>

              <div className="ob-stage">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    className="ob-step"
                    custom={dir}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >

                    {step === 0 && (
                      <div>
                        <span className="ob-kicker">
                          <Sparkles className="w-3.5 h-3.5" /> Cá nhân hoá lộ trình
                        </span>
                        <h1 className="ob-h1">
                          {displayName ? `Chào ${displayName}, ` : 'Hành trình học '}
                          <span className="ob-serif">may đo</span>
                          {displayName ? ' hành trình học cho bạn.' : ' bắt đầu từ bạn.'}
                        </h1>
                        <p className="ob-lede">
                          Trả lời 4 câu hỏi nhanh để LinguaAI thiết kế con đường ngắn nhất tới ngôn ngữ bạn mơ ước.
                        </p>
                        <ul className="ob-perks">
                          {PERKS.map((perk) => {
                            const PerkIcon = perk.icon;
                            return (
                              <li key={perk.title} className="ob-perk">
                                <span
                                  className="ob-perk-ic"
                                  style={{
                                    background: `color-mix(in srgb, ${perk.color} 15%, transparent)`,
                                    color: perk.color,
                                  }}
                                >
                                  <PerkIcon className="w-5 h-5" />
                                </span>
                                <div>
                                  <b>{perk.title}</b>
                                  <span>{perk.description}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="ob-welcome-cta">
                          <button type="button" className="ob-btn ob-btn-primary ob-btn-lg" onClick={goNext}>
                            Bắt đầu <ChevronRight className="w-4 h-4 ob-arrow" />
                          </button>
                          <button type="button" className="ob-btn ob-btn-ghost" onClick={handleSkip}>
                            Bỏ qua, vào học luôn
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div>
                        <div className="ob-h2-wrap">
                          <div>
                            <h2 className="ob-h2">Bạn muốn học ngôn ngữ nào?</h2>
                            <p className="ob-h2-sub">Chọn một hoặc nhiều — học song song cũng được</p>
                          </div>
                          <span className="ob-count">Đã chọn {selectedLanguages.length}</span>
                        </div>
                        <motion.div
                          className="ob-grid2"
                          variants={listVariants}
                          initial="hidden"
                          animate="show"
                        >
                          {LANGUAGES.map((lang) => {
                            const selected = selectedLanguages.includes(lang.id);
                            return (
                              <motion.button
                                key={lang.id}
                                type="button"
                                variants={itemVariants}
                                whileTap={{ scale: 0.97 }}
                                aria-pressed={selected}
                                onClick={() => toggleLanguage(lang.id)}
                                className={`ob-card${selected ? ' is-selected' : ''}`}
                              >
                                <span className="ob-flag">{lang.flag}</span>
                                <span className="ob-card-body">
                                  <b>{lang.label}</b>
                                  {lang.popular && <i className="ob-tag">Phổ biến</i>}
                                </span>
                                <span className="ob-check-wrap">
                                  <AnimatePresence>
                                    {selected && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                                      >
                                        <Check className="w-3.5 h-3.5" strokeWidth={3.5} />
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </span>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <div className="ob-h2-wrap">
                          <div>
                            <h2 className="ob-h2">Trình độ hiện tại của bạn?</h2>
                            <p className="ob-h2-sub">Giúp chúng tôi tìm điểm xuất phát phù hợp nhất</p>
                          </div>
                        </div>
                        <motion.div
                          className="ob-levels"
                          variants={listVariants}
                          initial="hidden"
                          animate="show"
                        >
                          {SKILL_LEVELS.map((level) => {
                            const selected = skillLevel === level.id;
                            const LevelIcon = level.icon;
                            return (
                              <motion.button
                                key={level.id}
                                type="button"
                                variants={itemVariants}
                                whileTap={{ scale: 0.98 }}
                                aria-pressed={selected}
                                onClick={() => setSkillLevel(level.id)}
                                className={`ob-card${selected ? ' is-selected' : ''}`}
                              >
                                <span
                                  className="ob-cefr"
                                  style={{
                                    color: level.color,
                                    background: `color-mix(in srgb, ${level.color} 12%, transparent)`,
                                    borderColor: `color-mix(in srgb, ${level.color} 32%, transparent)`,
                                  }}
                                >
                                  {level.cefr}
                                </span>
                                <span className="ob-level-ic">
                                  <LevelIcon className="w-5 h-5" />
                                </span>
                                <span className="ob-card-body">
                                  <b>{level.label}</b>
                                  <small>{level.description}</small>
                                </span>
                                <span className="ob-check-wrap">
                                  <AnimatePresence>
                                    {selected && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                                      >
                                        <Check className="w-3.5 h-3.5" strokeWidth={3.5} />
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </span>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      </div>
                    )}

                    {step === 3 && (
                      <div>
                        <div className="ob-h2-wrap">
                          <div>
                            <h2 className="ob-h2">Mục tiêu của bạn là gì?</h2>
                            <p className="ob-h2-sub">Chọn tất cả những gì phù hợp — chúng tôi sẽ gợi ý nội dung</p>
                          </div>
                          <span className="ob-count">Đã chọn {selectedGoals.length}</span>
                        </div>
                        <motion.div
                          className="ob-grid2 ob-grid-goals"
                          variants={listVariants}
                          initial="hidden"
                          animate="show"
                        >
                          {GOALS.map((goal) => {
                            const selected = selectedGoals.includes(goal.id);
                            const GoalIcon = goal.icon;
                            return (
                              <motion.button
                                key={goal.id}
                                type="button"
                                variants={itemVariants}
                                whileTap={{ scale: 0.96 }}
                                aria-pressed={selected}
                                onClick={() => toggleGoal(goal.id)}
                                className={`ob-card ob-goal${selected ? ' is-selected' : ''}`}
                              >
                                <span className="ob-goal-ic" style={{ background: goal.color }}>
                                  <GoalIcon className="w-5 h-5" />
                                </span>
                                <span className="ob-card-body">
                                  <b>{goal.label}</b>
                                  <small>{goal.description}</small>
                                </span>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      </div>
                    )}

                    {step === 4 && (
                      <div>
                        <div className="ob-h2-wrap">
                          <div>
                            <h2 className="ob-h2">Mỗi ngày dành bao nhiêu phút?</h2>
                            <p className="ob-h2-sub">Đặt mục tiêu thực tế — bạn luôn có thể đổi sau</p>
                          </div>
                        </div>
                        <motion.div
                          className="ob-grid2"
                          variants={listVariants}
                          initial="hidden"
                          animate="show"
                        >
                          {DAILY_TIMES.map((time) => {
                            const selected = dailyTime === time.id;
                            const TimeIcon = time.icon;
                            return (
                              <motion.button
                                key={time.id}
                                type="button"
                                variants={itemVariants}
                                whileTap={{ scale: 0.97 }}
                                aria-pressed={selected}
                                onClick={() => setDailyTime(time.id)}
                                className={`ob-card ob-time${selected ? ' is-selected' : ''}`}
                              >
                                <TimeIcon
                                  className="w-5 h-5"
                                  style={{ color: selected ? 'var(--app-primary)' : 'var(--app-text-subtle)' }}
                                />
                                <span className="ob-time-num">{time.id.padStart(2, '0')}</span>
                                <span className="ob-time-unit">phút / ngày</span>
                                <span className="ob-card-body">
                                  <small>{time.description}</small>
                                </span>
                              </motion.button>
                            );
                          })}
                        </motion.div>

                        <div className="ob-ticket">
                          <div className="ob-ticket-head">
                            <span className="ob-ticket-title">
                              <Compass className="w-4 h-4" /> Vé khởi hành · Lộ trình của bạn
                            </span>
                            <span className="ob-ticket-code">{ticketCode}</span>
                          </div>
                          <div className="ob-ticket-body">
                            {selectedLanguages.map((l) => {
                              const lang = LANGUAGES.find((la) => la.id === l);
                              return lang ? (
                                <span key={l} className="ob-chip">
                                  {lang.flag} {lang.label}
                                </span>
                              ) : null;
                            })}
                            {selectedLevel && (
                              <span className="ob-chip">
                                {selectedLevel.cefr} · {selectedLevel.label}
                              </span>
                            )}
                            <span className="ob-chip">{selectedGoals.length} mục tiêu</span>
                            <span className="ob-chip">
                              <Clock className="w-3 h-3" /> {dailyTime} phút/ngày
                            </span>
                          </div>
                          <div className="ob-barcode" aria-hidden="true" />
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

              {step > 0 && (
                <footer className="ob-nav">
                  <button type="button" className="ob-btn ob-btn-ghost" onClick={goBack}>
                    <ChevronLeft className="w-4 h-4 ob-arrow-back" /> Quay lại
                  </button>
                  <div className="ob-nav-right">
                    {step < TOTAL_STEPS - 1 && (
                      <button type="button" className="ob-skip" onClick={handleSkip}>
                        Bỏ qua bước này
                      </button>
                    )}
                    {step < TOTAL_STEPS - 1 ? (
                      <button
                        type="button"
                        className="ob-btn ob-btn-primary"
                        disabled={!canProceed()}
                        onClick={goNext}
                      >
                        Tiếp tục <ChevronRight className="w-4 h-4 ob-arrow" />
                      </button>
                    ) : (
                      <button type="button" className="ob-btn ob-btn-primary ob-btn-lg" onClick={handleFinish}>
                        <Rocket className="w-5 h-5" /> Bắt đầu học!
                      </button>
                    )}
                  </div>
                </footer>
              )}
            </main>

          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
