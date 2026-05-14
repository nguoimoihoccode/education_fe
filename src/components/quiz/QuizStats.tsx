import React from 'react';
import {
  BookOpen,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Eye,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { QuizStats as QuizStatsType, TopicStats } from '@/types/quiz.types';
import clsx from 'clsx';

interface QuizStatsProps {
  stats: QuizStatsType;
  topicStats?: TopicStats[];
  className?: string;
}

export function QuizStats({ stats, topicStats, className }: QuizStatsProps) {
  const passRate = stats.totalQuizzes > 0 ? Math.round((stats.passedQuizzes / stats.totalQuizzes) * 100) : 0;
  const completionRate = stats.totalAttempts > 0 ? Math.round((stats.completedQuizzes / stats.totalAttempts) * 100) : 0;

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          value={stats.totalQuizzes}
          label="Total Quizzes"
          color="violet"
        />
        <StatCard
          icon={Target}
          value={stats.totalAttempts}
          label="Total Attempts"
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          value={stats.passedQuizzes}
          label="Passed Quizzes"
          subtext={`${passRate}% pass rate`}
          color="green"
        />
        <StatCard
          icon={Clock}
          value={stats.completedQuizzes}
          label="Completed"
          subtext={`${completionRate}% completion`}
          color="amber"
        />
      </div>

      {/* Performance Metrics */}
      <div className="glass-pane rounded-2xl p-6 md:p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-accent-400" />
          Performance Overview
        </h3>

        <div className="space-y-6">
          <ProgressBar
            label="Average Score"
            current={stats.averageScore}
            max={100}
            unit="%"
            color="bg-accent-500"
          />
          <ProgressBar
            label="Highest Score"
            current={stats.highestScore}
            max={100}
            unit="%"
            color="bg-emerald-500"
          />
          <div className="flex items-center justify-between text-sm text-slate-300 pt-4 border-t border-white/5">
            <span>Lowest Score: <strong className="text-white">{stats.lowestScore}%</strong></span>
            <span>Avg Time/Question: <strong className="text-white">{formatTime(stats.averageTimePerQuestion)}</strong></span>
          </div>
        </div>
      </div>

      {/* Topics Performance */}
      {topicStats && topicStats.length > 0 && (
        <div className="glass-pane rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Eye className="w-6 h-6 text-emerald-400" />
            Topics Performance
          </h3>

          <div className="space-y-4">
            {topicStats.map((topic) => (
              <div
                key={topic.topic}
                className="p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                  <h4 className="font-bold text-white">{topic.topic}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-300">{topic.totalAttempts} attempts</span>
                    <span className="font-black text-emerald-400 text-lg">{Math.round(topic.averageScore)}% avg</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {topic.favoriteQuestionTypes?.slice(0, 3).map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/10 text-slate-300 uppercase tracking-widest"
                    >
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {(topic.strengths?.length > 0 || topic.weaknesses?.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {topic.strengths?.map((strength, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        ✓ {strength}
                      </span>
                    ))}
                    {topic.weaknesses?.map((weakness, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      >
                        ✗ {weakness}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watched Topics */}
      {stats.watchedTopics && stats.watchedTopics.length > 0 && (
        <div className="glass-pane rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-accent-400" />
            Topics Explored
          </h3>
          <div className="flex flex-wrap gap-3">
            {stats.watchedTopics.map((topic) => (
              <span
                key={topic}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-accent-600/20 text-accent-300 border border-accent-500/30"
              >
                {topic}
              </span>
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
  subtext,
  color,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  subtext?: string;
  color: string;
}) {
  const colorConfigs = {
    violet: { text: 'text-accent-400', glow: 'bg-accent-500/10 group-hover:bg-accent-500/20' },
    blue: { text: 'text-blue-400', glow: 'bg-blue-500/10 group-hover:bg-blue-500/20' },
    green: { text: 'text-emerald-400', glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20' },
    amber: { text: 'text-orange-400', glow: 'bg-orange-500/10 group-hover:bg-orange-500/20' },
    red: { text: 'text-red-400', glow: 'bg-red-500/10 group-hover:bg-red-500/20' }
  };
  const config = colorConfigs[color as keyof typeof colorConfigs] || colorConfigs.violet;

  return (
    <div className="glass-pane p-6 md:p-8 rounded-2xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,255,255,0.02)]">
      <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
      <h3 className={`text-4xl font-black ${config.text}`}>{value}</h3>
      {subtext && (
        <div className={`mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold ${config.text}`}>
          <Icon className="w-4 h-4" />
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({
  label,
  current,
  max,
  unit = '%',
  color,
}: {
  label: string;
  current: number;
  max: number;
  unit?: string;
  color: string;
}) {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-white">{label}</span>
        <span className="text-sm font-black text-slate-300">
          {current} {unit}
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className={clsx('h-full relative', color)}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
