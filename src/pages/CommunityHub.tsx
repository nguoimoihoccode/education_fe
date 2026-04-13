import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  Users,
  MessageSquare,
  BookOpen,
  Calendar,
  Flame,
  Trophy,
  Star,
  Target,
  Search,
  Plus,
  ChevronRight,
  ArrowRight,
  Clock,
  MapPin,
  Zap,
  TrendingUp,
  Heart,
  Eye,
  UserPlus,
  Shield,
  Award,
  Globe,
  Sparkles,
  Video,
  Mic,
  FileText,
  Hash,
  Lock,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import {
  getStudyGroups,
  getCommunityEvents,
  getForumThreads,
  getSharedResources,
  getTopMembers,
  getCommunityStats,
  joinGroup,
  leaveGroup,
  registerEvent,
  unregisterEvent,
} from '@/api/community.api';
import type {
  StudyGroup,
  CommunityEvent,
  ForumThread,
  SharedResource,
  TopMember,
} from '@/api/community.api';
import toast from 'react-hot-toast';
import './Education.css';

/* ================================================================
 * CONSTANTS
 * ================================================================ */

const TAB_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'groups', label: 'Study Groups', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'forum', label: 'Forum', icon: MessageSquare },
  { id: 'resources', label: 'Resources', icon: BookOpen },
] as const;

type TabId = typeof TAB_ITEMS[number]['id'];

/* ================================================================
 * MAIN COMPONENT
 * ================================================================ */

export default function CommunityHub() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // ==================== DATA FETCHING ====================

  const { data: statsData } = useQuery({
    queryKey: ['communityStats'],
    queryFn: getCommunityStats,
    staleTime: 1000 * 60 * 5,
  });

  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['studyGroups'],
    queryFn: () => getStudyGroups({ limit: 20 }),
    staleTime: 1000 * 60 * 2,
  });

  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['communityEvents'],
    queryFn: () => getCommunityEvents({ limit: 20 }),
    staleTime: 1000 * 60 * 2,
  });

  const { data: threadsData, isLoading: isLoadingThreads } = useQuery({
    queryKey: ['forumThreads'],
    queryFn: () => getForumThreads({ limit: 20 }),
    staleTime: 1000 * 60 * 2,
    enabled: activeTab === 'overview' || activeTab === 'forum',
  });

  const { data: resourcesData, isLoading: isLoadingResources } = useQuery({
    queryKey: ['sharedResources'],
    queryFn: () => getSharedResources({ limit: 20 }),
    staleTime: 1000 * 60 * 2,
    enabled: activeTab === 'overview' || activeTab === 'resources',
  });

  const { data: topMembers = [] } = useQuery({
    queryKey: ['topMembers'],
    queryFn: () => getTopMembers(3),
    staleTime: 1000 * 60 * 5,
    enabled: activeTab === 'overview',
  });

  const groups = groupsData?.data || [];
  const events = eventsData?.data || [];
  const threads = threadsData?.data || [];
  const resources = resourcesData?.data || [];

  const stats = statsData || { totalMembers: 0, totalDiscussions: 0, totalResources: 0, eventsThisMonth: 0 };

  // ==================== MUTATIONS ====================

  const joinGroupMutation = useMutation({
    mutationFn: (groupId: string) => joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyGroups'] });
      toast.success('Joined group!');
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyGroups'] });
      toast.success('Left group');
    },
  });

  const registerEventMutation = useMutation({
    mutationFn: (eventId: string) => registerEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityEvents'] });
      toast.success('Registered for event!');
    },
  });

  const unregisterEventMutation = useMutation({
    mutationFn: (eventId: string) => unregisterEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityEvents'] });
    },
  });

  // ==================== HANDLERS ====================

  const toggleJoinGroup = (id: string, isJoined: boolean) => {
    if (isJoined) {
      leaveGroupMutation.mutate(id);
    } else {
      joinGroupMutation.mutate(id);
    }
  };

  const toggleRegisterEvent = (id: string, isRegistered: boolean) => {
    if (isRegistered) {
      unregisterEventMutation.mutate(id);
    } else {
      registerEventMutation.mutate(id);
    }
  };

  // ==================== CONFIG ====================

  const eventTypeConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    challenge: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Flame, label: 'Challenge' },
    workshop: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Lightbulb, label: 'Workshop' },
    live: { color: 'text-accent-400', bg: 'bg-accent-500/10 border-accent-500/20', icon: Video, label: 'Live' },
    contest: { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20', icon: Trophy, label: 'Contest' },
  };

  const resourceTypeConfig: Record<string, { icon: any; color: string }> = {
    deck: { icon: BookOpen, color: 'from-accent-500 to-indigo-500' },
    guide: { icon: FileText, color: 'from-emerald-500 to-teal-500' },
    notes: { icon: Lightbulb, color: 'from-amber-500 to-orange-500' },
    video: { icon: Video, color: 'from-fuchsia-500 to-pink-500' },
  };

  const formatStatValue = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  };

  // ==================== RENDER ====================

  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        {/* ============ HEADER ============ */}
        <div className="relative mb-8">
          <div className="absolute inset-0 -top-20 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/6 rounded-full blur-[120px]" />
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-accent-600/6 rounded-full blur-[100px]" />
          </div>
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-2 flex items-center gap-3">
              <Compass className="w-8 h-8 text-emerald-400" />
              Community Hub
            </h1>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
              Study groups • Events • Forum • Resources
            </p>
          </div>
        </div>

        {/* ============ TAB NAVIGATION ============ */}
        <div className="flex gap-2 mb-8 p-1.5 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============ OVERVIEW TAB ============ */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat icon={Users} value={formatStatValue(stats.totalMembers)} label="Members" color="emerald" />
              <QuickStat icon={MessageSquare} value={formatStatValue(stats.totalDiscussions)} label="Discussions" color="violet" />
              <QuickStat icon={BookOpen} value={formatStatValue(stats.totalResources)} label="Resources" color="amber" />
              <QuickStat icon={Calendar} value={stats.eventsThisMonth.toString()} label="Events This Month" color="fuchsia" />
            </div>

            {/* Active Challenge / Highlighted Event */}
            {events.length > 0 && (
              <div className="bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-amber-900/30 backdrop-blur-md border border-amber-500/20 rounded-3xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.06)]">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl flex-shrink-0">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        🔥 Active Challenge
                      </span>
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
                  <Users className="w-5 h-5 text-accent-400" />
                  Popular Study Groups
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
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Upcoming Events
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

            {/* Forum + Resources side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Hot Threads */}
              <div className="lg:col-span-7">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black font-headline text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    Hot Discussions
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

              {/* Top Contributors */}
              <div className="lg:col-span-5">
                <h2 className="text-lg font-black font-headline text-white flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-fuchsia-400" />
                  Top Contributors
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
                          <p className="text-sm font-bold text-white flex items-center gap-1.5">
                            {m.name} <span>{m.badge}</span>
                          </p>
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
        )}

        {/* ============ STUDY GROUPS TAB ============ */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            {/* Search + Create */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search study groups..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-800/60 border border-white/5 text-white text-sm placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="w-4 h-4" />
                Create Group
              </button>
            </div>

            {isLoadingGroups ? (
              <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>
            ) : groups.length === 0 ? (
              <EmptyState icon={Users} message="No study groups found" sub="Create the first study group!" />
            ) : (
              <>
                {/* Your Groups */}
                {groups.filter((g) => g.isJoined).length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Your Groups</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groups.filter((g) => g.isJoined).map((group) => (
                        <GroupCard key={group.id} group={group} onToggle={() => toggleJoinGroup(group.id, group.isJoined)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Discover Groups */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Discover Groups</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.filter((g) => !g.isJoined)
                      .filter((g) => !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.category.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((group) => (
                        <GroupCard key={group.id} group={group} onToggle={() => toggleJoinGroup(group.id, group.isJoined)} />
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============ EVENTS TAB ============ */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {isLoadingEvents ? (
              <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>
            ) : events.length === 0 ? (
              <EmptyState icon={Calendar} message="No events scheduled" sub="Check back soon for new events!" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map((event) => {
                  const cfg = eventTypeConfig[event.type] || eventTypeConfig.challenge;
                  const Ico = cfg.icon;
                  return (
                    <div key={event.id} className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-7 hover:border-white/20 hover:-translate-y-0.5 transition-all relative overflow-hidden group">
                      <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: event.type === 'challenge' ? 'rgba(245,158,11,0.08)' : event.type === 'workshop' ? 'rgba(16,185,129,0.08)' : event.type === 'live' ? 'rgba(139,92,246,0.08)' : 'rgba(232,121,249,0.08)' }} />
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl ${cfg.bg} border flex items-center justify-center flex-shrink-0`}>
                          <Ico className={`w-6 h-6 ${cfg.color}`} />
                        </div>
                        <div className="flex-1">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                          <h3 className="text-base font-bold text-white mt-2">{event.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-bold mb-5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.date} • {event.time}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.participants}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}</span>
                        <span className="flex items-center gap-1"><Mic className="w-3 h-3" />{event.host}</span>
                        {event.reward && <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-400" />{event.reward}</span>}
                      </div>
                      <button
                        onClick={() => toggleRegisterEvent(event.id, event.isRegistered)}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          event.isRegistered
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : `bg-gradient-to-r ${event.type === 'challenge' ? 'from-amber-500 to-orange-600' : event.type === 'workshop' ? 'from-emerald-600 to-teal-600' : event.type === 'live' ? 'from-accent-600 to-fuchsia-600' : 'from-fuchsia-600 to-pink-600'} text-white shadow-lg hover:scale-[1.02] active:scale-95`
                        }`}
                      >
                        {event.isRegistered ? '✓ Registered' : 'Register Now'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============ FORUM TAB ============ */}
        {activeTab === 'forum' && (
          <div className="space-y-6">
            {/* Search + New Thread */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-800/60 border border-white/5 text-white text-sm placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="w-4 h-4" />
                New Thread
              </button>
            </div>

            {/* Category chips */}
            <div className="flex gap-2 flex-wrap">
              {['All', 'Study Tips', 'Grammar', 'TOEIC', 'Motivation', 'Challenges'].map((cat, i) => (
                <button key={cat} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${i === 0 ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'bg-slate-800/60 text-slate-400 border border-white/5 hover:text-white hover:bg-white/5'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Thread List */}
            {isLoadingThreads ? (
              <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>
            ) : threads.length === 0 ? (
              <EmptyState icon={MessageSquare} message="No discussions yet" sub="Start a new thread!" />
            ) : (
              <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
                {threads.map((thread, i) => (
                  <button key={thread.id} className={`w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-white/[0.02] transition-all ${i < threads.length - 1 ? 'border-b border-white/[0.03]' : ''}`}>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {thread.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                        {thread.isPinned && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">📌 Pinned</span>}
                        {thread.isSolved && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✅ Solved</span>}
                        <span className="truncate">{thread.title}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-slate-500 font-bold">{thread.author} • LVL {thread.authorLevel}</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/5 text-slate-400 border border-white/5">{thread.category}</span>
                        {thread.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[9px] text-slate-600 font-bold">#{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold">
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{thread.replies}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{thread.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{thread.likes}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1 font-bold">{thread.lastReply}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ RESOURCES TAB ============ */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {/* Search + Upload */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-800/60 border border-white/5 text-white text-sm placeholder-slate-500 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="w-4 h-4" />
                Share Resource
              </button>
            </div>

            {/* Resource type filter */}
            <div className="flex gap-2">
              {['All', 'Flashcard Decks', 'Study Guides', 'Notes', 'Videos'].map((cat, i) => (
                <button key={cat} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${i === 0 ? 'bg-accent-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]' : 'bg-slate-800/60 text-slate-400 border border-white/5 hover:text-white hover:bg-white/5'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Resource List */}
            {isLoadingResources ? (
              <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-accent-500" /></div>
            ) : resources.length === 0 ? (
              <EmptyState icon={BookOpen} message="No resources shared yet" sub="Share the first resource!" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((res) => {
                  const rcfg = resourceTypeConfig[res.type] || resourceTypeConfig.deck;
                  const RIcon = rcfg.icon;
                  return (
                    <div key={res.id} className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:-translate-y-0.5 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rcfg.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <RIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-accent-300 transition-colors truncate">{res.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">by {res.author} • {res.language}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-current" />{res.rating} <span className="text-slate-600">({res.ratingCount})</span>
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                              {res.downloads.toLocaleString()} downloads
                            </span>
                          </div>
                        </div>
                        <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-accent-600 hover:border-accent-600 transition-all">
                          Get
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
 * SUB-COMPONENTS
 * ================================================================ */

function GroupCard({ group, onToggle }: { group: StudyGroup; onToggle: () => void }) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:-translate-y-0.5 transition-all relative overflow-hidden group">
      <div className={`absolute -right-10 -top-10 w-28 h-28 rounded-full blur-[50px] bg-gradient-to-br ${group.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${group.gradient} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
          {group.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
            {group.name}
            {group.isPrivate && <Lock className="w-3 h-3 text-slate-500" />}
          </h4>
          <p className="text-[10px] text-slate-500 font-bold">{group.category} • {group.members.toLocaleString()} members</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{group.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-slate-600 font-bold">
          <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" />{group.posts}</span>
          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{group.lastActive}</span>
        </div>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all ${
            group.isJoined
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
              : `bg-gradient-to-r ${group.gradient} text-white shadow-md hover:scale-[1.02]`
          }`}
        >
          {group.isJoined ? 'Joined' : 'Join'}
        </button>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: 'emerald' | 'violet' | 'amber' | 'fuchsia' }) {
  const colorMap = {
    emerald: { gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-400' },
    violet: { gradient: 'from-accent-500 to-indigo-500', text: 'text-accent-400' },
    amber: { gradient: 'from-amber-500 to-orange-500', text: 'text-amber-400' },
    fuchsia: { gradient: 'from-fuchsia-500 to-pink-500', text: 'text-fuchsia-400' },
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

function EmptyState({ icon: Icon, message, sub }: { icon: any; message: string; sub: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <p className="text-slate-400 font-bold text-sm">{message}</p>
      <p className="text-slate-500 text-xs mt-1">{sub}</p>
    </div>
  );
}
