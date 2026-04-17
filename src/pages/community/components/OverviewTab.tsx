import { Link } from 'react-router-dom';
import {
  Users, MessageSquare, BookOpen, Calendar, Flame,
  ChevronRight, ArrowRight, Clock, Trophy, Eye, Heart,
  Award, Loader2,
} from 'lucide-react';
import type { StudyGroup, CommunityEvent, ForumThread, TopMember } from '@/api/community.api';
import { GroupCard, QuickStat, EmptyState } from './SharedComponents';
import { eventTypeConfig, formatStatValue } from './constants';

interface OverviewTabProps {
  stats: { totalMembers: number; totalDiscussions: number; totalResources: number; eventsThisMonth: number };
  groups: StudyGroup[];
  events: CommunityEvent[];
  threads: ForumThread[];
  topMembers: TopMember[];
  isLoadingGroups: boolean;
  isLoadingEvents: boolean;
  isLoadingThreads: boolean;
  toggleJoinGroup: (id: string, isJoined: boolean) => void;
  toggleRegisterEvent: (id: string, isRegistered: boolean) => void;
  setActiveTab: (tab: any) => void;
}

export default function OverviewTab({
  stats, groups, events, threads, topMembers,
  isLoadingGroups, isLoadingEvents, isLoadingThreads,
  toggleJoinGroup, toggleRegisterEvent, setActiveTab,
}: OverviewTabProps) {
  return (
    <div className="space-y-10">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat icon={Users} value={formatStatValue(stats.totalMembers)} label="Members" color="emerald" />
        <QuickStat icon={MessageSquare} value={formatStatValue(stats.totalDiscussions)} label="Discussions" color="violet" />
        <QuickStat icon={BookOpen} value={formatStatValue(stats.totalResources)} label="Resources" color="amber" />
        <QuickStat icon={Calendar} value={stats.eventsThisMonth.toString()} label="Events This Month" color="fuchsia" />
      </div>

      {/* Active Challenge */}
      {events.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-amber-900/30 backdrop-blur-md border border-amber-500/20 rounded-3xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl flex-shrink-0">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">🔥 Active Challenge</span>
              </div>
              <h3 className="text-xl font-black font-headline text-white mb-1">{events[0].title}</h3>
              <p className="text-sm text-slate-400 mb-2">{events[0].description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{events[0].date}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{events[0].participants.toLocaleString()} joined</span>
                {events[0].reward && <span className="flex items-center gap-1"><Trophy className="w-3 h-3" />{events[0].reward}</span>}
              </div>
            </div>
            <button
              onClick={() => toggleRegisterEvent(events[0].id, events[0].isRegistered)}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all flex-shrink-0 ${
                events[0].isRegistered
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.02]'
              }`}
            >
              {events[0].isRegistered ? '✓ Joined' : 'Join Challenge'}
            </button>
          </div>
        </div>
      )}

      {/* Study Groups preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black font-headline text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-400" /> Popular Study Groups
          </h2>
          <button onClick={() => setActiveTab('groups')} className="text-xs font-bold text-accent-400 hover:text-accent-300 flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {isLoadingGroups ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-accent-500" /></div>
        ) : groups.length === 0 ? (
          <EmptyState icon={Users} message="No study groups yet" sub="Be the first to create one!" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.slice(0, 3).map((group) => (
              <GroupCard key={group.id} group={group} onToggle={() => toggleJoinGroup(group.id, group.isJoined)} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black font-headline text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> Upcoming Events
          </h2>
          <button onClick={() => setActiveTab('events')} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {isLoadingEvents ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : events.length <= 1 ? (
          <EmptyState icon={Calendar} message="No upcoming events" sub="Check back later!" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.slice(1, 3).map((event) => {
              const cfg = eventTypeConfig[event.type] || eventTypeConfig.challenge;
              const Ico = cfg.icon;
              return (
                <div key={event.id} className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${cfg.bg} border flex items-center justify-center flex-shrink-0`}>
                      <Ico className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-bold tracking-widest uppercase ${cfg.color}`}>{cfg.label}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5 truncate">{event.title}</h4>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-bold">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.date} • {event.time}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Forum + Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black font-headline text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" /> Hot Discussions
            </h2>
            <button onClick={() => setActiveTab('forum')} className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {isLoadingThreads ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
          ) : threads.length === 0 ? (
            <EmptyState icon={MessageSquare} message="No discussions yet" sub="Start a conversation!" />
          ) : (
            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
              {threads.slice(0, 3).map((thread, i) => (
                <button key={thread.id} className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-all ${i < 2 ? 'border-b border-white/[0.03]' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {thread.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate flex items-center gap-2">
                      {thread.isPinned && <span className="text-amber-400">📌</span>}
                      {thread.isSolved && <span className="text-emerald-400">✅</span>}
                      {thread.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-bold">
                      <span>{thread.author} • LVL {thread.authorLevel}</span>
                      <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" />{thread.replies}</span>
                      <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{thread.views}</span>
                      <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{thread.likes}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <h2 className="text-lg font-black font-headline text-white flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-fuchsia-400" /> Top Contributors
          </h2>
          <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4">
            {topMembers.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-4">No data yet</p>
            ) : (
              topMembers.map((m, i) => (
                <div key={m.name} className="flex items-center gap-4">
                  <div className="text-lg font-black font-mono text-slate-500 w-6">#{i + 1}</div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                    i === 0 ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                    : i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                    : 'bg-gradient-to-br from-amber-700 to-amber-800'
                  }`}>
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">{m.name} <span>{m.badge}</span></p>
                    <p className="text-[10px] text-slate-500 font-bold">LVL {m.level} • {m.contributions} contributions</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-emerald-400">{m.xp.toLocaleString()}</span>
                    <p className="text-[9px] text-slate-600 font-bold tracking-widest uppercase">XP</p>
                  </div>
                </div>
              ))
            )}
            <Link to="/leaderboard" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all mt-2">
              Full Leaderboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
