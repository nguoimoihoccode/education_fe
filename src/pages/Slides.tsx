import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Presentation, Plus, Sparkles } from 'lucide-react';
import { getSlideDecks } from '@/api/slides.api';

export default function Slides() {
  const { data: decks = [], isLoading } = useQuery({ queryKey: ['slides'], queryFn: getSlideDecks });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">AI Slide Studio</h1>
          <p className="text-slate-400">Tạo, chỉnh sửa, trình chiếu slide web-native.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-full border border-white/15 px-5 py-3 font-bold text-white" to="/education/slides/demo">
            Demo Animation
          </Link>
          <Link className="rounded-full bg-violet-500 px-5 py-3 font-bold text-white" to="/education/slides/create">
            Create Slides
          </Link>
        </div>
      </div>
      {isLoading ? (
        <p className="text-slate-400">Đang tải...</p>
      ) : decks.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Presentation className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-white">Chưa có slide nào</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Tạo bộ slide đầu tiên từ bài học, hoặc xem demo animation để làm quen studio.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/education/slides/create"
              className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              Create Slides
            </Link>
            <Link
              to="/education/slides/demo"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white"
            >
              <Sparkles className="h-4 w-4" />
              Xem demo
            </Link>
            <Link to="/education?view=courses" className="text-sm font-bold text-slate-400 underline-offset-4 hover:text-white hover:underline">
              Về khóa học
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {decks.map((deck) => (
            <div key={deck.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-300">{deck.status}</p>
              <h2 className="mt-3 text-xl font-black text-white">{deck.title}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {deck.slides.length} slides · {deck.template}
              </p>
              <div className="mt-5 flex gap-3">
                <Link className="rounded-full border border-white/15 px-4 py-2 text-white" to={`/education/slides/${deck.id}/edit`}>
                  Edit
                </Link>
                <Link className="rounded-full bg-amber-400 px-4 py-2 font-bold text-slate-950" to={`/education/slides/${deck.id}/present`}>
                  Present
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
