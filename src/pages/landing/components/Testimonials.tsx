const testimonials = [
  {
    quote:
      'Chỉ sau 3 tháng với EduPro, tôi đã có thể giao tiếp tiếng Anh tự tin trong công việc. AI Tutor giúp tôi luyện nói mỗi ngày mà không ngại sai.',
    name: 'Minh Tuấn',
    role: 'Software Engineer, FPT Software',
  },
  {
    quote:
      'Hệ thống Flashcards thông minh thật sự khác biệt. Tôi nhớ từ vựng nhanh gấp đôi so với học truyền thống. Điểm IELTS tăng từ 5.5 lên 7.0.',
    name: 'Thu Hằng',
    role: 'Sinh viên, Đại học Bách Khoa',
  },
  {
    quote:
      'Cộng đồng học tập rất tuyệt vời. Mình tham gia nhóm học tiếng Nhật và có thêm nhiều bạn cùng mục tiêu. Bảng xếp hạng tạo động lực học mỗi ngày.',
    name: 'Hoàng Nam',
    role: 'Marketing Manager, Shopee',
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24" id="community">
      {/* Section header */}
      <div className="text-center mb-16">
        <div className="liquid-glass rounded-full px-3.5 py-1 inline-block mb-6">
          <span className="text-white text-xs font-medium font-body">
            Học Viên Nói Gì
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
          Hàng nghìn người đã thay đổi.
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="liquid-glass rounded-2xl p-8 lp-feature-card flex flex-col justify-between"
          >
            {/* Quote */}
            <p className="text-white/80 font-body font-light text-sm italic leading-relaxed mb-6">
              &ldquo;{testimonial.quote}&rdquo;
            </p>

            {/* Author */}
            <div>
              <p className="text-white font-body font-medium text-sm">
                {testimonial.name}
              </p>
              <p className="text-white/50 font-body font-light text-xs">
                {testimonial.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
