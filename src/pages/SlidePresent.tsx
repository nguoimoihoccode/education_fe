import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getSlideDeck } from '@/api/slides.api';
import { SlidePresenter } from '@/components/slides/SlidePresenter';

export default function SlidePresent() {
  const { id = '' } = useParams();
  const { data: deck, isLoading } = useQuery({ queryKey: ['slide', id], queryFn: () => getSlideDeck(id), enabled: Boolean(id) });

  if (isLoading) return <p className="text-slate-400">Đang tải...</p>;
  if (!deck) return <p className="text-slate-400">Không tìm thấy slide deck.</p>;

  return <SlidePresenter deck={deck} />;
}
