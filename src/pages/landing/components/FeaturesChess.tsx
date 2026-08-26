import { Link } from 'react-router-dom';

const features = [
  {
    title: 'AI Tutor thông minh. Học như có gia sư riêng.',
    body: 'Trò chuyện trực tiếp với AI bằng ngôn ngữ bạn đang học. Nhận phản hồi tức thì về ngữ pháp, phát âm và ngữ cảnh văn hóa — mọi lúc, mọi nơi.',
    button: 'Trải nghiệm AI Tutor',
    to: '/ai-tutor',
    reverse: false,
  },
  {
    title: 'Flashcards thích ứng. Nhớ mãi không quên.',
    body: 'Hệ thống Spaced Repetition tự động điều chỉnh theo tốc độ học của bạn. Mỗi thẻ xuất hiện đúng lúc bạn sắp quên — giúp ghi nhớ sâu với ít thời gian nhất.',
    button: 'Khám phá Flashcards',
    to: '/flashcards',
    reverse: true,
  },
];

const FeaturesChess = () => {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24" id="features">
      <div className="text-center mb-16">
        <span className="lp-kicker mb-6">Tính năng nổi bật</span>
        <h2 className="mt-5 text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Công nghệ AI. Trải nghiệm đỉnh cao.
        </h2>
      </div>

      <div className="space-y-20 max-w-6xl mx-auto">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`flex flex-col ${
              feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'
            } gap-12 items-center`}
          >
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-base leading-relaxed">
                {feature.body}
              </p>
              <Link
                to={feature.to}
                className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-2.5 text-slate-700 text-sm font-medium lp-btn-glass"
              >
                {feature.button}
              </Link>
            </div>

            <div className="flex-1">
              <div
                className="aspect-video w-full rounded-2xl bg-gradient-to-br from-emerald-100 to-white border border-emerald-100 shadow-sm"
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesChess;