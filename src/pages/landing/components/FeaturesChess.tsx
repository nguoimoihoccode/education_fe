import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const features = [
  {
    title: 'AI Tutor thông minh. Học như có gia sư riêng.',
    body: 'Trò chuyện trực tiếp với AI bằng ngôn ngữ bạn đang học. Nhận phản hồi tức thì về ngữ pháp, phát âm và ngữ cảnh văn hóa — mọi lúc, mọi nơi.',
    button: 'Trải nghiệm AI Tutor',
    to: '/ai-tutor',
    gifKey: 'feature1',
    reverse: false,
  },
  {
    title: 'Flashcards thích ứng. Nhớ mãi không quên.',
    body: 'Hệ thống Spaced Repetition tự động điều chỉnh theo tốc độ học của bạn. Mỗi thẻ xuất hiện đúng lúc bạn sắp quên — giúp ghi nhớ sâu với ít thời gian nhất.',
    button: 'Khám phá Flashcards',
    to: '/flashcards',
    gifKey: 'feature2',
    reverse: true,
  },
];

type FeatureGifKey = 'feature1' | 'feature2';
type FeatureGifMap = Partial<Record<FeatureGifKey, string>>;

const FeaturesChess = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [gifs, setGifs] = useState<FeatureGifMap>({});

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let cancelled = false;

    const loadGifs = () => {
      Promise.all([
        import('@/assets/landing/feature-1.webp'),
        import('@/assets/landing/feature-2.webp'),
      ]).then(([feature1, feature2]) => {
        if (cancelled) return;
        setGifs({ feature1: feature1.default, feature2: feature2.default });
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        loadGifs();
      },
      { rootMargin: '360px 0px' },
    );

    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-12 lg:px-24" id="features">
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
              <Link
                to={feature.to}
                className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body font-medium text-sm inline-flex lp-btn-glass"
              >
                {feature.button}
              </Link>
            </div>

            {/* GIF */}
            <div className="flex-1">
              <div className="liquid-glass rounded-2xl overflow-hidden">
                {gifs[feature.gifKey as FeatureGifKey] ? (
                  <img
                    src={gifs[feature.gifKey as FeatureGifKey]}
                    alt={feature.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto block"
                  />
                ) : (
                  <div className="grid aspect-video w-full place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] text-center">
                    <span className="px-4 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                      Đang tải preview
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesChess;
