import React from 'react';
import {
  BookOpen,
  TrendingUp,
  Flame,
  Award,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react';
import type { FlashcardStats, DeckStats } from '@/types/flashcard.types';
import clsx from 'clsx';

interface FlashcardStatsProps {
  stats: FlashcardStats;
  deckStats?: DeckStats[];
  className?: string;
}

export function FlashcardStats({ stats, deckStats, className }: FlashcardStatsProps) {
  const accuracy = stats.totalReviews > 0
    ? Math.round((stats.masteredFlashcards / stats.totalReviews) * 100)
    : 0;

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          value={stats.totalFlashcards}
          label="Total Cards"
          color="indigo"
        />
        <StatCard
          icon={Target}
          value={stats.dueFlashcards}
          label="Due Today"
          color="orange"
        />
        <StatCard
          icon={CheckCircle}
          value={stats.masteredFlashcards}
          label="Mastered"
          color="green"
        />
        <StatCard
          icon={Flame}
          value={stats.currentStreak}
          label="Day Streak"
          color="red"
        />
      </div>

      {/* Learning Progress */}
      <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h3 className="text-xl font-bold font-headline text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-accent-400" />
          Learning Progress
        </h3>

        <div className="space-y-6">
          <ProgressBar
            label="New Cards"
            current={stats.newFlashcards}
            total={stats.totalFlashcards}
            color="bg-blue-500"
          />
          <ProgressBar
            label="Learning"
            current={stats.learningFlashcards}
            total={stats.totalFlashcards}
            color="bg-amber-500"
          />
          <ProgressBar
            label="Reviewing"
            current={stats.learningFlashcards}
            total={stats.totalFlashcards}
            color="bg-accent-500"
          />
          <ProgressBar
            label="Mastered"
            current={stats.masteredFlashcards}
            total={stats.totalFlashcards}
            color="bg-emerald-500"
          />
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h3 className="text-xl font-bold font-headline text-white mb-6 flex items-center gap-3">
          <Award className="w-6 h-6 text-accent-400" />
          Performance
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-black/20 rounded-2xl border border-white/5">
            <div className="text-3xl font-black font-mono text-white">{stats.totalReviews}</div>
            <div className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Reviews</div>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-2xl border border-white/5">
            <div className="text-3xl font-black font-mono text-emerald-400">{accuracy}%</div>
            <div className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Accuracy</div>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-2xl border border-white/5">
            <div className="text-3xl font-black font-mono text-accent-400">{stats.longestStreak}</div>
            <div className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Best Streak</div>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-2xl border border-white/5">
            <div className="text-3xl font-black font-mono text-amber-400">{stats.totalXp}</div>
            <div className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Total XP</div>
          </div>
        </div>
      </div>

      {/* Deck Stats */}
      {deckStats && deckStats.length > 0 && (
        <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h3 className="text-xl font-bold font-headline text-white mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-accent-400" />
            Deck Performance
          </h3>

          <div className="space-y-4">
            {deckStats.map((deck) => (
              <div
                key={deck.deckId}
                className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-black/20 hover:bg-white/5 transition-colors border border-white/5 gap-4"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-white">{deck.deckName}</h4>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400 font-bold">
                    <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-xs tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      {deck.totalCards} CARDS
                    </span>
                    <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-xs tracking-wider">
                      <Target className="w-4 h-4 text-accent-400" />
                      {deck.dueCards} DUE
                    </span>
                    <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs tracking-wider">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      {deck.masteredCards} MASTERED
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    {deck.averageAccuracy}%
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Accuracy</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: any;
  value: number;
  label: string;
  color: string;
}) {
  const colorConfigs = {
    indigo: { text: 'text-accent-400', glow: 'bg-accent-500/10 group-hover:bg-accent-500/20' },
    blue: { text: 'text-blue-400', glow: 'bg-blue-500/10 group-hover:bg-blue-500/20' },
    green: { text: 'text-emerald-400', glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20' },
    orange: { text: 'text-orange-400', glow: 'bg-orange-500/10 group-hover:bg-orange-500/20' },
    red: { text: 'text-red-400', glow: 'bg-red-500/10 group-hover:bg-red-500/20' },
    purple: { text: 'text-accent-400', glow: 'bg-accent-500/10 group-hover:bg-accent-500/20' }
  };
  const config = colorConfigs[color as keyof typeof colorConfigs] || colorConfigs.indigo;

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1 hover:border-accent-500/30 hover:shadow-2xl transition-all duration-300">
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] transition-colors duration-500 ${config.glow}`}></div>
      <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">{label}</p>
      <div className={`text-4xl font-black font-mono mt-2 ${config.text}`}>
        {value}
      </div>
      <div className={`mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold ${config.text}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  current,
  total,
  color,
}: {
  label: string;
  current: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-white">{label}</span>
        <span className="text-sm font-black text-slate-300">
          {current} / {total}
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className={clsx('h-full transition-all duration-1000 ease-out relative', color)}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 blur-[2px]"></div>
        </div>
      </div>
    </div>
  );
}
