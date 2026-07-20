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
    <section className="landing-preview px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="landing-preview-kicker mb-5">Trải nghiệm học thật</div>
          <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
            Từ landing vào app không bị hụt nhịp.
          </h2>
          <p className="landing-preview-muted mt-5 max-w-xl text-base leading-8">
            EduPro gom AI Tutor, flashcards, quiz và coach thành một lộ trình học
            mỗi ngày. Giao diện rõ mục tiêu, dễ bắt đầu.
          </p>
          <Link to="/education" className="landing-preview-cta mt-7">
            Vào không gian học
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="landing-preview-card rounded-[2rem] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.25)] backdrop-blur">
          <div className="rounded-[1.5rem] bg-black/40 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-emerald-300 uppercase">
                  Today plan
                </p>
                <h3 className="mt-2 text-2xl font-black">3 bước giữ streak</h3>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400 text-lg font-black text-emerald-950">
                72%
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {previewCards.map((card) => (
              <div
                key={card.title}
                className="landing-preview-card flex gap-3 rounded-2xl p-4"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{card.title}</h4>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="landing-preview-muted mt-1 text-sm leading-6">
                    {card.text}
                  </p>
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
