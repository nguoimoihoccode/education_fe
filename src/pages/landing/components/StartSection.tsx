import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    step: '01',
    title: 'Tạo tài khoản',
    text: 'Đăng ký miễn phí trong 30 giây.',
  },
  {
    step: '02',
    title: 'Chọn ngôn ngữ',
    text: 'Tiếng Hàn, Nhật, Trung, Anh, Việt...',
  },
  {
    step: '03',
    title: 'Học mỗi ngày',
    text: 'Theo plan AI gợi ý, giữ streak không đứt.',
  },
];

const StartSection = () => {
  return (
    <section className="relative overflow-hidden py-24" id="courses">
      <div className="static-section-bg" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <span className="lp-kicker mb-6">Hành Trình Học Tập</span>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          Bạn học. AI hỗ trợ.
        </h2>
        <p className="text-slate-500 max-w-lg mb-12">
          Từ bài học đầu tiên đến thành thạo ngôn ngữ — AI Tutor đồng hành cùng bạn
          qua từng flashcard, bài quiz và cuộc hội thoại.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {steps.map((s) => (
            <div key={s.step} className="liquid-glass rounded-2xl p-7 lp-feature-card text-left">
              <div className="text-5xl font-bold text-emerald-500/30">{s.step}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="text-slate-500 text-sm mt-2">{s.text}</p>
            </div>
          ))}
        </div>

        <Link
          to="/education"
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-white text-sm font-medium lp-btn-glass"
        >
          Xem khóa học
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default StartSection;