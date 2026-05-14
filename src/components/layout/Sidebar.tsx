import { Link, NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, ChevronLeft, ChevronRight, LogOut, User, X } from 'lucide-react';
import { learningNavSections, type NavItem } from './navConfig';

/* ============================================
 * NavSection — renders a group of nav links
 * ============================================ */
function NavSection({
  title, items, isSidebarOpen, onLinkClick,
}: {
  title: string; items: NavItem[]; isSidebarOpen: boolean; onLinkClick?: () => void;
}) {
  const location = useLocation();

  return (
    <div className={`stock-sidebar-group ${!isSidebarOpen ? 'collapsed' : ''}`}>
      {isSidebarOpen && (
        <p className="stock-sidebar-section-title">
          {title}
        </p>
      )}
      <div className="space-y-1">
      {items.map((item) => (
        (() => {
          return (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              onClick={onLinkClick}
              className={({ isActive: routeIsActive }) => {
                const isActive = item.matcher
                  ? item.matcher({ pathname: location.pathname, search: location.search })
                  : routeIsActive;

                return `stock-sidebar-link group ${isActive ? 'active' : ''} ${!isSidebarOpen ? 'justify-center !px-3' : ''}`;
              }}
            >
          <span className="flex-shrink-0">{item.icon}</span>
          {isSidebarOpen && (
            <>
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              {item.badge && (
                <span className="text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)',
                    boxShadow: '0 1px 4px rgba(44, 179, 74, 0.3)',
                  }}>
                  {item.badge}
                </span>
              )}
            </>
          )}
          {/* Tooltip for collapsed sidebar */}
          {!isSidebarOpen && (
            <span className="absolute left-full ml-2 px-2 py-1.5 text-slate-700 text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50"
              style={{
                background: '#ffffff',
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}>
              {item.label}
            </span>
          )}
            </NavLink>
          );
        })()
      ))}
      </div>
    </div>
  );
}

/* ============================================
 * SidebarLogo — brand logo at top
 * ============================================ */
function SidebarLogo({ isSidebarOpen, onClick }: { isSidebarOpen: boolean; onClick?: () => void }) {
  const logoIcon = (
    <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
      style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}>
      <GraduationCap size={18} color="white" />
    </div>
  );

  if (!isSidebarOpen) {
    return (
      <Link to="/education" onClick={onClick}
        className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}>
        <GraduationCap size={18} color="white" />
      </Link>
    );
  }

  return (
    <Link to="/education" onClick={onClick} className="flex items-center gap-2.5 stock-fade-in">
      {logoIcon}
      <div>
        <h1 className="font-bold text-base leading-tight" style={{ color: 'var(--stock-text-primary)' }}>EduPro</h1>
        <p className="text-xs font-medium" style={{ color: 'var(--stock-primary-400)' }}>Lộ trình học tập</p>
      </div>
    </Link>
  );
}

/* ============================================
 * SidebarUserFooter — user profile at bottom
 * ============================================ */
function SidebarUserFooter({
  isAuthenticated, isSidebarOpen, displayName, onLogout,
}: {
  isAuthenticated: boolean; isSidebarOpen: boolean; displayName: string; onLogout: () => void;
}) {
  if (!isAuthenticated) {
    return (
      <div className="p-3" style={{ borderTop: '1px solid var(--stock-glass-border)' }}>
        <Link to="/login"
          className={`stock-sidebar-link w-full ${!isSidebarOpen ? 'justify-center !px-3' : ''}`}
          style={{ color: 'var(--stock-primary-400)' }}>
          <User size={18} />
          {isSidebarOpen && <span className="font-medium text-sm">Đăng nhập</span>}
        </Link>
      </div>
    );
  }

  if (!isSidebarOpen) {
    return (
      <div className="p-3 flex justify-center" style={{ borderTop: '1px solid var(--stock-glass-border)' }}>
        <button type="button" onClick={onLogout} aria-label="Đăng xuất" className="p-2 rounded-lg transition-all hover:bg-emerald-50"
          style={{ color: 'var(--stock-text-tertiary)' }} title="Đăng xuất">
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="p-3" style={{ borderTop: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to top, rgba(236,253,245,0.75), transparent)' }}>
      <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-emerald-50 transition-all cursor-pointer group">
        <Link to="/profile" className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}>
            <User size={16} color="white" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white"
            style={{ background: 'var(--stock-primary-500)' }} />
        </Link>
        <Link to="/profile" className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--stock-text-primary)' }}>{displayName}</p>
          <p className="text-xs truncate" style={{ color: 'var(--stock-text-tertiary)' }}>Đang học hôm nay</p>
        </Link>
        <button type="button" onClick={onLogout} aria-label="Đăng xuất" className="p-1.5 rounded-lg transition-all hover:bg-emerald-50"
          style={{ color: 'var(--stock-text-tertiary)' }}>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

/* ============================================
 * Desktop Sidebar
 * ============================================ */
export function DesktopSidebar({
  isSidebarOpen, isAuthenticated, displayName, onToggle, onLogout,
}: {
  isSidebarOpen: boolean; isAuthenticated: boolean; displayName: string;
  onToggle: () => void; onLogout: () => void;
}) {
  return (
    <aside
      className={`stock-sidebar fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out hidden lg:flex flex-col overflow-hidden ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-3" style={{ borderBottom: '1px solid var(--stock-glass-border)' }}>
        <SidebarLogo isSidebarOpen={isSidebarOpen} />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden">
        {learningNavSections.map((section) => (
          <NavSection
            key={section.title}
            title={section.title}
            items={section.items}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3" style={{ borderTop: '1px solid var(--stock-glass-border)' }}>
        <button type="button" onClick={onToggle} aria-label={isSidebarOpen ? 'Thu gọn thanh điều hướng' : 'Mở rộng thanh điều hướng'} className="stock-sidebar-link justify-center w-full">
          {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          {isSidebarOpen && <span className="font-medium text-sm">Thu gọn</span>}
        </button>
      </div>

      {/* User footer */}
      <SidebarUserFooter isAuthenticated={isAuthenticated} isSidebarOpen={isSidebarOpen}
        displayName={displayName} onLogout={onLogout} />
    </aside>
  );
}

/* ============================================
 * Mobile Sidebar (slide-in drawer)
 * ============================================ */
export function MobileSidebar({
  isOpen, isAuthenticated, onClose, onLogout,
}: {
  isOpen: boolean; isAuthenticated: boolean; onClose: () => void; onLogout: () => void;
}) {
  return (
    <aside className={`stock-sidebar fixed top-0 left-0 z-50 w-64 h-screen flex flex-col lg:hidden overflow-hidden transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-3" style={{ borderBottom: '1px solid var(--stock-glass-border)' }}>
        <SidebarLogo isSidebarOpen onClick={onClose} />
        <button type="button" onClick={onClose} aria-label="Đóng menu điều hướng" className="p-1.5 rounded-lg hover:bg-emerald-50 transition-all"
          style={{ color: 'var(--stock-text-tertiary)' }}>
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
        {learningNavSections.map((section) => (
          <NavSection
            key={section.title}
            title={section.title}
            items={section.items}
            isSidebarOpen
            onLinkClick={onClose}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to top, rgba(236,253,245,0.75), transparent)' }}>
        {isAuthenticated ? (
          <button type="button" onClick={() => { onLogout(); onClose(); }}
            className="stock-sidebar-link w-full" style={{ color: 'var(--stock-accent-rose)' }}>
            <LogOut size={18} />
            <span className="font-medium text-sm">Đăng xuất</span>
          </button>
        ) : (
          <Link to="/login" onClick={onClose}
            className="stock-sidebar-link w-full" style={{ color: 'var(--stock-primary-400)' }}>
            <User size={18} />
            <span className="font-medium text-sm">Đăng nhập</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
