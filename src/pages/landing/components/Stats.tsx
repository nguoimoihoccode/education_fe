import HlsVideo from './HlsVideo';

const HLS_URL =
  'https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8';

const stats = [
  { value: '50+', label: 'Khóa học' },
  { value: '10K+', label: 'Học viên' },
  { value: '98%', label: 'Hài lòng' },
  { value: '2.5x', label: 'Học nhanh hơn' },
];

const Stats = () => {
  return (
    <section className="relative overflow-hidden py-24">
      {/* HLS Video Background (desaturated) */}
      <HlsVideo
        src={HLS_URL}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'saturate(0)' }}
      />

      {/* Top gradient fade */}
      <div className="gradient-fade-top" />

      {/* Bottom gradient fade */}
      <div className="gradient-fade-bottom" />

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24">
        <div className="liquid-glass rounded-3xl p-12 md:p-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-white/60 font-body font-light text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
