import { Bot, BookOpen, Trophy, Users } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI Tutor 24/7',
    description:
      'Trò chuyện, luyện nói và nhận phản hồi thông minh bất cứ lúc nào. AI hiểu ngữ cảnh và điều chỉnh theo trình độ của bạn.',
  },
  {
    icon: BookOpen,
    title: 'Khóa Học Đa Dạng',
    description:
      'Từ cơ bản đến nâng cao — mỗi khóa học được thiết kế với bài giảng, bài tập và quiz tương tác để bạn tiến bộ theo cách riêng.',
  },
  {
    icon: Trophy,
    title: 'Gamification & Xếp Hạng',
    description:
      'Kiếm điểm XP, mở khóa thành tích và leo lên bảng xếp hạng. Học tập trở nên thú vị hơn bao giờ hết.',
  },
  {
    icon: Users,
    title: 'Cộng Đồng Sôi Động',
    description:
      'Tham gia nhóm học, chia sẻ tiến trình và kết nối với những người học cùng đam mê. Không ai phải học một mình.',
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24">
      {/* Section header */}
      <div className="text-center mb-16">
        <div className="liquid-glass rounded-full px-3.5 py-1 inline-block mb-6">
          <span className="text-white text-xs font-medium font-body">
            Tại Sao Chọn EduPro
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
          Khác biệt ở mọi khía cạnh.
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="liquid-glass rounded-2xl p-6 lp-feature-card"
          >
            {/* Icon */}
            <div className="liquid-glass-strong rounded-full w-10 h-10 flex items-center justify-center mb-5">
              <feature.icon className="w-5 h-5 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-white font-body font-semibold text-base mb-3">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-white/60 font-body font-light text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesGrid;
