import { ArrowRight, Bot, Brain, CheckCircle2, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const previewCards = [
  {
    icon: Brain,
    title: 'Coach mỗi ngày',
    text: 'Nhận kế hoạch học rõ ràng, biết nên học gì trước và vì sao.',
  },
  {
    icon: Bot,
    title: 'AI Tutor',
    text: 'Luyện hội thoại, hỏi ngữ pháp và nhận phản hồi tức thì.',
  },
  {
    icon: Layers3,
    title: 'Flashcards SRS',
    text: 'Ôn đúng lúc sắp quên để nhớ lâu mà không nhồi nhét.',
  },
];

const LearningPreview = () => {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50 px-6 py-24 text-slate-950 md:px-12 lg:px-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">
            Trải nghiệm học thật
          </div>
          <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
            Từ landing vào app không bị hụt nhịp.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            EduPro gom AI Tutor, flashcards, quiz và coach thành một lộ trình học mỗi ngày. Giao diện sáng, rõ mục tiêu, dễ bắt đầu.
          </p>
          <Link
            to="/education"
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-extrabold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            Vào không gian học
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Today plan</p>
                <h3 className="mt-2 text-2xl font-black">3 bước giữ streak</h3>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400 text-lg font-black text-slate-950">
                72%
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {previewCards.map((card) => (
              <div key={card.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-950">{card.title}</h4>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningPreview;
