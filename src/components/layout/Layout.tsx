import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import {
    LayoutDashboard, TrendingUp, Star, Bell, Briefcase, BarChart3,
    Search, Menu, X, LogOut, Settings, ChevronDown, Monitor,
    GraduationCap, ChevronLeft, ChevronRight, User, Bot, Trophy, Users, Crown, Compass
} from 'lucide-react';
import '../../styles/stock-redesign.css';
import '../../pages/Education.css';

/* ============================================
 * LayoutV2 - Redesigned with Angular DPU style
 * 
 * Changes from LayoutV1:
 *   - Top navbar → Left sidebar + Top header
 *   - Dark theme → Light glassmorphism
 *   - SVG icons → Lucide icons (consistent sizing)
 *   - Flat nav → Grouped sections with dividers
 * ============================================ */

interface NavItem {
    icon: React.ReactNode;
    label: string;
    to: string;
    badge?: number;
}

const learningNavItems: NavItem[] = [
    { icon: <GraduationCap size={20} />, label: 'Khóa học', to: '/education' },
    { icon: <LayoutDashboard size={20} />, label: 'Flashcards', to: '/flashcards' },
    { icon: <Briefcase size={20} />, label: 'Tài liệu', to: '/flashcards/document-import' },
    { icon: <Star size={20} />, label: 'Bài tập', to: '/quiz' },
    { icon: <Bot size={20} />, label: 'AI Tutor', to: '/ai-tutor' },
    { icon: <Trophy size={20} />, label: 'Bảng xếp hạng', to: '/leaderboard' },
    { icon: <Compass size={20} />, label: 'Community', to: '/community' },
    { icon: <Users size={20} />, label: 'Social Feed', to: '/social' },
    { icon: <BarChart3 size={20} />, label: 'Thống kê', to: '/quiz/stats' },
    { icon: <Crown size={20} />, label: 'Premium', to: '/premium' },
    { icon: <Settings size={20} />, label: 'Cài đặt', to: '/settings' },
];

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

    // Only skip layout for auth pages (login, register, callback)
    const authPaths = ['/login', '/register', '/auth/callback'];
    if (!isAuthenticated && authPaths.includes(location.pathname)) {
        return <>{children}</>;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setSidebarOpen(v => !v);
    const closeMobileSidebar = () => setMobileSidebarOpen(false);

    const renderNavSection = (title: string, items: NavItem[], showTitle = true) => (
        <>
            {showTitle && isSidebarOpen && (
                <p className="text-xs font-bold uppercase tracking-wider mb-2 px-3"
                    style={{ color: 'var(--stock-text-tertiary)' }}>
                    {title}
                </p>
            )}
            {items.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) =>
                        `stock-sidebar-link group ${isActive ? 'active' : ''} ${!isSidebarOpen ? 'justify-center !px-3' : ''}`
                    }
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
                        <span className="absolute left-full ml-2 px-2 py-1.5 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50"
                            style={{
                                background: 'linear-gradient(135deg, #1e293b, #334155)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            }}>
                            {item.label}
                        </span>
                    )}
                </NavLink>
            ))}
        </>
    );

    return (
        <div className="min-h-screen relative" style={{ backgroundColor: '#020405', color: 'var(--stock-text-primary)' }}>
            {/* Ambient Background */}
            <div className="ambient-background" style={{ zIndex: 0 }}>
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
                <div className="noise-overlay"></div>
            </div>

            {/* Mobile Sidebar Overlay */}

            {/* ======== SIDEBAR ======== */}
            {/* Desktop */}
            <aside
                className={`stock-sidebar fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out hidden lg:flex flex-col overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-center px-3" style={{ borderBottom: '1px solid var(--stock-glass-border)' }}>
                    {isSidebarOpen ? (
                        <Link to="/education" className="flex items-center gap-2.5 stock-fade-in">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}>
                                <TrendingUp size={18} color="white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-base leading-tight" style={{ color: 'var(--stock-text-primary)' }}>EduPro</h1>
                                <p className="text-xs font-medium" style={{ color: 'var(--stock-primary-400)' }}>Learning Platform</p>
                            </div>
                        </Link>
                    ) : (
                        <Link to="/education" className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}>
                            <TrendingUp size={18} color="white" />
                        </Link>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    {renderNavSection('Học tập', learningNavItems)}
                </nav>

                {/* Collapse toggle */}
                <div className="p-3" style={{ borderTop: '1px solid var(--stock-glass-border)' }}>
                    <button onClick={toggleSidebar}
                        className="stock-sidebar-link justify-center w-full">
                        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        {isSidebarOpen && <span className="font-medium text-sm">Thu gọn</span>}
                    </button>
                </div>

                {/* User Profile / Login */}
                {isAuthenticated ? (
                    isSidebarOpen ? (
                        <div className="p-3" style={{ borderTop: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to top, rgba(10,12,16,0.8), transparent)' }}>
                            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer group">
                                <Link to="/profile" className="relative flex-shrink-0">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                                        style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}>
                                        <User size={16} color="white" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                                        style={{ background: 'var(--stock-primary-500)' }} />
                                </Link>
                                <Link to="/profile" className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--stock-text-primary)' }}>{user?.displayName || 'Learner'}</p>
                                    <p className="text-xs truncate" style={{ color: 'var(--stock-text-tertiary)' }}>Pro Learner</p>
                                </Link>
                                <button onClick={handleLogout}
                                    className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                                    style={{ color: 'var(--stock-text-tertiary)' }}>
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 flex justify-center" style={{ borderTop: '1px solid var(--stock-glass-border)' }}>
                            <button onClick={handleLogout}
                                className="p-2 rounded-lg transition-all hover:bg-white/5"
                                style={{ color: 'var(--stock-text-tertiary)' }}
                                title="Đăng xuất">
                                <LogOut size={18} />
                            </button>
                        </div>
                    )
                ) : (
                    <div className="p-3" style={{ borderTop: '1px solid var(--stock-glass-border)' }}>
                        <Link to="/login"
                            className={`stock-sidebar-link w-full ${!isSidebarOpen ? 'justify-center !px-3' : ''}`}
                            style={{ color: 'var(--stock-primary-400)' }}>
                            <User size={18} />
                            {isSidebarOpen && <span className="font-medium text-sm">Đăng nhập</span>}
                        </Link>
                    </div>
                )}
            </aside>

            {/* Mobile Sidebar */}
            <aside className={`stock-sidebar fixed top-0 left-0 z-50 w-64 h-screen flex flex-col lg:hidden overflow-hidden transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="h-16 flex items-center justify-between px-3" style={{ borderBottom: '1px solid var(--stock-glass-border)' }}>
                    <Link to="/education" className="flex items-center gap-2.5" onClick={closeMobileSidebar}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}>
                            <TrendingUp size={18} color="white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-base leading-tight" style={{ color: 'var(--stock-text-primary)' }}>EduPro</h1>
                            <p className="text-xs font-medium" style={{ color: 'var(--stock-primary-600)' }}>Learning Platform</p>
                        </div>
                    </Link>
                    <button onClick={closeMobileSidebar} className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
                        style={{ color: 'var(--stock-text-tertiary)' }}>
                        <X size={20} />
                    </button>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {renderNavSection('Học tập', learningNavItems)}
                </nav>
                <div className="p-3" style={{ borderTop: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to top, rgba(10,12,16,0.8), transparent)' }}>
                    {isAuthenticated ? (
                        <button onClick={() => { handleLogout(); closeMobileSidebar(); }}
                            className="stock-sidebar-link w-full" style={{ color: 'var(--stock-accent-rose)' }}>
                            <LogOut size={18} />
                            <span className="font-medium text-sm">Đăng xuất</span>
                        </button>
                    ) : (
                        <Link to="/login" onClick={closeMobileSidebar}
                            className="stock-sidebar-link w-full" style={{ color: 'var(--stock-primary-400)' }}>
                            <User size={18} />
                            <span className="font-medium text-sm">Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </aside>

            {/* ======== MAIN CONTENT ======== */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                }`}>
                {/* Header */}
                <header className="stock-header-glass sticky top-0 z-30 h-16">
                    <div className="h-full px-4 flex items-center justify-between gap-4">
                        {/* Left */}
                        <div className="flex items-center gap-3">
                            {/* Mobile menu toggle */}
                            <button onClick={() => setMobileSidebarOpen(v => !v)}
                                className="lg:hidden p-2 rounded-xl transition-all duration-200"
                                style={{ color: 'var(--stock-text-tertiary)' }}>
                                <Menu size={22} />
                            </button>

                            {/* Desktop sidebar toggle */}
                            <button onClick={toggleSidebar}
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
                                <button
                                    onClick={() => { setNotificationsOpen(v => !v); setProfileOpen(false); }}
                                    className="relative p-2.5 rounded-xl transition-all duration-200 group hover:bg-white/5"
                                    style={{ color: 'var(--stock-text-tertiary)' }}>
                                    <Bell size={20} className="group-hover:scale-110 transition-transform" />
                                    <span className="stock-notification-dot" />
                                </button>

                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 rounded-2xl p-0 overflow-hidden z-50 stock-fade-in"
                                        style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', border: '1px solid var(--stock-glass-border)' }}>
                                        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to right, rgba(34,197,94,0.05), transparent)' }}>
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

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => { setProfileOpen(v => !v); setNotificationsOpen(false); }}
                                    className="flex items-center gap-3 p-1.5 rounded-xl transition-all duration-200 group hover:bg-white/5">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
                                        style={{ background: 'linear-gradient(135deg, #2CB34A, #0d9488)' }}>
                                        <User size={16} color="white" />
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--stock-text-primary)' }}>{user?.displayName || 'Learner'}</p>
                                        <p className="text-xs" style={{ color: 'var(--stock-text-tertiary)' }}>Pro Learner</p>
                                    </div>
                                    <ChevronDown size={14} className="hidden sm:block transition-colors" style={{ color: 'var(--stock-text-tertiary)' }} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-2xl p-0 overflow-hidden z-50 stock-fade-in"
                                        style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', border: '1px solid var(--stock-glass-border)' }}>
                                        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--stock-glass-border)', background: 'linear-gradient(to right, rgba(34,197,94,0.05), transparent)' }}>
                                            <p className="text-sm font-bold" style={{ color: 'var(--stock-text-primary)' }}>{user?.displayName || 'Learner'}</p>
                                            <p className="text-sm" style={{ color: 'var(--stock-text-tertiary)' }}>{user?.email || 'learner@edupro.vn'}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link to="/profile" onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-white/5"
                                                style={{ color: 'var(--stock-text-secondary)' }}>
                                                <User size={18} /> Hồ sơ cá nhân
                                            </Link>
                                            <Link to="/settings" onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-white/5"
                                                style={{ color: 'var(--stock-text-secondary)' }}>
                                                <Settings size={18} /> Cài đặt
                                            </Link>
                                        </div>
                                        <div style={{ borderTop: '1px solid var(--stock-glass-border)' }} className="py-2">
                                            <button onClick={handleLogout}
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

                {/* Page Content */}
                <main className="flex-1 relative w-full h-full">
                    <div className="stock-fade-in h-full">{children}</div>
                </main>

                {/* Footer */}
                <footer className="py-4 px-3 md:px-4 lg:px-6 stock-header-glass sticky bottom-0 z-10"
                    style={{ borderTop: '1px solid var(--stock-glass-border)' }}>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p className="text-sm" style={{ color: 'var(--stock-text-tertiary)' }}>
                            © 2026 <span className="font-semibold stock-gradient-text">EduPro</span>. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-sm font-medium transition-colors hover:text-green-400" style={{ color: 'var(--stock-text-tertiary)' }}>Điều khoản</a>
                            <a href="#" className="text-sm font-medium transition-colors hover:text-green-400" style={{ color: 'var(--stock-text-tertiary)' }}>Hỗ trợ</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};
