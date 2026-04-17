import { Link } from 'react-router-dom';
import { Search, Menu, Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  isAuthenticated: boolean;
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
  isAuthenticated, displayName, email,
  isNotificationsOpen, isProfileOpen,
  onToggleSidebar, onToggleMobileSidebar,
  onToggleNotifications, onToggleProfile, onLogout,
}: HeaderProps) {
  return (
    <header className="stock-header-glass sticky top-0 z-30 h-16">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <button onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl transition-all duration-200"
            style={{ color: 'var(--stock-text-tertiary)' }}>
            <Menu size={22} />
          </button>

          {/* Desktop sidebar toggle */}
          <button onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-xl transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--stock-text-tertiary)' }}>
            <Menu size={22} />
          </button>

          {/* Search */}
          <div className="hidden md:block stock-search-modern w-80">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Tìm kiếm khóa học, bài viết..." />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile search */}
          <button className="md:hidden p-2 rounded-xl transition-all duration-200"
            style={{ color: 'var(--stock-text-tertiary)' }}>
            <Search size={20} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={onToggleNotifications}
              className="relative p-2.5 rounded-xl transition-all duration-200 group hover:bg-white/5"
              style={{ color: 'var(--stock-text-tertiary)' }}>
              <Bell size={20} className="group-hover:scale-110 transition-transform" />
              <span className="stock-notification-dot" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl p-0 overflow-hidden z-50 stock-fade-in"
                style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', border: '1px solid var(--stock-glass-border)' }}>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to right, rgba(34,197,94,0.05), transparent)' }}>
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
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)' }} />

          {/* Profile dropdown */}
          <div className="relative">
            <button onClick={onToggleProfile}
              className="flex items-center gap-3 p-1.5 rounded-xl transition-all duration-200 group hover:bg-white/5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #2CB34A, #0d9488)' }}>
                <User size={16} color="white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold" style={{ color: 'var(--stock-text-primary)' }}>{displayName}</p>
                <p className="text-xs" style={{ color: 'var(--stock-text-tertiary)' }}>Pro Learner</p>
              </div>
              <ChevronDown size={14} className="hidden sm:block transition-colors" style={{ color: 'var(--stock-text-tertiary)' }} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl p-0 overflow-hidden z-50 stock-fade-in"
                style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', border: '1px solid var(--stock-glass-border)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to right, rgba(34,197,94,0.05), transparent)' }}>
                  <p className="text-sm font-bold" style={{ color: 'var(--stock-text-primary)' }}>{displayName}</p>
                  <p className="text-sm" style={{ color: 'var(--stock-text-tertiary)' }}>{email}</p>
                </div>
                <div className="py-2">
                  <Link to="/profile" onClick={onToggleProfile}
                    className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-white/5"
                    style={{ color: 'var(--stock-text-secondary)' }}>
                    <User size={18} /> Hồ sơ cá nhân
                  </Link>
                  <Link to="/settings" onClick={onToggleProfile}
                    className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-white/5"
                    style={{ color: 'var(--stock-text-secondary)' }}>
                    <Settings size={18} /> Cài đặt
                  </Link>
                </div>
                <div style={{ borderTop: '1px solid var(--stock-glass-border)' }} className="py-2">
                  <button onClick={onLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-white/5"
                    style={{ color: 'var(--stock-accent-rose)' }}>
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
