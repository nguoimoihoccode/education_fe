import { Users, Clock, Mic, Trophy, Calendar, Loader2 } from 'lucide-react';
import type { CommunityEvent } from '@/api/community.api';
import { EmptyState } from './SharedComponents';
import { eventTypeConfig } from './constants';

interface EventsTabProps {
  events: CommunityEvent[];
  isLoading: boolean;
  toggleRegisterEvent: (id: string, isRegistered: boolean) => void;
}

export default function EventsTab({ events, isLoading, toggleRegisterEvent }: EventsTabProps) {
  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;
  if (events.length === 0) return <EmptyState icon={Calendar} message="Chưa có sự kiện" sub="Quay lại sau để xem sự kiện mới!" />;

  return (
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
              {event.isRegistered ? '✓ Đã đăng ký' : 'Đăng ký ngay'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
