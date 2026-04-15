import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HlsVideo from './HlsVideo';

const HLS_URL =
  'https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8';

const StartSection = () => {
  return (
    <section className="relative overflow-hidden" id="courses">
      {/* HLS Video Background */}
      <HlsVideo
        src={HLS_URL}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top gradient fade */}
      <div className="gradient-fade-top" />

      {/* Bottom gradient fade */}
      <div className="gradient-fade-bottom" />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: 500 }}
      >
        {/* Badge */}
        <div className="liquid-glass rounded-full px-3.5 py-1 mb-6">
          <span className="text-white text-xs font-medium font-body">
            Hành Trình Học Tập
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] mb-6">
          Bạn học. AI hỗ trợ.
        </h2>

        {/* Subtext */}
        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-lg mb-8">
          Từ bài học đầu tiên đến thành thạo ngôn ngữ — AI Tutor đồng hành cùng bạn
          qua từng flashcard, bài quiz và cuộc hội thoại. Học nhanh hơn, nhớ lâu hơn.
        </p>

        {/* CTA */}
        <Link
          to="/education"
          className="liquid-glass-strong rounded-full px-6 py-3 text-white font-body font-medium text-sm inline-flex items-center gap-2 lp-btn-glass"
        >
          Xem khóa học
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default StartSection;
