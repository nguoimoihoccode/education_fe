const stats = [
  { value: '50+', label: 'Khóa học' },
  { value: '10K+', label: 'Học viên' },
  { value: '98%', label: 'Hài lòng' },
  { value: '2.5x', label: 'Học nhanh hơn' },
];

const Stats = () => {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="static-section-bg" aria-hidden="true" />

      <div className="relative z-10 px-6 md:px-12 lg:px-24">
        <div className="liquid-glass rounded-3xl p-12 md:p-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">
                  {stat.value}
                </p>
                <p className="text-slate-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;