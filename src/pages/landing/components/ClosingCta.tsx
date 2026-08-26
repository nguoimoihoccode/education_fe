import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClosingCta = () => {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="static-section-bg" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <h2 className="font-heading max-w-2xl text-4xl leading-tight tracking-tight text-white md:text-5xl">
          Bắt đầu hành trình học hôm nay
        </h2>
        <p className="font-body mt-4 max-w-md text-base text-white/70">
          Đăng ký miễn phí và trải nghiệm cách học ngôn ngữ mới — với AI đồng
          hành mỗi bước.
        </p>
        <Link
          to="/register"
          className="font-body mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
        >
          Đăng ký miễn phí
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default ClosingCta;