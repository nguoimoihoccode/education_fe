import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSlideDeck, publishSlideDeck, updateSlideDeck } from '@/api/slides.api';
import { SlideEditor } from '@/components/slides/SlideEditor';
import type { SlideDeck, SlideItem } from '@/types/slides.types';

export default function SlideEdit() {
  const { id = '' } = useParams();
  const { data } = useQuery({ queryKey: ['slide', id], queryFn: () => getSlideDeck(id), enabled: Boolean(id) });

  if (!data) return <p className="text-slate-400">Đang tải...</p>;

  return <SlideEditForm initialDeck={data} id={id} />;
}

function SlideEditForm({ initialDeck, id }: { initialDeck: SlideDeck; id: string }) {
  const queryClient = useQueryClient();
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const editableDeck = deck ?? initialDeck;

  const saveMutation = useMutation({
    mutationFn: () => updateSlideDeck(id, { title: editableDeck.title, slides: editableDeck.slides, template: editableDeck.template }),
    onSuccess: (updated) => { setDeck(updated); queryClient.invalidateQueries({ queryKey: ['slides'] }); toast.success('Đã lưu'); },
  });
  const publishMutation = useMutation({
    mutationFn: () => publishSlideDeck(id),
    onSuccess: (updated) => { setDeck(updated); toast.success('Đã publish'); },
  });

  const updateSlide = (slide: SlideItem) => {
    setDeck({ ...editableDeck, slides: editableDeck.slides.map((item) => item.id === slide.id ? slide : item) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input className="min-w-[280px] rounded-2xl bg-white/10 px-4 py-3 text-2xl font-black text-white" value={editableDeck.title} onChange={(event) => setDeck({ ...editableDeck, title: event.target.value })} />
        <div className="flex gap-3">
          <button className="rounded-full border border-white/15 px-5 py-2 text-white" onClick={() => saveMutation.mutate()} type="button">Save</button>
          <button className="rounded-full bg-emerald-500 px-5 py-2 font-bold text-white" onClick={() => publishMutation.mutate()} type="button">Publish</button>
          <Link className="rounded-full bg-amber-400 px-5 py-2 font-bold text-slate-950" to={`/education/slides/${editableDeck.id}/present`}>Present</Link>
        </div>
      </div>
      <SlideEditor deck={editableDeck} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onSlideChange={updateSlide} />
    </div>
  );
}
