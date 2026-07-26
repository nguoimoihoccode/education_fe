import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/* ============================================
 * MainLayout Component
 * Converted from: Angular main-layout.component.ts + main-layout.component.html
 * 
 * Angular → React conversions:
 *  - signal() → useState
 *  - <router-outlet> → <Outlet />
 *  - [class.lg:ml-64] → template literal className
 *  - standalone component with imports → functional component
 * ============================================ */

export const MainLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen((v) => !v);
    const toggleMobileSidebar = () => setMobileSidebarOpen((v) => !v);
    const closeMobileSidebar = () => setMobileSidebarOpen(false);

    return (
        <>
            {/* Toast / Modal / Loading containers would go here */}

            {/* Mobile sidebar overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 modal-backdrop z-40 lg:hidden"
                    onClick={closeMobileSidebar}
                />
            )}

            <div className="min-h-screen flex flex-col overflow-x-hidden">
                {/* Sidebar */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    isMobileOpen={isMobileSidebarOpen}
                    onCloseMobile={closeMobileSidebar}
                />

                {/* Main content area */}
                <div
                    className={`flex-1 flex flex-col transition-all duration-300 ease-in-out pt-16 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                        }`}
                >
                    {/* Header */}
                    <Header
                        onToggleSidebar={toggleSidebar}
                        onToggleMobileSidebar={toggleMobileSidebar}
                    />

                    {/* Page content */}
                    <main className="flex-1 p-3 md:p-4 lg:p-6">
                        <Outlet />
                    </main>

                    {/* Footer */}
                    <footer className="py-4 px-3 md:px-4 lg:px-6 border-t border-secondary-100/50 glass md:sticky md:bottom-0 z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <p className="text-sm text-secondary-500">
                                © 2024{' '}
                                <span className="font-semibold gradient-text">HRM Employee Portal</span>. All
                                rights reserved.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="text-sm text-secondary-500 hover:text-primary-600 transition-colors font-medium">
                                    Privacy Policy
                                </a>
                                <a href="#" className="text-sm text-secondary-500 hover:text-primary-600 transition-colors font-medium">
                                    Terms of Service
                                </a>
                                <a href="#" className="text-sm text-secondary-500 hover:text-primary-600 transition-colors font-medium">
                                    Support
                                </a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
};
