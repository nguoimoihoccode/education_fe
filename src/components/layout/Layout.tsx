import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/store/auth.store';
import '@/styles/education-shell.css';
import { DesktopSidebar, MobileSidebar } from './Sidebar';
import { Header } from './Header';

/* ============================================
 * Layout — orchestrates Sidebar + Header + Content
 * ============================================ */

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  // Skip layout for auth pages and standalone pages
  const authPaths = ['/login', '/register', '/auth/callback'];
  const noLayoutPaths = ['/', '/dashboard-landing'];
  if (authPaths.includes(location.pathname)) {
    return <>{children}</>;
  }
  if (noLayoutPaths.includes(location.pathname)) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.displayName || 'Learner';
  const email = user?.email || 'learner@edupro.vn';

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--stock-text-primary)' }}>


      {/* Sidebars */}
      <DesktopSidebar
        isSidebarOpen={isSidebarOpen}
        isAuthenticated={isAuthenticated}
        displayName={displayName}
        onToggle={() => setSidebarOpen(v => !v)}
        onLogout={handleLogout}
      />
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        isAuthenticated={isAuthenticated}
        onClose={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        {/* Header */}
        <Header
          displayName={displayName}
          email={email}
          isNotificationsOpen={isNotificationsOpen}
          isProfileOpen={isProfileOpen}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(v => !v)}
          onToggleNotifications={() => { setNotificationsOpen(v => !v); setProfileOpen(false); }}
          onToggleProfile={() => { setProfileOpen(v => !v); setNotificationsOpen(false); }}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 relative w-full h-full">
          <div className="stock-fade-in h-full">{children}</div>
        </main>

        {/* Footer */}
        <footer
          className="py-4 px-3 md:px-4 lg:px-6 stock-header-glass"
          style={{ borderTop: '1px solid var(--stock-glass-border)' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm" style={{ color: 'var(--stock-text-tertiary)' }}>
              © 2026 <span className="font-semibold stock-gradient-text">EduPro</span>. Nền tảng học tập tập trung cho người học.
            </p>
            <div className="flex gap-4">
              <Link
                to={ROUTES.SETTINGS}
                className="text-sm font-medium transition-colors hover:text-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] rounded"
                style={{ color: 'var(--stock-text-tertiary)' }}
              >
                Cài đặt
              </Link>
              <Link
                to={ROUTES.SESSIONS}
                className="text-sm font-medium transition-colors hover:text-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] rounded"
                style={{ color: 'var(--stock-text-tertiary)' }}
              >
                Bảo mật
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
