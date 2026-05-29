import { Search, Plus, MessageSquare, Eye, Heart, Loader2, Pin, CheckCircle } from 'lucide-react';
import type { ForumThread } from '@/api/community.api';
import { EmptyState } from './SharedComponents';

interface ForumTabProps {
  threads: ForumThread[];
  isLoading: boolean;
}

export default function ForumTab({ threads, isLoading }: ForumTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search discussions..." className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-800/60 border border-white/5 text-white text-sm placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
        </div>
        <button className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> New Thread
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All', 'Study Tips', 'Grammar', 'TOEIC', 'Motivation', 'Challenges'].map((cat, i) => (
          <button key={cat} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${i === 0 ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'bg-slate-800/60 text-slate-400 border border-white/5 hover:text-white hover:bg-white/5'}`}>
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
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
                  {thread.isPinned && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20"><Pin className="h-2.5 w-2.5" /> Pinned</span>}
                  {thread.isSolved && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle className="h-2.5 w-2.5" /> Solved</span>}
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
  );
}
