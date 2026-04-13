import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import {
  Activity,
  BarChart3,
  Brain,
  Globe2,
  LineChart,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Wand2,
  BookOpen
} from 'lucide-react';
import './LandingPage.css';

const eduFeatures = [
  {
    icon: MessageSquare,
    title: 'AI Conversational Tutor',
    description: 'Practice languages dynamically with real-time feedback and natural conversation flows.',
  },
  {
    icon: BookOpen,
    title: 'Adaptive Flashcards',
    description: 'Spaced repetition system that adjusts to your learning speed for maximum retention.',
  },
  {
    icon: Globe2,
    title: 'Cultural Context Engine',
    description: 'Learn not just words, but the cultural nuances and regional dialects behind them.',
  },
];

const stockFeatures = [
  {
    icon: BarChart3,
    title: 'Real-Time vn30 Dashboard',
    description: 'Monitor VN30 and ETFs in a unified view with advanced liquidity filters.',
  },
  {
    icon: Brain,
    title: 'Markowitz Portfolio Optimization',
    description: 'Automatically find the optimal Sharpe ratio portfolio, adjusting for volatility.',
  },
  {
    icon: LineChart,
    title: 'Deep Backtesting',
    description: 'Test strategies against historical data, check drawdowns and hit rates.',
  },
];

const LandingPage = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/education" replace />;
  }

  return (
    <div className="landing-root bg-slate-900 text-slate-50 min-h-screen relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-600/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMSAwaHY2NE02NCAxdjY0TTAgMWg2NE0wIDY0aDY0IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>
      </div>

      <header className="relative z-50 px-6 py-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-headline font-black text-xl tracking-tight bg-gradient-to-r from-accent-400 to-emerald-400 bg-clip-text text-transparent">Nexus Platform</span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">EduPro & StockPro</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="px-6 py-2.5 font-bold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-white/40">
            Create Free Account
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-32">
        <section className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-500/30 bg-accent-500/10 text-accent-400 text-sm font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> The Unified Ecosystem
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter leading-tight mb-8">
            Master the <span className="text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">Markets</span>.<br/>Conquer new <span className="text-accent-400 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">Languages</span>.
          </h1>
          <p className="text-xl text-slate-400 mb-10 leading-relaxed">
            One powerful AI-driven platform. Two distinct paths to mastery. Whether you're building a multi-asset financial portfolio or achieving fluency in Spanish, Nexus gives you the tools to succeed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#edupro" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-600 to-fuchsia-600 font-bold text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform flex items-center justify-center gap-3">
              <GraduationCap className="w-6 h-6" /> Explore EduPro
            </a>
            <a href="#stockpro" className="px-8 py-4 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-white/10 font-bold text-lg shadow-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-3 hover:border-emerald-500/50">
              <LineChart className="w-6 h-6 text-emerald-400" /> Explore StockPro
            </a>
          </div>
        </section>

        {/* EduPro Section */}
        <section id="edupro" className="scroll-mt-32 mb-32">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <div className="inline-flex items-center gap-2 text-accent-400 font-bold tracking-widest uppercase text-sm mb-4">
                <GraduationCap className="w-5 h-5" /> Education Platform
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-headline mb-6">Language Intelligence.</h2>
              <p className="text-lg text-slate-400 mb-8">
                Accelerate your fluency with AI-driven conversations, spaced repetition flashcards, and culturally deep curriculums.
              </p>
              <div className="space-y-6">
                {eduFeatures.map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400">
                      <f.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{f.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/20 blur-[80px] rounded-full"></div>
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="font-headline font-bold text-2xl">Advanced Spanish</h3>
                  <span className="px-4 py-2 rounded-xl bg-accent-500/20 text-accent-400 font-bold border border-accent-500/30">In Progress</span>
                </div>
                <div className="h-4 w-full bg-black/40 rounded-full mb-8 relative overflow-hidden z-10 p-1 border border-white/5">
                  <div className="h-full bg-gradient-to-r from-accent-500 to-fuchsia-500 rounded-full w-[64%] shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Cards Mastered</p>
                    <p className="text-3xl font-black font-mono">1,284</p>
                  </div>
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Quiz Avg</p>
                    <p className="text-3xl font-black font-mono text-emerald-400">88%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* StockPro Section */}
        <section id="stockpro" className="scroll-mt-32 mb-32">
          <div className="flex flex-col-reverse md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full"></div>
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="font-headline font-bold text-2xl">VN30 Realtime</h3>
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live
                  </span>
                </div>
                
                <div className="bg-black/20 rounded-2xl border border-white/5 p-6 mb-6 relative z-10 h-32 flex items-end">
                   <svg viewBox="0 0 320 120" role="img" aria-label="Chart" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="chartG" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                    </defs>
                    <path d="M0 100 C40 80 80 110 120 70 C160 30 200 90 240 40 C270 20 300 50 320 10" fill="none" stroke="url(#chartG)" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">VNIndex</p>
                    <p className="text-2xl font-black font-mono">1,248.6 <span className="text-sm text-emerald-400 ml-1">▲ 1.2%</span></p>
                  </div>
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Volume</p>
                    <p className="text-2xl font-black font-mono">721M <span className="text-sm text-slate-400 ml-1">VND</span></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="inline-flex items-center gap-2 text-emerald-400 font-bold tracking-widest uppercase text-sm mb-4">
                <LineChart className="w-5 h-5" /> Financial Analytics
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-headline mb-6">Quant-grade Trading.</h2>
              <p className="text-lg text-slate-400 mb-8">
                Harness modern portfolio theory, advanced screening, and deep backtesting designed exclusively for the Vietnamese market.
              </p>
              <div className="space-y-6">
                {stockFeatures.map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <f.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{f.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="text-center py-20 border-t border-white/10">
          <h2 className="text-4xl font-black font-headline mb-6">Ready to transcend your limits?</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join the Nexus platform today to get full access to both EduPro's language intelligence and StockPro's robust market analytics.
          </p>
          <Link to="/register" className="inline-block px-12 py-5 rounded-full bg-white text-slate-900 font-black text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Create Free Account
          </Link>
        </section>
      </main>
      
      <footer className="border-t border-white/5 py-12 text-center text-slate-500 relative z-10 backdrop-blur-sm bg-slate-900/50">
        <p className="font-headline font-bold text-xl mb-2 text-slate-300">Nexus Platform</p>
        <p>© {new Date().getFullYear()} Nexus. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
