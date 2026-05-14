import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Bell, User, ChevronDown, LogOut, Settings, X } from 'lucide-react';
import { getGlobalSearchDestination } from './globalSearch';

interface HeaderProps {
  displayName: string;
  email: string;
  isNotificationsOpen: boolean;
  isProfileOpen: boolean;
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
  onToggleNotifications: () => void;
  onToggleProfile: () => void;
  onLogout: () => void;
}

export function Header({
  displayName, email,
  isNotificationsOpen, isProfileOpen,
  onToggleSidebar, onToggleMobileSidebar,
  onToggleNotifications, onToggleProfile, onLogout,
}: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const destination = getGlobalSearchDestination(searchQuery);
    if (!destination) {
      return;
    }

    navigate(destination.path);
    setSearchQuery('');
    setMobileSearchOpen(false);
  };

  return (
    <header className="stock-header-glass sticky top-0 z-30">
      <div className="h-16 px-4 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <button type="button" onClick={onToggleMobileSidebar} aria-label="Mở menu điều hướng"
            className="lg:hidden p-2 rounded-xl transition-all duration-200"
            style={{ color: 'var(--stock-text-tertiary)' }}>
            <Menu size={22} />
          </button>

          {/* Desktop sidebar toggle */}
          <button type="button" onClick={onToggleSidebar} aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
            className="hidden lg:flex p-2 rounded-xl transition-all duration-200 hover:bg-emerald-50"
            style={{ color: 'var(--stock-text-tertiary)' }}>
            <Menu size={22} />
          </button>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:block stock-search-modern w-80">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              placeholder="Tìm khóa học, flashcard, quiz..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Tìm kiếm trong EduPro"
            />
          </form>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile search */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((value) => !value)}
            aria-label={mobileSearchOpen ? 'Đóng tìm kiếm' : 'Mở tìm kiếm'}
            aria-expanded={mobileSearchOpen}
            className="md:hidden p-2 rounded-xl transition-all duration-200"
            style={{ color: 'var(--stock-text-tertiary)' }}>
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button type="button" onClick={onToggleNotifications} aria-label="Mở thông báo" aria-expanded={isNotificationsOpen}
              className="relative p-2.5 rounded-xl transition-all duration-200 group hover:bg-emerald-50"
              style={{ color: 'var(--stock-text-tertiary)' }}>
              <Bell size={20} className="group-hover:scale-110 transition-transform" />
              <span className="stock-notification-dot" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl p-0 overflow-hidden z-50 stock-fade-in"
                style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', boxShadow: '0 18px 45px rgba(15,23,42,0.12)', border: '1px solid var(--stock-glass-border)' }}>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to right, rgba(236,253,245,0.9), transparent)' }}>
                  <h3 className="font-bold" style={{ color: 'var(--stock-text-primary)' }}>Thông báo</h3>
                  <button className="text-sm font-semibold transition-colors" style={{ color: 'var(--stock-primary-600)' }}>
                    Đánh dấu đã đọc
                  </button>
                </div>
                <div className="py-3 px-5 text-center" style={{ color: 'var(--stock-text-tertiary)' }}>
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Không có thông báo mới</p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 mx-2"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(15,23,42,0.08), transparent)' }} />

          {/* Profile dropdown */}
          <div className="relative">
            <button type="button" onClick={onToggleProfile} aria-label="Mở menu tài khoản" aria-expanded={isProfileOpen}
              className="flex items-center gap-3 p-1.5 rounded-xl transition-all duration-200 group hover:bg-emerald-50">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #2CB34A, #0d9488)' }}>
                <User size={16} color="white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold" style={{ color: 'var(--stock-text-primary)' }}>{displayName}</p>
                <p className="text-xs" style={{ color: 'var(--stock-text-tertiary)' }}>Hành trình học tập</p>
              </div>
              <ChevronDown size={14} className="hidden sm:block transition-colors" style={{ color: 'var(--stock-text-tertiary)' }} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl p-0 overflow-hidden z-50 stock-fade-in"
                style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', boxShadow: '0 18px 45px rgba(15,23,42,0.12)', border: '1px solid var(--stock-glass-border)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to right, rgba(236,253,245,0.9), transparent)' }}>
                  <p className="text-sm font-bold" style={{ color: 'var(--stock-text-primary)' }}>{displayName}</p>
                  <p className="text-sm" style={{ color: 'var(--stock-text-tertiary)' }}>{email}</p>
                </div>
                <div className="py-2">
                  <Link to="/profile" onClick={onToggleProfile}
                    className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-emerald-50"
                    style={{ color: 'var(--stock-text-secondary)' }}>
                    <User size={18} /> Hồ sơ cá nhân
                  </Link>
                  <Link to="/settings" onClick={onToggleProfile}
                    className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-emerald-50"
                    style={{ color: 'var(--stock-text-secondary)' }}>
                    <Settings size={18} /> Cài đặt
                  </Link>
                </div>
                <div style={{ borderTop: '1px solid var(--stock-glass-border)' }} className="py-2">
                  <button onClick={onLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-rose-50"
                    style={{ color: 'var(--stock-accent-rose)' }}>
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {mobileSearchOpen && (
        <form
          onSubmit={handleSearchSubmit}
          className="md:hidden px-4 pb-3 stock-header-glass"
          style={{ borderTop: '1px solid var(--stock-glass-border)' }}
        >
          <div className="stock-search-modern w-full">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              placeholder="Tìm trong EduPro..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Tìm kiếm trong EduPro"
              autoFocus
            />
          </div>
        </form>
      )}
    </header>
  );
}
