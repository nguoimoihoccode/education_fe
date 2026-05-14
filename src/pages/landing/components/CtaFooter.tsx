import { Link } from 'react-router-dom';
import HlsVideo from './HlsVideo';

const HLS_URL =
  'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8';

const CtaFooter = () => {
  return (
    <section className="relative overflow-hidden" id="pricing">
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
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-32">
        {/* Heading */}
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white leading-[0.85] mb-6 max-w-3xl">
          Hành trình chinh phục bắt đầu từ đây.
        </h2>

        {/* Subtext */}
        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-md mb-10">
          Đăng ký miễn phí và trải nghiệm ngay sức mạnh của AI trong học tập.
          Không cam kết, không áp lực. Chỉ có kiến thức.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Link
            to="/register"
            className="liquid-glass-strong rounded-full px-6 py-3 text-white font-body font-medium text-sm lp-btn-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Đăng ký miễn phí
          </Link>
          <Link
            to="/premium"
            className="bg-white text-black rounded-full px-6 py-3 font-body font-medium text-sm lp-btn-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            Xem gói Premium
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-white/10 w-full max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-xs font-body">
              © 2026 EduPro Learning Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/coming-soon" className="text-white/40 text-xs font-body hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-full px-1 py-1">
                Chính sách bảo mật
              </Link>
              <Link to="/coming-soon" className="text-white/40 text-xs font-body hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-full px-1 py-1">
                Điều khoản
              </Link>
              <Link to="/coming-soon" className="text-white/40 text-xs font-body hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-full px-1 py-1">
                Liên hệ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaFooter;
