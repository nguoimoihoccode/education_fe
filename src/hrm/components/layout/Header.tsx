import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/* ============================================
 * Header Component
 * Converted from: Angular header.component.ts + header.component.html
 * 
 * Angular → React conversions:
 *  - output() → callback props
 *  - signal() → useState
 *  - @for → .map()
 *  - @if → ternary / &&
 *  - [routerLink] → <Link>
 * ============================================ */

interface HeaderProps {
    onToggleSidebar: () => void;
    onToggleMobileSidebar: () => void;
}

const notifications = [
    { id: 1, title: 'Leave request approved', message: 'Your leave request for Jan 15-17 has been approved', time: '5 min ago', read: false },
    { id: 2, title: 'New task assigned', message: 'You have been assigned to "Q4 Report" project', time: '1 hour ago', read: false },
    { id: 3, title: 'Payslip available', message: 'Your December 2024 payslip is now available', time: '2 days ago', read: true },
];

const quickActions = [
    { id: 1, title: 'New Leave Request', icon: 'event_available', description: 'Request time off', route: '/hrm/leave' },
    { id: 2, title: 'Check In/Out', icon: 'login', description: 'Mark attendance', route: '/hrm/attendance' },
    { id: 3, title: 'Submit Timesheet', icon: 'schedule', description: 'Log your hours', route: '/hrm/timesheet' },
    { id: 4, title: 'Expense Report', icon: 'receipt_long', description: 'Submit expenses', route: '/hrm/expenses' },
    { id: 5, title: 'Request Document', icon: 'description', description: 'Request HR documents', route: '/hrm/documents' },
];

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleMobileSidebar }) => {
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isQuickActionsOpen, setQuickActionsOpen] = useState(false);

    const closeAll = () => {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setQuickActionsOpen(false);
    };

    const toggleSearch = () => { closeAll(); setSearchOpen((v) => !v); };
    const toggleNotifications = () => { closeAll(); setNotificationsOpen((v) => !v); };
    const toggleProfile = () => { closeAll(); setProfileOpen((v) => !v); };
    const toggleQuickActions = () => { closeAll(); setQuickActionsOpen((v) => !v); };

    return (
        <header className="fixed top-0 left-0 right-0 z-30 h-16 header-glass">
            <div className="h-full px-4 flex items-center justify-between gap-4">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}
                        >
                            <span className="material-symbols-outlined text-white text-lg">workspaces</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-secondary-900 text-base leading-tight">HRM Portal</h1>
                            <p className="text-xs text-primary-600 font-medium">Employee</p>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={onToggleMobileSidebar}
                        className="lg:hidden p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    {/* Desktop sidebar toggle */}
                    <button
                        onClick={onToggleSidebar}
                        className="hidden lg:flex p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    {/* Desktop Search bar */}
                    <div className="hidden md:flex relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-80 pl-11 pr-4 py-2.5 bg-secondary-100/80 border border-transparent rounded-xl text-sm text-secondary-900 focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all duration-200 placeholder:text-secondary-400"
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    {/* Mobile search */}
                    <button
                        onClick={toggleSearch}
                        className="md:hidden p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                    >
                        <span className="material-symbols-outlined">search</span>
                    </button>

                    {/* Quick actions */}
                    <div className="relative">
                        <button
                            onClick={toggleQuickActions}
                            className="hidden sm:flex p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 group"
                        >
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                                add_circle
                            </span>
                        </button>

                        {isQuickActionsOpen && (
                            <div className="absolute right-0 mt-2 w-72 modal-content p-0 overflow-hidden z-50">
                                <div className="px-5 py-4 border-b border-secondary-100 flex items-center justify-between bg-gradient-to-r from-primary-50/50 to-transparent">
                                    <h3 className="font-bold text-secondary-900">Quick Actions</h3>
                                </div>
                                <div className="py-2">
                                    {quickActions.map((action) => (
                                        <Link
                                            key={action.id}
                                            to={action.route}
                                            aria-label={`${action.title}: ${action.description}`}
                                            className="w-full px-5 py-3 hover:bg-primary-50 transition-colors flex items-center gap-3 group"
                                        >
                                            <div className="w-10 h-10 rounded-xl icon-box icon-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-lg">{action.icon}</span>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-semibold text-secondary-900">{action.title}</p>
                                                <p className="text-xs text-secondary-500">{action.description}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-secondary-400 group-hover:text-primary-600 transition-colors">
                                                arrow_forward
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={toggleNotifications}
                            className="relative p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 group"
                        >
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                                notifications
                            </span>
                            <span className="notification-dot" />
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 modal-content p-0 overflow-hidden z-50">
                                <div className="px-5 py-4 border-b border-secondary-100 flex items-center justify-between bg-gradient-to-r from-primary-50/50 to-transparent">
                                    <h3 className="font-bold text-secondary-900">Notifications</h3>
                                    <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                                        Mark all read
                                    </button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`px-5 py-4 hover:bg-secondary-50 cursor-pointer border-b border-secondary-50 last:border-0 transition-colors ${!notification.read ? 'bg-primary-50/30' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${!notification.read ? 'icon-box icon-primary' : 'bg-secondary-100'
                                                        }`}
                                                >
                                                    <span
                                                        className={`material-symbols-outlined text-lg ${!notification.read ? 'text-primary-600' : 'text-secondary-500'
                                                            }`}
                                                    >
                                                        notifications
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-secondary-900">{notification.title}</p>
                                                    <p className="text-sm text-secondary-500 truncate">{notification.message}</p>
                                                    <p className="text-xs text-secondary-400 mt-1">{notification.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-5 py-4 border-t border-secondary-100 text-center bg-gradient-to-r from-transparent via-secondary-50/50 to-transparent">
                                    <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-secondary-200 to-transparent mx-2" />

                    {/* User profile */}
                    <div className="relative">
                        <button
                            onClick={toggleProfile}
                            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-secondary-100/80 transition-all duration-200 group"
                        >
                            <div className="relative">
                                <img
                                    src="https://ui-avatars.com/api/?name=John+Doe&background=2CB34A&color=fff"
                                    alt="John Doe"
                                    className="w-9 h-9 rounded-lg ring-2 ring-white shadow-sm group-hover:ring-primary-200 transition-all"
                                />
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-secondary-900">John Doe</p>
                                <p className="text-xs text-secondary-500">Software Engineer</p>
                            </div>
                            <span className="hidden sm:block material-symbols-outlined text-secondary-400 text-sm group-hover:text-primary-500 transition-colors">
                                expand_more
                            </span>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-56 modal-content p-0 overflow-hidden z-50">
                                <div className="px-5 py-4 border-b border-secondary-100 bg-gradient-to-r from-primary-50/50 to-transparent">
                                    <p className="text-sm font-bold text-secondary-900">John Doe</p>
                                    <p className="text-sm text-secondary-500">john.doe@company.com</p>
                                </div>
                                <div className="py-2">
                                    <a href="#" className="flex items-center gap-3 px-5 py-3 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                                        <span className="material-symbols-outlined text-lg">person</span>
                                        My Profile
                                    </a>
                                    <a href="#" className="flex items-center gap-3 px-5 py-3 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                                        <span className="material-symbols-outlined text-lg">settings</span>
                                        Settings
                                    </a>
                                    <a href="#" className="flex items-center gap-3 px-5 py-3 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                                        <span className="material-symbols-outlined text-lg">help_outline</span>
                                        Help & Support
                                    </a>
                                </div>
                                <div className="border-t border-secondary-100 py-2">
                                    <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-accent-rose hover:bg-accent-rose-50 transition-colors">
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile search bar */}
            {isSearchOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 p-4 glass border-b border-secondary-200 shadow-lg animate-fade-in">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary-400">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-secondary-200 rounded-xl text-sm text-secondary-900 focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all"
                            autoFocus
                        />
                    </div>
                </div>
            )}
        </header>
    );
};
