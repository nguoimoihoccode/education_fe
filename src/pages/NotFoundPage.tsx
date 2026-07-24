import { Link } from 'react-router-dom';
import { Home, ArrowLeft, RefreshCcw } from 'lucide-react';
import './Education.css';

export default function NotFoundPage() {
  return (
    <div className="education-container education-path-page" style={{ color: 'var(--app-text)' }}>
      <div className="dashboard-wrapper">
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center relative">
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent-600/6 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-rose-600/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            {/* Glitch-style 404 number */}
            <div className="relative mb-8">
              <h1 className="text-[12rem] md:text-[16rem] font-black font-mono leading-none text-transparent bg-gradient-to-br from-accent-500/20 via-fuchsia-500/15 to-rose-500/20 bg-clip-text select-none">
                404
              </h1>
              {/* Overlay with glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl md:text-8xl font-black font-mono text-white/90 drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                  404
                </span>
              </div>
            </div>

            {/* Error message */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-3">
                Page Not Found
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                Oops! The page you're looking for doesn't exist or has been moved.
                <br />
                Let's get you back on track.
              </p>
            </div>

            {/* Illustration */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-800/60 backdrop-blur-md border border-white/10">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <code className="text-xs font-mono text-slate-400">
                  Error: <span className="text-rose-400">ROUTE_NOT_FOUND</span> — This path does not match any route
                </code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/"
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/10 hover:text-white transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry
              </button>
            </div>

            {/* Helpful Links */}
            <div className="mt-14">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">
                Popular destinations
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: 'Dashboard', to: '/education' },
                  { label: 'Flashcards', to: '/flashcards' },
                  { label: 'AI Tutor', to: '/ai-tutor' },
                  { label: 'Quiz Center', to: '/quiz' },
                  { label: 'Community', to: '/community' },
                  { label: 'Leaderboard', to: '/leaderboard' },
                  { label: 'Settings', to: '/settings' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
