import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  BookOpen,
  Target,
  Search,
  Zap,
  Award,
  Timer,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import {
  getLeaderboard,
  getGlobalStats,
  getCurrentUserRank,
} from '@/api/leaderboard.api';
import type { LeaderboardUser } from '@/api/leaderboard.api';
import './Education.css';

/* ============ Constants ============ */

const TIME_FILTERS = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

const CATEGORY_FILTERS = [
  { id: 'xp', label: 'Total XP', icon: Zap },
  { id: 'streak', label: 'Streak', icon: Flame },
  { id: 'lessons', label: 'Lessons', icon: BookOpen },
  { id: 'quiz', label: 'Quiz Score', icon: Target },
];

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState('week');
  const [categoryFilter, setCategoryFilter] = useState('xp');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch leaderboard from API
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['leaderboard', timeFilter, categoryFilter],
    queryFn: () =>
      getLeaderboard({
        period: timeFilter as 'week' | 'month' | 'all',
        category: categoryFilter as 'xp' | 'streak' | 'lessons' | 'quiz',
        limit: 50,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch global stats
  const { data: globalStats } = useQuery({
    queryKey: ['leaderboardGlobalStats'],
    queryFn: getGlobalStats,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch current user rank
  const { data: currentUserRank } = useQuery({
    queryKey: ['leaderboardMyRank'],
    queryFn: getCurrentUserRank,
    staleTime: 1000 * 60 * 2,
  });

  const leaderboardUsers = leaderboardData?.data || [];

  const filteredUsers = leaderboardUsers.filter((u) =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Current user display (from API or fallback)
  const myRank: LeaderboardUser = currentUserRank || {
    id: 'me',
    rank: 0,
    displayName: user?.displayName || 'You',
    xp: 0,
    streak: 0,
    lessonsCompleted: 0,
    quizScore: 0,
    level: 1,
    badge: 'streak',
    change: 'same' as const,
    changeAmount: 0,
  };

  const getValueForCategory = (leaderUser: LeaderboardUser) => {
    switch (categoryFilter) {
      case 'streak': return leaderUser.streak;
      case 'lessons': return leaderUser.lessonsCompleted;
      case 'quiz': return leaderUser.quizScore;
      default: return leaderUser.xp;
    }
  };

  const getSuffix = () => {
    switch (categoryFilter) {
      case 'streak': return ' days';
      case 'quiz': return '%';
      default: return '';
    }
  };

  const formatStatValue = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        {/* ============ Header ============ */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            Leaderboard
          </h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
            Compete with learners worldwide
          </p>
        </header>

        {/* ============ Top 3 Podium ============ */}
        {isLoadingLeaderboard ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-accent-500" />
          </div>
        ) : filteredUsers.length >= 3 ? (
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-8">
              <PodiumCard user={filteredUsers[1]} place={2} categoryFilter={categoryFilter} getValueForCategory={getValueForCategory} getSuffix={getSuffix} />
            </div>
            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <PodiumCard user={filteredUsers[0]} place={1} categoryFilter={categoryFilter} getValueForCategory={getValueForCategory} getSuffix={getSuffix} />
            </div>
            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-12">
              <PodiumCard user={filteredUsers[2]} place={3} categoryFilter={categoryFilter} getValueForCategory={getValueForCategory} getSuffix={getSuffix} />
            </div>
          </div>
        ) : (
          <div className="text-center py-16 mb-8">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Chưa có xếp hạng</h3>
            <p className="text-slate-400 text-sm mb-5">Bắt đầu học để xuất hiện trên bảng xếp hạng!</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/education"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-600 text-white text-sm font-bold hover:bg-accent-500 transition-all"
              >
                Bắt đầu học
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all"
              >
                Làm quiz
              </Link>
            </div>
          </div>
        )}

        {/* ============ Your Rank Card ============ */}
        {myRank.rank > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-accent-900/30 via-fuchsia-900/20 to-accent-900/30 backdrop-blur-md border border-accent-500/20 rounded-3xl shadow-[0_0_30px_rgba(139,92,246,0.08)]">
            <div className="flex items-center gap-5">
              <div className="text-3xl font-black font-mono text-accent-400">#{myRank.rank}</div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-600 to-fuchsia-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
                {myRank.displayName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-white">{myRank.displayName}</p>
                  <Flame className="h-4 w-4 text-orange-400" aria-label={myRank.badge} />
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase bg-accent-500/20 text-accent-400 border border-accent-500/20">
                    You
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold inline-flex items-center gap-1.5">Level {myRank.level} • {myRank.streak} day streak <Flame className="h-3 w-3 text-orange-400" /></p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-white">
                  {getValueForCategory(myRank).toLocaleString()}{getSuffix()}
                </div>
                <RankChange change={myRank.change} amount={myRank.changeAmount} />
              </div>
            </div>
          </div>
        )}

        {/* ============ Filters ============ */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Time Filter */}
          <div className="flex gap-2 p-1.5 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/5">
            {TIME_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  timeFilter === f.id
                    ? 'bg-accent-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 p-1.5 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/5">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search learners..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-800/60 border border-white/5 text-white text-sm placeholder-slate-500 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* ============ Leaderboard Table ============ */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Learner</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-center">Streak</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-1 text-right">Change</div>
          </div>

          {/* Loading State */}
          {isLoadingLeaderboard && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
          )}

          {/* Empty State */}
          {!isLoadingLeaderboard && filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">Không tìm thấy học viên</p>
              <p className="text-slate-500 text-sm mt-1 mb-4">Thử từ khóa khác hoặc xóa bộ lọc</p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          )}

          {/* Table Rows */}
          {filteredUsers.map((leaderUser, i) => {
            const isCurrentUser = leaderUser.id === user?.id?.toString();
            return (
              <div
                key={leaderUser.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/[0.03] hover:bg-white/[0.02] transition-all ${
                  isCurrentUser ? 'bg-accent-600/5 border-l-2 border-l-violet-500' : ''
                } ${i < 3 ? 'bg-amber-500/[0.02]' : ''}`}
              >
                {/* Rank */}
                <div className="col-span-1">
                  {leaderUser.rank <= 3 ? (
                    <span className="text-xl">{leaderUser.rank === 1 ? '🥇' : leaderUser.rank === 2 ? '🥈' : '🥉'}</span>
                  ) : (
                    <span className="text-lg font-black font-mono text-slate-400">#{leaderUser.rank}</span>
                  )}
                </div>

                {/* User */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md ${
                    leaderUser.rank === 1 ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                    : leaderUser.rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                    : leaderUser.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-800'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                  }`}>
                    {leaderUser.avatar ? (
                      <img src={leaderUser.avatar} alt={leaderUser.displayName} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      leaderUser.displayName.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      {leaderUser.displayName}
                      {isCurrentUser && <span className="text-[9px] font-bold text-accent-400 tracking-widest uppercase">(You)</span>}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">{leaderUser.badge} {leaderUser.lessonsCompleted} lessons</p>
                  </div>
                </div>

                {/* Level */}
                <div className="col-span-2 text-center">
                  <span className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-accent-500/10 text-accent-400 border border-accent-500/20">
                    LVL {leaderUser.level}
                  </span>
                </div>

                {/* Streak */}
                <div className="col-span-2 text-center">
                  <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    {leaderUser.streak}d
                  </span>
                </div>

                {/* Score */}
                <div className="col-span-2 text-right">
                  <span className="text-lg font-black font-mono text-white">
                    {getValueForCategory(leaderUser).toLocaleString()}{getSuffix()}
                  </span>
                </div>

                {/* Change */}
                <div className="col-span-1 text-right">
                  <RankChange change={leaderUser.change} amount={leaderUser.changeAmount} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          <GlobalStat icon={Zap} value={formatStatValue(globalStats?.totalXp || 0)} label="Total XP Earned" color="violet" />
          <GlobalStat icon={BookOpen} value={formatStatValue(globalStats?.totalLessons || 0)} label="Lessons Completed" color="emerald" />
          <GlobalStat icon={Target} value={formatStatValue(globalStats?.totalQuizzesPassed || 0)} label="Quizzes Passed" color="amber" />
          <GlobalStat icon={Timer} value={formatStatValue(globalStats?.totalHoursStudied || 0)} label="Hours Studied" color="fuchsia" />
        </div>
      </div>
    </div>
  );
}

/* ============ Sub-components ============ */

function PodiumCard({
  user: leaderUser,
  place,
  getValueForCategory,
  getSuffix,
}: {
  user: LeaderboardUser;
  place: number;
  categoryFilter: string;
  getValueForCategory: (u: LeaderboardUser) => number;
  getSuffix: () => string;
}) {
  const colors = place === 1
    ? 'from-amber-500 to-orange-600 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
    : place === 2
    ? 'from-slate-400 to-slate-500 shadow-[0_0_30px_rgba(148,163,184,0.15)]'
    : 'from-amber-700 to-amber-900 shadow-[0_0_25px_rgba(180,83,9,0.15)]';

  const sizes = place === 1
    ? 'w-20 h-20 text-3xl'
    : 'w-16 h-16 text-2xl';

  const crownIcon = place === 1 ? Crown : place === 2 ? Medal : Award;
  const CrownIcon = crownIcon;

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-3">
        {place === 1 && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
            <CrownIcon className="w-8 h-8 text-amber-400 drop-shadow-lg" />
          </div>
        )}
        <div className={`${sizes} rounded-2xl bg-gradient-to-br ${colors} flex items-center justify-center text-white font-black`}>
          {leaderUser.avatar ? (
            <img src={leaderUser.avatar} alt={leaderUser.displayName} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            leaderUser.displayName.charAt(0)
          )}
        </div>
      </div>
      <p className="text-sm font-bold text-white text-center truncate max-w-[120px]">{leaderUser.displayName}</p>
      <p className="text-xs text-slate-400 font-bold mb-2">Level {leaderUser.level}</p>
      <div className="px-3 py-1.5 rounded-xl bg-black/30 border border-white/5">
        <span className="text-sm font-black font-mono text-white">
          {getValueForCategory(leaderUser).toLocaleString()}{getSuffix()}
        </span>
      </div>
    </div>
  );
}

function RankChange({ change, amount }: { change: 'up' | 'down' | 'same'; amount: number }) {
  if (change === 'same' || amount === 0) {
    return <span className="text-xs text-slate-600 flex items-center justify-end gap-0.5"><Minus className="w-3 h-3" /></span>;
  }
  if (change === 'up') {
    return (
      <span className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-0.5">
        <ArrowUp className="w-3 h-3" />{amount}
      </span>
    );
  }
  return (
    <span className="text-xs text-rose-400 font-bold flex items-center justify-end gap-0.5">
      <ArrowDown className="w-3 h-3" />{amount}
    </span>
  );
}

function GlobalStat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  color: 'violet' | 'emerald' | 'amber' | 'fuchsia';
}) {
  const colorMap = {
    violet: { bg: 'bg-accent-500/10', text: 'text-accent-400', gradient: 'from-accent-500 to-indigo-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', gradient: 'from-amber-500 to-orange-500' },
    fuchsia: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', gradient: 'from-fuchsia-500 to-pink-500' },
  };
  const c = colorMap[color];

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-center">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mx-auto mb-3 shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`text-2xl font-black font-mono ${c.text}`}>{value}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
