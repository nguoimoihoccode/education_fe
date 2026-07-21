import { Search, Plus, Star, BookOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { SharedResource } from '@/api/community.api';
import { EmptyState } from './SharedComponents';
import { resourceTypeConfig } from './constants';

interface ResourcesTabProps {
  resources: SharedResource[];
  isLoading: boolean;
}

export default function ResourcesTab({ resources, isLoading }: ResourcesTabProps) {
  const comingSoon = (msg: string) => toast(msg, { icon: '⏳' });

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm tài nguyên... (sắp có)"
            disabled
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-800/60 border border-white/5 text-white text-sm placeholder-slate-500 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={() => comingSoon('Chia sẻ tài nguyên sẽ sớm có mặt')}
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
          title="Sắp có"
        >
          <Plus className="w-4 h-4" /> Chia sẻ
        </button>
      </div>

      <div className="flex gap-2">
        {['Tất cả', 'Bộ thẻ', 'Hướng dẫn', 'Ghi chú', 'Video'].map((cat, i) => (
          <button
            key={cat}
            type="button"
            onClick={() => comingSoon(i === 0 ? 'Đang hiển thị tất cả tài nguyên' : `Lọc "${cat}" sẽ sớm có mặt`)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${i === 0 ? 'bg-accent-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]' : 'bg-slate-800/60 text-slate-400 border border-white/5 hover:text-white hover:bg-white/5'}`}
            title={i === 0 ? undefined : 'Sắp có'}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-accent-500" /></div>
      ) : resources.length === 0 ? (
        <EmptyState icon={BookOpen} message="Chưa có tài nguyên nào" sub="Hãy chia sẻ tài nguyên đầu tiên!" />
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
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">bởi {res.author} • {res.language}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-current" />{res.rating} <span className="text-slate-600">({res.ratingCount})</span>
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">{res.downloads.toLocaleString()} lượt tải</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => comingSoon('Tải tài nguyên sẽ sớm có mặt')}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-accent-600 hover:border-accent-600 transition-all"
                    title="Sắp có"
                  >
                    Tải
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
