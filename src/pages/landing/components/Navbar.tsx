import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Trang chủ', href: '#home' },
  { label: 'Tính năng', href: '#features' },
  { label: 'Khóa học', href: '#courses' },
  { label: 'Cộng đồng', href: '#community' },
  { label: 'Premium', href: '#pricing' },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-heading italic text-2xl text-white">E</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-heading italic text-xl text-white">EduPro</span>
            <span className="block text-[10px] uppercase tracking-widest text-white/50 font-body font-medium">Learning Platform</span>
          </div>
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="lp-nav-link px-3 py-2 text-sm font-medium text-white/90 font-body"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/register"
            className="bg-white text-black rounded-full px-3.5 py-1.5 text-sm font-medium font-body inline-flex items-center gap-1.5 lp-btn-white"
          >
            Bắt đầu ngay
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-3">
          <Link
            to="/login"
            className="text-white/80 text-sm font-body font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Đăng nhập
          </Link>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            className="liquid-glass rounded-full p-2"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 liquid-glass rounded-3xl p-3 shadow-2xl">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-white/90 font-body hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/register"
              className="mt-2 bg-white text-black rounded-full px-4 py-3 text-sm font-medium font-body inline-flex items-center justify-center gap-1.5 lp-btn-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Bắt đầu ngay
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
