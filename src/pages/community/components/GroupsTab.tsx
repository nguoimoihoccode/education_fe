import { Search, Plus, Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { StudyGroup } from '@/api/community.api';
import { GroupCard, EmptyState } from './SharedComponents';

interface GroupsTabProps {
  groups: StudyGroup[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toggleJoinGroup: (id: string, isJoined: boolean) => void;
}

export default function GroupsTab({ groups, isLoading, searchQuery, setSearchQuery, toggleJoinGroup }: GroupsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhóm học..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-800/60 border border-white/5 text-white text-sm placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => toast('Tạo nhóm học sẽ sớm có mặt', { icon: '👥' })}
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
          title="Sắp có"
        >
          <Plus className="w-4 h-4" /> Tạo nhóm
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>
      ) : groups.length === 0 ? (
        <EmptyState icon={Users} message="Không tìm thấy nhóm học" sub="Hãy tạo nhóm học đầu tiên!" />
      ) : (
        <>
          {groups.filter((g) => g.isJoined).length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Nhóm của bạn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.filter((g) => g.isJoined).map((group) => (
                  <GroupCard key={group.id} group={group} onToggle={() => toggleJoinGroup(group.id, group.isJoined)} />
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Khám phá nhóm</h3>
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
  );
}
