import { motion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlurText from './BlurText';
import heroFallbackImage from '@/assets/landing/feature-1.gif';

const partners = ['AI Tutor', 'Flashcards', 'Quiz', 'Community', 'Leaderboard'];

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4';

const Hero = () => {
  return (
    <section className="relative overflow-visible min-h-screen" style={{ height: 1000 }} id="home">
      <img
        src={heroFallbackImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-70 z-0"
      />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-0 w-full h-auto object-contain z-0"
        style={{ top: '20%' }}
        poster={heroFallbackImage}
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/5 z-0" />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: 300,
          background: 'linear-gradient(to bottom, transparent, black)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center h-full" style={{ paddingTop: 150 }}>
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
          className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-3xl tracking-normal"
          delay={100}
          direction="bottom"
          as="h1"
        />

        {/* Subtext */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
          className="text-sm md:text-base text-white font-body font-light leading-tight max-w-md mt-8"
        >
          Học ngôn ngữ thông minh hơn với AI Tutor, Flashcards thích ứng,
          và hệ thống lặp lại ngắt quãng. Hành trình chinh phục của bạn bắt đầu tại đây.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
          className="flex items-center gap-4 mt-8"
        >
          <Link
            to="/register"
            className="liquid-glass-strong rounded-full px-5 py-2.5 text-white font-body font-medium text-sm inline-flex items-center gap-2 lp-btn-glass"
          >
            Đăng ký miễn phí
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/education"
            className="text-white font-body font-medium text-sm inline-flex items-center gap-2 hover:text-white/80 transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            Khám phá khóa học
          </Link>
        </motion.div>

        {/* Features Bar */}
        <div className="mt-auto pb-8 pt-16 flex flex-col items-center gap-6">
          <div className="liquid-glass rounded-full px-3.5 py-1">
            <span className="text-white/70 text-xs font-body font-medium">
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
