import { MessageSquare, Eye, Heart, Loader2, Pin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ForumThread } from '@/api/community.api';
import { EmptyState } from './SharedComponents';

interface ForumTabProps {
  threads: ForumThread[];
  isLoading: boolean;
}

export default function ForumTab({ threads, isLoading }: ForumTabProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 px-4 py-3 text-xs font-bold text-amber-200/90">
        Tìm kiếm, danh mục và tạo chủ đề mới sẽ sớm có. Bạn vẫn có thể xem các thảo luận hiện có bên dưới.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>
      ) : threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          message="Chưa có thảo luận"
          sub="Đăng bài diễn đàn sẽ mở sớm. Tạm thời hãy chia sẻ trên Bảng tin."
        />
      ) : (
        <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
          {threads.map((thread, i) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => toast('Xem chi tiết thảo luận sẽ sớm có mặt', { icon: '💬' })}
              className={`w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-white/[0.02] transition-all ${i < threads.length - 1 ? 'border-b border-white/[0.03]' : ''}`}
              title="Sắp có"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {thread.author.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                  {thread.isPinned && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20"><Pin className="h-2.5 w-2.5" /> Ghim</span>}
                  {thread.isSolved && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle className="h-2.5 w-2.5" /> Đã giải</span>}
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
