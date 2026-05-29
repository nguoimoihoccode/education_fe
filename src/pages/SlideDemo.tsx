import { SlidePresenter } from '@/components/slides/SlidePresenter';
import type { SlideDeck } from '@/types/slides.types';
import './SlideDemo.css';

const demoDeck: SlideDeck = {
  id: 'demo-animated-slide-deck',
  title: 'Future Tense Mini Lesson',
  description: 'Animated sample deck for AI Slide Studio',
  sourceType: 'prompt',
  template: 'neon-classroom',
  status: 'published',
  createdById: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slides: [
    {
      id: 'demo-title',
      order: 0,
      type: 'title',
      content: { title: 'Future Tense', subtitle: 'Learn will, be going to, and quick practice patterns' },
    },
    {
      id: 'demo-content-1',
      order: 1,
      type: 'content',
      content: { title: 'Use “will” for quick decisions', bullets: ['I will answer the phone.', 'She will help you after class.', 'Use it when decision happens now.'] },
    },
    {
      id: 'demo-content-2',
      order: 2,
      type: 'content',
      content: { title: 'Use “be going to” for plans', bullets: ['I am going to study tonight.', 'They are going to visit Da Nang.', 'Use it when plan exists before speaking.'] },
    },
    {
      id: 'demo-quiz',
      order: 3,
      type: 'quiz',
      content: { question: 'Which sentence shows a planned future action?', options: ['I will open the door.', 'I am going to take IELTS next month.', 'Maybe it will rain.'], answer: 'I am going to take IELTS next month.', explanation: '“Be going to” fits planned future actions.' },
    },
    {
      id: 'demo-content-3',
      order: 4,
      type: 'content',
      content: { title: 'Fast speaking pattern', bullets: ['Subject + will + verb', 'Subject + am/is/are going to + verb', 'Add time phrase for clarity.'] },
    },
    {
      id: 'demo-summary',
      order: 5,
      type: 'summary',
      content: { title: 'Remember', bullets: ['Will = instant decision or prediction', 'Going to = plan or strong evidence', 'Practice with real plans today', 'Use short time phrases: tonight, tomorrow, next week'] },
    },
  ],
};

export default function SlideDemo() {
  return (
    <div className="slide-demo-shell">
      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">Animated Demo</p>
        <h1 className="mt-2 text-3xl font-black text-white">Slide mẫu có animation</h1>
        <p className="mt-2 text-slate-400">Dùng ArrowLeft/ArrowRight để chuyển slide. Quiz bấm Show answer.</p>
      </div>
      <SlidePresenter deck={demoDeck} />
    </div>
  );
}
