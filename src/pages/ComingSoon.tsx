import { Link } from 'react-router-dom';
import {
  Rocket,
  Bell,
  Sparkles,
  ArrowLeft,
  Star,
  Zap,
  Globe,
  Shield,
  Bot,
  BookOpen,
  Video,
  Mic,
  Brain,
  Trophy,
} from 'lucide-react';
import './Education.css';

/* ================================================================ */

const UPCOMING_FEATURES = [
  { icon: Video, title: 'Live Classes', description: 'Real-time video classes with expert tutors', eta: 'Q3 2026', color: 'from-accent-500 to-indigo-500' },
  { icon: Mic, title: 'Voice Practice', description: 'AI-powered pronunciation and speaking practice', eta: 'Q3 2026', color: 'from-emerald-500 to-teal-500' },
  { icon: Brain, title: 'Adaptive Learning AI', description: 'Personalized curriculum that evolves with you', eta: 'Q4 2026', color: 'from-fuchsia-500 to-pink-500' },
  { icon: Globe, title: 'Language Exchange', description: 'Match with native speakers for peer practice', eta: 'Q4 2026', color: 'from-amber-500 to-orange-500' },
  { icon: Shield, title: 'Certification Program', description: 'Industry-recognized language certificates', eta: 'Q1 2027', color: 'from-blue-500 to-cyan-500' },
  { icon: Trophy, title: 'Team Competitions', description: 'Squad-based learning challenges with prizes', eta: 'Q1 2027', color: 'from-rose-500 to-pink-500' },
];

export default function ComingSoon() {
  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        <div className="max-w-4xl mx-auto">
          {/* ============ HERO ============ */}
          <div className="relative text-center mb-16 pt-8">
            {/* Ambient */}
            <div className="absolute inset-0 -top-20 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-fuchsia-600/6 rounded-full blur-[150px]" />
              <div className="absolute top-20 right-1/3 w-[400px] h-[400px] bg-accent-600/6 rounded-full blur-[120px]" />
            </div>

            <div className="relative">
              {/* Animated rocket */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-fuchsia-600 to-accent-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(192,38,211,0.2)] animate-bounce" style={{ animationDuration: '3s' }}>
                <Rocket className="w-12 h-12 text-white" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs font-bold text-fuchsia-400 tracking-widest uppercase">Under Construction</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black font-headline text-white mb-4 leading-tight">
                Something Amazing
                <br />
                <span className="bg-gradient-to-r from-fuchsia-400 via-accent-400 to-indigo-400 bg-clip-text text-transparent">
                  Is Coming
                </span>
              </h1>

              <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-10">
                We're working hard to bring you incredible new features. Subscribe to get notified when they launch!
              </p>

              {/* Email subscribe */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="flex-1 px-5 py-4 rounded-2xl bg-slate-800/80 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none transition-all"
                />
                <button className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-accent-600 text-white font-bold text-sm shadow-[0_0_25px_rgba(192,38,211,0.25)] hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap">
                  <Bell className="w-4 h-4" /> Notify Me
                </button>
              </div>
            </div>
          </div>

          {/* ============ UPCOMING FEATURES ============ */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-3">
                What's on the Roadmap
              </h2>
              <p className="text-slate-400 text-sm">Exciting features we're building for you</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {UPCOMING_FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:border-white/20 transition-all group relative overflow-hidden"
                  >
                    <div className={`absolute -right-10 -top-10 w-28 h-28 rounded-full blur-[50px] opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${feature.color}`} />
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">{feature.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{feature.description}</p>
                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-white/5 text-slate-400 border border-white/5">
                      ETA: {feature.eta}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============ ROADMAP TIMELINE ============ */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black font-headline text-white mb-3">Release Timeline</h2>
            </div>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent-600 via-fuchsia-600 to-indigo-600 opacity-20" />

              {[
                { quarter: 'Q2 2026', status: 'current', title: 'Platform Enhancements', items: ['Advanced Settings', 'Community Hub', 'Public Profiles', 'Premium Plans'] },
                { quarter: 'Q3 2026', status: 'next', title: 'Interactive Learning', items: ['Live Classes', 'Voice Practice', 'Real-time Collaboration'] },
                { quarter: 'Q4 2026', status: 'planned', title: 'AI & Social', items: ['Adaptive AI Curriculum', 'Language Exchange', 'Study Buddy Matching'] },
                { quarter: 'Q1 2027', status: 'planned', title: 'Pro Features', items: ['Certification Program', 'Team Competitions', 'Enterprise API'] },
              ].map((phase, i) => (
                <div key={i} className="flex gap-6 mb-8 relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${
                    phase.status === 'current' ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : phase.status === 'next' ? 'bg-gradient-to-br from-accent-500 to-fuchsia-500'
                    : 'bg-slate-700'
                  }`}>
                    {phase.status === 'current' ? (
                      <Zap className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white text-xs font-bold">{phase.quarter.split(' ')[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${
                        phase.status === 'current' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : phase.status === 'next' ? 'bg-accent-500/10 text-accent-400 border-accent-500/20'
                        : 'bg-white/5 text-slate-500 border-white/5'
                      }`}>
                        {phase.quarter}
                      </span>
                      {phase.status === 'current' && <span className="text-[10px] font-bold text-emerald-400">● IN PROGRESS</span>}
                    </div>
                    <h4 className="text-base font-bold text-white mb-3">{phase.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.items.map((item, j) => (
                        <span key={j} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-black/20 text-slate-400 border border-white/[0.03]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============ CTA ============ */}
          <div className="text-center pb-10">
            <Link
              to="/education"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Learning
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
