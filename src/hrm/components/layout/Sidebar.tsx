import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/* ============================================
 * Sidebar Component
 * Converted from: Angular sidebar.component.ts + sidebar.component.html
 * 
 * Angular → React conversions:
 *  - input() → props
 *  - output() → callback props (onCloseMobile)
 *  - signal() → useState
 *  - @for → .map()
 *  - @if → conditional rendering
 *  - [routerLink] → NavLink
 *  - routerLinkActive → NavLink className function
 *  - (click) → onClick
 * ============================================ */

interface MenuItem {
    icon: string;
    label: string;
    route?: string;
    badge?: number;
    disabled?: boolean;
    children?: MenuItem[];
    id?: string;
}

interface SidebarProps {
    isOpen: boolean;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
}

const menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/hrm/dashboard' },
    { icon: 'person', label: 'My Profile', route: '/hrm/profile' },
    { icon: 'devices', label: 'My Assets', route: '/hrm/my-assets' },
    { icon: 'schedule', label: 'Attendance', route: '/hrm/attendance' },
    {
        icon: 'fact_check',
        label: 'Explainations',
        id: 'explainations',
        children: [
            { icon: 'description', label: 'My Requests', route: '/hrm/explaination' },
            { icon: 'assignment_turned_in', label: 'Pending Approvals', route: '/hrm/explaination/approvals', badge: 2 },
        ],
    },
    {
        icon: 'event_note',
        label: 'Leave Requests',
        id: 'leave-requests',
        children: [
            { icon: 'event_note', label: 'My Requests', route: '/hrm/leave' },
            { icon: 'pending_actions', label: 'Pending Approvals', route: '/hrm/leave/approvals', badge: 3 },
        ],
    },
    { icon: 'access_time', label: 'Timesheet', route: '/hrm/timesheet' },
    { icon: 'account_tree', label: 'Organization', route: '/hrm/department' },
    { icon: 'schema', label: 'Org Chart', route: '/hrm/org-chart' },
    { icon: 'group', label: 'Employee List', route: '/hrm/employee-list' },
    { icon: 'directions_car', label: 'Car Booking', route: '/hrm/car-booking' },
    { icon: 'payments', label: 'Payroll', route: '/hrm/payroll' },
];

const quickLinks: MenuItem[] = [
    { icon: 'help_outline', label: 'Help & Support', route: '/hrm/support', disabled: true },
    { icon: 'settings', label: 'Settings', route: '/hrm/settings' },
];

const BadgePill: React.FC<{ count: number }> = ({ count }) => (
    <span
        className="text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
        style={{
            background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)',
            boxShadow: '0 1px 4px rgba(44, 179, 74, 0.3)',
        }}
    >
        {count}
    </span>
);

const CollapsedTooltip: React.FC<{ label: string }> = ({ label }) => (
    <span
        className="absolute left-full ml-2 px-2 py-1.5 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50"
        style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
    >
        {label}
    </span>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobileOpen, onCloseMobile }) => {
    const [expandedMenu, setExpandedMenu] = useState<string | null>('leave-requests');

    const toggleMenu = (id?: string) => {
        if (!id) return;
        setExpandedMenu((current) => (current === id ? null : id));
    };

    const isMenuExpanded = (id?: string) => !!id && expandedMenu === id;

    return (
        <>
            {/* ======== Desktop Sidebar ======== */}
            <aside
                className={`fixed top-0 left-0 z-30 h-screen glass border-r border-white/50 transition-all duration-300 ease-in-out hidden lg:block overflow-hidden ${isOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo */}
                <div className="h-14 flex items-center justify-center border-b border-gray-100/50 px-3">
                    {isOpen ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}
                            >
                                <span className="material-symbols-outlined text-white text-lg">workspaces</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-secondary-900 text-base leading-tight">HRM Portal</h1>
                                <p className="text-xs text-primary-600 font-medium">Employee</p>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}
                        >
                            <span className="material-symbols-outlined text-white text-lg">workspaces</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1 overflow-y-auto overflow-x-hidden h-[calc(100vh-7rem)]">
                    {isOpen && (
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-3 px-3">
                            Main Menu
                        </p>
                    )}

                    {menuItems.map((item) => {
                        if (item.children) {
                            return (
                                <div key={item.id || item.label} className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(item.id)}
                                        className={`sidebar-link group relative w-full ${!isOpen ? 'justify-center px-3' : ''}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                        {isOpen ? (
                                            <>
                                                <span className="flex-1 font-medium text-sm text-left">{item.label}</span>
                                                <span
                                                    className={`material-symbols-outlined text-lg transition-transform ${isMenuExpanded(item.id) ? 'rotate-180' : ''
                                                        }`}
                                                >
                                                    expand_more
                                                </span>
                                            </>
                                        ) : (
                                            <CollapsedTooltip label={item.label} />
                                        )}
                                    </button>

                                    {isMenuExpanded(item.id) && isOpen && (
                                        <div className="space-y-1 pl-4 animate-fade-in">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.route}
                                                    to={child.route!}
                                                    end
                                                    className={({ isActive }) =>
                                                        `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                                                    }
                                                >
                                                    <span className="material-symbols-outlined text-lg">{child.icon}</span>
                                                    <span className="flex-1 font-medium text-sm">{child.label}</span>
                                                    {child.badge && <BadgePill count={child.badge} />}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={item.route}
                                to={item.route!}
                                className={({ isActive }) =>
                                    `sidebar-link group relative ${isActive ? 'sidebar-link-active' : ''} ${!isOpen ? 'justify-center px-3' : ''
                                    }`
                                }
                            >
                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                {isOpen ? (
                                    <>
                                        <span className="flex-1 font-medium text-sm">{item.label}</span>
                                        {item.badge && <BadgePill count={item.badge} />}
                                    </>
                                ) : (
                                    <>
                                        <CollapsedTooltip label={item.label} />
                                        {item.badge && (
                                            <span
                                                className="absolute top-0 right-0 w-2 h-2 rounded-full"
                                                style={{
                                                    background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)',
                                                    boxShadow: '0 0 6px rgba(44, 179, 74, 0.5)',
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

                    <div className="divider-gradient" />

                    {isOpen && (
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-3 px-3">
                            Quick Links
                        </p>
                    )}

                    {quickLinks.map((item) => (
                        <NavLink
                            key={item.route}
                            to={item.route!}
                            className={({ isActive }) =>
                                `sidebar-link group relative ${isActive ? 'sidebar-link-active' : ''} ${!isOpen ? 'justify-center px-3' : ''
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            {isOpen ? (
                                <span className="font-medium text-sm">{item.label}</span>
                            ) : (
                                <CollapsedTooltip label={item.label} />
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile at Bottom */}
                {isOpen ? (
                    <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-secondary-100/50 bg-gradient-to-t from-secondary-50/80 to-transparent backdrop-blur-sm">
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-all cursor-pointer group">
                            <div className="relative">
                                <img
                                    src="https://ui-avatars.com/api/?name=John+Doe&background=2CB34A&color=fff"
                                    alt="User Avatar"
                                    className="w-8 h-8 rounded-lg ring-2 ring-white shadow-md group-hover:ring-primary-200 transition-all"
                                />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-500 rounded-full ring-2 ring-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-secondary-900 truncate">John Doe</p>
                                <p className="text-xs text-secondary-500 truncate">Software Engineer</p>
                            </div>
                            <button className="p-1.5 text-secondary-400 hover:text-accent-rose rounded-lg hover:bg-accent-rose-50 transition-all">
                                <span className="material-symbols-outlined text-base">logout</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-secondary-100/50 bg-gradient-to-t from-secondary-50/80 to-transparent flex justify-center">
                        <div className="relative group cursor-pointer">
                            <img
                                src="https://ui-avatars.com/api/?name=John+Doe&background=2CB34A&color=fff"
                                alt="User Avatar"
                                className="w-8 h-8 rounded-lg ring-2 ring-white shadow-md group-hover:ring-primary-300 transition-all"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-500 rounded-full ring-2 ring-white" />
                        </div>
                    </div>
                )}
            </aside>

            {/* ======== Mobile Sidebar ======== */}
            <aside
                className={`fixed top-0 left-0 z-50 w-64 h-screen glass border-r border-white/50 transition-transform duration-300 ease-in-out lg:hidden overflow-hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-14 flex items-center justify-between border-b border-secondary-100/50 px-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #2CB34A 0%, #0d9488 100%)' }}
                        >
                            <span className="material-symbols-outlined text-white text-lg">workspaces</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-secondary-900 text-base leading-tight">HRM Portal</h1>
                            <p className="text-xs text-primary-600 font-medium">Employee</p>
                        </div>
                    </div>
                    <button
                        onClick={onCloseMobile}
                        className="p-1.5 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <nav className="p-3 space-y-1 overflow-y-auto overflow-x-hidden h-[calc(100vh-9rem)]">
                    <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-3 px-3">
                        Main Menu
                    </p>

                    {menuItems.map((item) => {
                        if (item.children) {
                            return (
                                <div key={item.id || item.label} className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(item.id)}
                                        className="sidebar-link group relative w-full"
                                    >
                                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                        <span className="flex-1 font-medium text-sm text-left">{item.label}</span>
                                        <span
                                            className={`material-symbols-outlined text-lg transition-transform ${isMenuExpanded(item.id) ? 'rotate-180' : ''
                                                }`}
                                        >
                                            expand_more
                                        </span>
                                    </button>

                                    {isMenuExpanded(item.id) && (
                                        <div className="space-y-1 pl-4 animate-fade-in">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.route}
                                                    to={child.route!}
                                                    end
                                                    onClick={onCloseMobile}
                                                    className={({ isActive }) =>
                                                        `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                                                    }
                                                >
                                                    <span className="material-symbols-outlined text-lg">{child.icon}</span>
                                                    <span className="flex-1 font-medium text-sm">{child.label}</span>
                                                    {child.badge && <BadgePill count={child.badge} />}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={item.route}
                                to={item.route!}
                                onClick={onCloseMobile}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                                }
                            >
                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                <span className="flex-1 font-medium text-sm">{item.label}</span>
                                {item.badge && <BadgePill count={item.badge} />}
                            </NavLink>
                        );
                    })}

                    <div className="divider-gradient" />

                    <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-3 px-3">
                        Quick Links
                    </p>

                    {quickLinks.map((item) => (
                        <NavLink
                            key={item.route}
                            to={item.route!}
                            onClick={onCloseMobile}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                            }
                        >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Mobile User profile */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-secondary-100/50 bg-gradient-to-t from-secondary-50/80 to-transparent backdrop-blur-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-all cursor-pointer group">
                        <div className="relative">
                            <img
                                src="https://ui-avatars.com/api/?name=John+Doe&background=2CB34A&color=fff"
                                alt="User Avatar"
                                className="w-8 h-8 rounded-lg ring-2 ring-white shadow-md"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-500 rounded-full ring-2 ring-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-secondary-900 truncate">John Doe</p>
                            <p className="text-xs text-secondary-500 truncate">Software Engineer</p>
                        </div>
                        <button className="p-1.5 text-secondary-400 hover:text-accent-rose rounded-lg hover:bg-accent-rose-50 transition-all">
                            <span className="material-symbols-outlined text-base">logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
