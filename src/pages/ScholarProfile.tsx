import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Globe,
  BookOpen,
  Trophy,
  Flame,
  Star,
  Target,
  Calendar,
  BarChart2,
  Award,
  Clock,
  Users,
  MessageSquare,
  Share2,
  ExternalLink,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  ChevronRight,
  Zap,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/api/client';
import './Education.css';

/* ================================================================ */

interface ScholarData {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  location: string;
  occupation: string;
  joinedDate: string;
  badge: string;
  level: number;
  xp: number;
  streak: number;
  maxStreak: number;
  coursesCompleted: number;
  lessonsFinished: number;
  quizzesPassed: number;
  flashcardsReviewed: number;
  hoursStudied: number;
  certificates: number;
  followers: number;
  following: number;
  contributions: number;
  languages: { name: string; flag: string; level: string }[];
  achievements: { icon: string; title: string; date: string }[];
  recentActivity: { action: string; detail: string; time: string }[];
  publicDecks: { title: string; cards: number; downloads: number; rating: number }[];
}

const getScholarProfile = async (username: string): Promise<ScholarData> => {
  const response = await apiClient.get(`/education/scholars/${username}`);
  return response.data;
};

export default function ScholarProfile() {
  const { username } = useParams<{ username: string }>();

  const { data: scholar, isLoading, error } = useQuery({
    queryKey: ['scholarProfile', username],
    queryFn: () => getScholarProfile(username!),
    enabled: !!username,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="education-container">
        <div className="dashboard-wrapper flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-accent-500" />
        </div>
      </div>
    );
  }

  if (error || !scholar) {
    return (
      <div className="education-container">
        <div className="dashboard-wrapper text-center py-20">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Profile Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">The scholar profile for @{username} could not be loaded.</p>
          <Link to="/social" className="px-6 py-3 rounded-full bg-accent-600 text-white font-bold text-sm hover:bg-accent-700 transition-all">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        {/* ============ HERO / PROFILE HEADER ============ */}
        <div className="relative mb-8">
          {/* Banner gradient */}
          <div className="h-40 rounded-t-3xl bg-gradient-to-r from-accent-900/60 via-fuchsia-900/40 to-indigo-900/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-40" />
          </div>

          {/* Profile card overlapping banner */}
          <div className="relative -mt-16 px-8">
            <div className="bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-5xl font-black shadow-[0_0_40px_rgba(245,158,11,0.15)] border-4 border-slate-900">
                    {scholar.displayName.charAt(0)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-2xl font-black font-headline text-white">{scholar.displayName}</h1>
                    <span className="text-xl">{scholar.badge}</span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-accent-500/10 text-accent-400 border border-accent-500/20">
                      LVL {scholar.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold mb-3">@{scholar.username}</p>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4 max-w-lg">{scholar.bio}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{scholar.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{scholar.occupation}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {scholar.joinedDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
                    <Heart className="w-4 h-4" /> Follow
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>

              {/* Social stats */}
              <div className="flex gap-8 mt-6 pt-6 border-t border-white/5">
                <div><span className="text-lg font-black font-mono text-white">{scholar.followers.toLocaleString()}</span> <span className="text-xs text-slate-500 font-bold">Followers</span></div>
                <div><span className="text-lg font-black font-mono text-white">{scholar.following}</span> <span className="text-xs text-slate-500 font-bold">Following</span></div>
                <div><span className="text-lg font-black font-mono text-white">{scholar.contributions}</span> <span className="text-xs text-slate-500 font-bold">Contributions</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ============ LEFT COLUMN ============ */}
          <div className="lg:col-span-8 space-y-6">
            {/* Learning Stats Grid */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black font-headline text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Learning Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniStat value={scholar.xp.toLocaleString()} label="Total XP" color="violet" icon={Zap} />
                <MiniStat value={`${scholar.streak}d`} label="Current Streak" color="amber" icon={Flame} />
                <MiniStat value={scholar.coursesCompleted.toString()} label="Courses Done" color="emerald" icon={BookOpen} />
                <MiniStat value={`${scholar.quizzesPassed}`} label="Quizzes Passed" color="fuchsia" icon={Target} />
                <MiniStat value={`${scholar.hoursStudied}h`} label="Study Hours" color="blue" icon={Clock} />
                <MiniStat value={scholar.flashcardsReviewed.toLocaleString()} label="Cards Reviewed" color="orange" icon={BookOpen} />
                <MiniStat value={scholar.certificates.toString()} label="Certificates" color="emerald" icon={Award} />
                <MiniStat value={`${scholar.maxStreak}d`} label="Best Streak" color="amber" icon={Trophy} />
              </div>
            </div>

            {/* Public Decks */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black font-headline text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-400" />
                Public Flashcard Decks
              </h3>
              <div className="space-y-3">
                {scholar.publicDecks.map((deck, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/[0.03] hover:bg-white/[0.02] transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-indigo-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{deck.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{deck.cards} cards • {deck.downloads.toLocaleString()} downloads</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-bold flex-shrink-0">
                      <Star className="w-3 h-3 fill-current" />{deck.rating}
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-accent-600 hover:border-accent-600 transition-all flex-shrink-0">
                      Get
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black font-headline text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Recent Activity
              </h3>
              <div className="space-y-0 divide-y divide-white/[0.04]">
                {scholar.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 py-4">
                    <div className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">
                        <span className="font-bold text-white">{activity.action}</span> {activity.detail}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-600 font-bold flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ RIGHT COLUMN ============ */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Languages */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black font-headline text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Languages
              </h3>
              <div className="space-y-3">
                {scholar.languages.map((lang, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/[0.03]">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{lang.name}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${
                      lang.level === 'Advanced' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : lang.level === 'Intermediate' ? 'bg-accent-500/10 text-accent-400 border-accent-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black font-headline text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Achievements
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {scholar.achievements.map((ach, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-black/20 border border-white/[0.03] hover:bg-white/[0.02] transition-all" title={ach.title}>
                    <span className="text-2xl">{ach.icon}</span>
                    <p className="text-[9px] text-slate-400 font-bold text-center leading-tight truncate w-full">{ach.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ============ Sub-components ============ */

function MiniStat({ value, label, color, icon: Icon }: { value: string; label: string; color: string; icon: any }) {
  const colorMap: Record<string, string> = {
    violet: 'text-accent-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    fuchsia: 'text-fuchsia-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
  };
  return (
    <div className="p-3 rounded-xl bg-black/20 border border-white/[0.03] text-center">
      <div className={`text-lg font-black font-mono ${colorMap[color] || 'text-white'}`}>{value}</div>
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}
