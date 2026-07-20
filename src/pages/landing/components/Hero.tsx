import { motion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlurText from './BlurText';

const partners = ['AI Tutor', 'Flashcards', 'Quiz', 'Community', 'Leaderboard'];

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4';

const heroFallbackImage =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#10b981"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
      </linearGradient></defs>
      <rect width="1600" height="900" fill="#000"/>
      <rect width="1600" height="900" fill="url(#g)" opacity="0.35"/>
    </svg>`,
  );

const Hero = () => {
  return (
    <section className="relative min-h-[760px] overflow-hidden lg:min-h-screen" id="home">
      <div className="landing-hero-bg" aria-hidden="true" />
      <img
        src={heroFallbackImage}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-[18%] z-0 w-[1200px] max-w-none -translate-x-1/2 object-contain opacity-90 md:w-full"
      />
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={heroFallbackImage}
        className="absolute left-1/2 top-[18%] z-0 w-[1200px] max-w-none -translate-x-1/2 object-contain opacity-90 md:w-full"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/65 via-black/35 to-black/80" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_72%)]" />

      {/* Bottom gradient fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1]"
        style={{
          height: 300,
          background: 'linear-gradient(to bottom, transparent, var(--app-bg))',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex min-h-[760px] flex-col items-center text-center lg:min-h-screen"
        style={{ paddingTop: 150 }}
      >
        {/* Badge */}
        <div className="liquid-glass mb-8 inline-flex items-center gap-2 rounded-full px-1 py-1">
          <span className="font-body rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
            Mới
          </span>
          <span className="font-body pr-3 text-xs font-medium text-white">
            Nền tảng học tập thông minh với AI
          </span>
        </div>

        {/* Heading */}
        <BlurText
          text="Chinh Phục Ngôn Ngữ Cùng AI"
          className="font-heading max-w-3xl text-5xl leading-[0.85] tracking-normal text-white italic drop-shadow-[0_8px_32px_rgba(0,0,0,0.55)] md:text-7xl lg:text-[5.5rem]"
          delay={100}
          direction="bottom"
          as="h1"
        />

        {/* Subtext */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
          className="font-body mt-8 max-w-xl text-sm leading-relaxed font-light text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] md:text-base"
        >
          Học ngôn ngữ thông minh hơn với AI Tutor, Flashcards thích ứng, và hệ
          thống lặp lại ngắt quãng. Hành trình chinh phục của bạn bắt đầu tại đây.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            to="/register"
            className="font-body inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(255,255,255,0.22)] transition hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
          >
            Đăng ký miễn phí
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/education"
            className="font-body inline-flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
          >
            <Play className="h-4 w-4 fill-white" />
            Khám phá khóa học
          </Link>
        </motion.div>

        {/* Features Bar */}
        <div className="mt-auto flex flex-col items-center gap-6 pt-16 pb-8">
          <div className="liquid-glass rounded-full px-3.5 py-1">
            <span className="font-body text-xs font-medium text-white/80">
              Mọi thứ bạn cần trong một nền tảng
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {partners.map((partner) => (
              <span
                key={partner}
                className="font-heading text-2xl text-white italic md:text-3xl"
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
