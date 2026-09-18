import { Link } from 'react-router-dom';

const CtaFooter = () => {
  return (
    <section className="relative overflow-hidden" id="pricing">
      <div className="static-section-bg" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-28">
        <span className="lp-kicker mb-6">Premium</span>
        <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[0.9] mb-6 max-w-3xl">
          Hành trình chinh phục bắt đầu từ đây.
        </h2>
        <p className="text-slate-500 max-w-md mb-10">
          Đăng ký miễn phí và trải nghiệm ngay sức mạnh của AI trong học tập.
          Không cam kết, không áp lực. Chỉ có kiến thức.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/register"
            className="rounded-full bg-emerald-600 px-6 py-3 text-on-accent font-medium text-sm lp-btn-glass"
          >
            Đăng ký miễn phí
          </Link>
          <Link
            to="/premium"
            className="bg-slate-900 text-white rounded-full px-6 py-3 font-medium text-sm lp-btn-white"
          >
            Xem gói Premium
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-slate-200 w-full max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs">
              © 2026 LinguaAI Learning Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/education" className="text-slate-500 text-xs hover:text-slate-800 transition-colors">
                Học ngay
              </Link>
              <Link to="/premium" className="text-slate-500 text-xs hover:text-slate-800 transition-colors">
                Premium
              </Link>
              <a href="mailto:support@edupro.local" className="text-slate-500 text-xs hover:text-slate-800 transition-colors">
                Liên hệ
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaFooter;