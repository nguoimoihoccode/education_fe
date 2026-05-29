import { motion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlurText from './BlurText';

const partners = ['AI Tutor', 'Flashcards', 'Quiz', 'Community', 'Leaderboard'];

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4';

const Hero = () => {
  return (
    <section className="relative min-h-[760px] overflow-hidden lg:min-h-screen" id="home">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.26),transparent_34rem),radial-gradient(circle_at_35%_60%,rgba(139,92,246,0.22),transparent_30rem),linear-gradient(180deg,#020617_0%,#05010a_58%,#000_100%)]" />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-1/2 top-[18%] w-[1200px] max-w-none -translate-x-1/2 object-contain z-0 opacity-90 md:w-full"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/80 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_72%)] z-0" />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: 300,
          background: 'linear-gradient(to bottom, transparent, black)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[760px] flex-col items-center text-center lg:min-h-screen" style={{ paddingTop: 150 }}>
        {/* Badge */}
        <div className="liquid-glass rounded-full px-1 py-1 inline-flex items-center gap-2 mb-8">
          <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold font-body">
            Mới
          </span>
          <span className="text-white text-xs font-body font-medium pr-3">
            Nền tảng học tập thông minh với AI
          </span>
        </div>

        {/* Heading */}
        <BlurText
          text="Chinh Phục Ngôn Ngữ Cùng AI"
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] max-w-3xl tracking-normal drop-shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
          delay={100}
          direction="bottom"
          as="h1"
        />

        {/* Subtext */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
          className="text-sm md:text-base text-white/90 font-body font-light leading-relaxed max-w-xl mt-8 drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
        >
          Học ngôn ngữ thông minh hơn với AI Tutor, Flashcards thích ứng,
          và hệ thống lặp lại ngắt quãng. Hành trình chinh phục của bạn bắt đầu tại đây.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4 mt-8 sm:flex-row"
        >
          <Link
            to="/register"
            className="rounded-full bg-white px-6 py-3 text-black font-body font-semibold text-sm inline-flex min-h-12 items-center gap-2 shadow-[0_18px_50px_rgba(255,255,255,0.22)] transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Đăng ký miễn phí
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/education"
            className="rounded-full px-4 py-3 text-white font-body font-medium text-sm inline-flex min-h-12 items-center gap-2 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <Play className="w-4 h-4 fill-white" />
            Khám phá khóa học
          </Link>
        </motion.div>

        {/* Features Bar */}
        <div className="mt-auto pb-8 pt-16 flex flex-col items-center gap-6">
          <div className="liquid-glass rounded-full px-3.5 py-1">
            <span className="text-white/80 text-xs font-body font-medium">
              Mọi thứ bạn cần trong một nền tảng
            </span>
          </div>
          <div className="flex items-center gap-12 md:gap-16 flex-wrap justify-center">
            {partners.map((partner) => (
              <span
                key={partner}
                className="text-2xl md:text-3xl font-heading italic text-white"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
