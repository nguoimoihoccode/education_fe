import feature1Gif from '@/assets/landing/feature-1.gif';
import feature2Gif from '@/assets/landing/feature-2.gif';

const features = [
  {
    title: 'AI Tutor thông minh. Học như có gia sư riêng.',
    body: 'Trò chuyện trực tiếp với AI bằng ngôn ngữ bạn đang học. Nhận phản hồi tức thì về ngữ pháp, phát âm và ngữ cảnh văn hóa — mọi lúc, mọi nơi.',
    button: 'Trải nghiệm AI Tutor',
    gif: feature1Gif,
    reverse: false,
  },
  {
    title: 'Flashcards thích ứng. Nhớ mãi không quên.',
    body: 'Hệ thống Spaced Repetition tự động điều chỉnh theo tốc độ học của bạn. Mỗi thẻ xuất hiện đúng lúc bạn sắp quên — giúp ghi nhớ sâu với ít thời gian nhất.',
    button: 'Khám phá Flashcards',
    gif: feature2Gif,
    reverse: true,
  },
];

const FeaturesChess = () => {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24" id="features">
      {/* Section header */}
      <div className="text-center mb-16">
        <div className="liquid-glass rounded-full px-3.5 py-1 inline-block mb-6">
          <span className="text-white text-xs font-medium font-body">
            Tính Năng Nổi Bật
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
          Công nghệ AI. Trải nghiệm đỉnh cao.
        </h2>
      </div>

      {/* Feature rows */}
      <div className="space-y-20 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'
            } gap-12 items-center`}
          >
            {/* Content */}
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl md:text-4xl font-heading italic text-white leading-tight">
                {feature.title}
              </h3>
              <p className="text-white/60 font-body font-light text-sm md:text-base leading-relaxed">
                {feature.body}
              </p>
              <button className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body font-medium text-sm lp-btn-glass">
                {feature.button}
              </button>
            </div>

            {/* GIF */}
            <div className="flex-1">
              <div className="liquid-glass rounded-2xl overflow-hidden">
                <img
                  src={feature.gif}
                  alt={feature.title}
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesChess;
