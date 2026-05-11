import { MessageSquare, Clock, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { StudyGroup } from '@/api/community.api';

export function GroupCard({ group, onToggle }: { group: StudyGroup; onToggle: () => void }) {
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

export function QuickStat({ icon: Icon, value, label, color }: { icon: LucideIcon; value: string; label: string; color: 'emerald' | 'violet' | 'amber' | 'fuchsia' }) {
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

export function EmptyState({ icon: Icon, message, sub }: { icon: LucideIcon; message: string; sub: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <p className="text-slate-400 font-bold text-sm">{message}</p>
      <p className="text-slate-500 text-xs mt-1">{sub}</p>
    </div>
  );
}
