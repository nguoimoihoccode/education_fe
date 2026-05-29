import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { generateSlideDeck } from '@/api/slides.api';
import type { GenerateSlideDeckRequest, SlideDeckSourceType, SlideDeckTemplate } from '@/types/slides.types';

export default function SlideCreate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState<SlideDeckSourceType>(params.get('lessonId') ? 'lesson' : 'prompt');
  const [lessonId, setLessonId] = useState(params.get('lessonId') ?? '');
  const [prompt, setPrompt] = useState('');
  const [template, setTemplate] = useState<SlideDeckTemplate>('neon-classroom');
  const [slideCount, setSlideCount] = useState<5 | 8 | 12>(8);
  const mutation = useMutation({
    mutationFn: generateSlideDeck,
    onSuccess: (deck) => navigate(`/education/slides/${deck.id}/edit`),
    onError: () => toast.error('Không tạo được slide deck'),
  });

  const submit = () => {
    const payload: GenerateSlideDeckRequest = { sourceType, template, slideCount };
    if (sourceType === 'lesson') payload.lessonId = lessonId;
    if (sourceType === 'prompt') payload.prompt = prompt;
    mutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-black text-white">Create Slide Deck</h1>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">
        <label className="block text-sm font-semibold text-white">Source
          <select className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={sourceType} onChange={(event) => setSourceType(event.target.value as SlideDeckSourceType)}>
            <option value="prompt">Prompt</option>
            <option value="lesson">Lesson</option>
          </select>
        </label>
        {sourceType === 'lesson' ? (
          <label className="block text-sm font-semibold text-white">Lesson ID
            <input className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={lessonId} onChange={(event) => setLessonId(event.target.value)} />
          </label>
        ) : (
          <label className="block text-sm font-semibold text-white">Prompt
            <textarea className="mt-2 h-36 w-full rounded-xl bg-slate-950 p-3" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Teach present simple tense for beginners" />
          </label>
        )}
        <label className="block text-sm font-semibold text-white">Template
          <select className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={template} onChange={(event) => setTemplate(event.target.value as SlideDeckTemplate)}>
            <option value="neon-classroom">Neon Classroom</option>
            <option value="clean-academic">Clean Academic</option>
            <option value="quiz-reveal">Quiz Reveal</option>
          </select>
        </label>
        <label className="block text-sm font-semibold text-white">Slide count
          <select className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={slideCount} onChange={(event) => setSlideCount(Number(event.target.value) as 5 | 8 | 12)}>
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
          </select>
        </label>
        <button className="rounded-full bg-violet-500 px-6 py-3 font-bold text-white disabled:opacity-60" disabled={mutation.isPending} onClick={submit} type="button">
          {mutation.isPending ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
}
