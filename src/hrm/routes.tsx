import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout';

/* ============================================
 * HRM Routes
 * Converted from: Angular app.routes.ts
 * 
 * Angular lazy loading:
 *   loadComponent: () => import('./features/xxx').then(m => m.XxxComponent)
 * 
 * React lazy loading:
 *   React.lazy(() => import('./pages/Xxx'))
 * ============================================ */

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const ErrorPage = lazy(() => import('./pages/ErrorPage').then((m) => ({ default: m.ErrorPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));

// Placeholder component for pages not yet converted
const PlaceholderPage: React.FC<{ name: string }> = ({ name }) => (
    <div className="card">
        <div className="text-center py-12">
            <div className="icon-box icon-primary mx-auto mb-4 w-16 h-16">
                <span className="material-symbols-outlined text-3xl">construction</span>
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">{name}</h1>
            <p className="text-secondary-500">This page is being converted from Angular to React.</p>
        </div>
    </div>
);

// Inline page factories for placeholders
const ProfilePage = () => <PlaceholderPage name="Profile" />;
const AttendancePage = () => <PlaceholderPage name="Attendance" />;
const TimesheetPage = () => <PlaceholderPage name="Timesheet" />;
const LeavePage = () => <PlaceholderPage name="Leave Requests" />;
const DepartmentPage = () => <PlaceholderPage name="Organization" />;
const EmployeeListPage = () => <PlaceholderPage name="Employee List" />;
const OrgChartPage = () => <PlaceholderPage name="Org Chart" />;
const CarBookingPage = () => <PlaceholderPage name="Car Booking" />;
const PayrollPage = () => <PlaceholderPage name="Payroll" />;
const MyAssetsPage = () => <PlaceholderPage name="My Assets" />;
const SettingsPage = () => <PlaceholderPage name="Settings" />;
const BirthdaysPage = () => <PlaceholderPage name="Birthdays" />;
const ExplainationPage = () => <PlaceholderPage name="Explainations" />;
const TeamLeavePage = () => <PlaceholderPage name="Team Leave Schedule" />;
const AnnouncementsPage = () => <PlaceholderPage name="Announcements" />;

const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-3 border-primary-200 border-t-primary-500 animate-spin" />
            <p className="text-sm text-secondary-500 font-medium">Loading...</p>
        </div>
    </div>
);

export const HrmRoutes: React.FC = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Standalone pages (no layout) */}
                <Route path="login" element={<Login />} />
                <Route path="error" element={<ErrorPage />} />

                {/* Pages with layout */}
                <Route element={<MainLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile/*" element={<ProfilePage />} />
                    <Route path="my-assets" element={<MyAssetsPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="explaination/*" element={<ExplainationPage />} />
                    <Route path="leave/*" element={<LeavePage />} />
                    <Route path="timesheet" element={<TimesheetPage />} />
                    <Route path="department" element={<DepartmentPage />} />
                    <Route path="org-chart" element={<OrgChartPage />} />
                    <Route path="employee-list" element={<EmployeeListPage />} />
                    <Route path="car-booking/*" element={<CarBookingPage />} />
                    <Route path="payroll" element={<PayrollPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="team-leave-schedule" element={<TeamLeavePage />} />
                    <Route path="birthdays" element={<BirthdaysPage />} />
                    <Route path="announcements/*" element={<AnnouncementsPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>
            </Routes>
        </Suspense>
    );
};
