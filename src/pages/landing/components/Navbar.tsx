import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks: Array<
  | { label: string; kind: 'anchor'; href: string }
  | { label: string; kind: 'route'; to: string }
> = [
  { label: 'Trang chủ', kind: 'anchor', href: '#home' },
  { label: 'Tính năng', kind: 'anchor', href: '#features' },
  { label: 'Khóa học', kind: 'route', to: '/education' },
  { label: 'Premium', kind: 'anchor', href: '#pricing' },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8 lg:px-16 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <span className="font-heading italic text-lg text-white">L</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-heading text-xl italic text-slate-900">LinguaAI</span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              Học ngôn ngữ cùng AI
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center bg-white rounded-full px-1.5 py-1 border border-slate-200 shadow-sm">
          {navLinks.map((link) =>
            link.kind === 'route' ? (
              <Link
                key={link.label}
                to={link.to}
                className="lp-nav-link rounded-full px-4 py-2 text-sm font-medium text-slate-600"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="lp-nav-link rounded-full px-4 py-2 text-sm font-medium text-slate-600"
              >
                {link.label}
              </a>
            ),
          )}
          <Link
            to="/register"
            className="bg-slate-900 text-white rounded-full px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 lp-btn-white"
          >
            Bắt đầu ngay
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full px-2 py-2 text-slate-700 text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Đăng nhập
          </Link>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            className="bg-white border border-slate-200 rounded-full p-2 cursor-pointer"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2">
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
        <div className="md:hidden mt-4 bg-white rounded-3xl p-3 shadow-lg border border-slate-200">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) =>
              link.kind === 'route' ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ),
            )}
            <Link
              to="/register"
              className="mt-2 bg-slate-900 text-white rounded-full px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-1.5 lp-btn-white"
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