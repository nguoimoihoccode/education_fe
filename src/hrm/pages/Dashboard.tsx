import React from 'react';
import { Link } from 'react-router-dom';

/* ============================================
 * Dashboard Page
 * Converted from: Angular dashboard.component.ts + dashboard.component.html
 *
 * This is the largest page in the Angular app (658 lines HTML, 411 lines TS).
 * All mock data is preserved. Angular-specific services (Toast, Loading, Modal)
 * are replaced with console.log placeholders.
 *
 * Angular → React:
 *  - @for → .map()
 *  - @if → conditional rendering
 *  - [class] → className interpolation
 *  - [style.animation-delay] → style={{ animationDelay }}
 *  - signal() → local constants (no reactive state needed for display-only data)
 *  - inject(ToastService) → console.log
 * ============================================ */

const stats = [
    { label: 'Days Present', value: '22', icon: 'check_circle', color: 'primary', change: '+2 from last month' },
    { label: 'Leave Balance', value: '12', icon: 'beach_access', color: 'blue', change: '3 used this year' },
    { label: 'Pending Tasks', value: '5', icon: 'assignment', color: 'amber', change: '2 due today' },
    { label: 'Overtime Hours', value: '8.5', icon: 'schedule', color: 'purple', change: 'This month' },
];

const recentActivities = [
    { id: 1, action: 'Checked in', time: '09:02 AM', date: 'Today', icon: 'login', color: 'primary' },
    { id: 2, action: 'Leave request submitted', time: '03:30 PM', date: 'Yesterday', icon: 'event_note', color: 'blue' },
    { id: 3, action: 'Task completed: Q4 Report', time: '11:45 AM', date: 'Yesterday', icon: 'task_alt', color: 'green' },
    { id: 4, action: 'Payslip downloaded', time: '02:15 PM', date: 'Jan 12', icon: 'download', color: 'gray' },
    { id: 5, action: 'Profile updated', time: '10:00 AM', date: 'Jan 10', icon: 'edit', color: 'purple' },
];

const upcomingEvents = [
    { id: 1, title: 'Team Meeting', time: '10:00 AM - 11:00 AM', date: 'Today', type: 'meeting' },
    { id: 2, title: 'Project Deadline', time: 'All day', date: 'Tomorrow', type: 'deadline' },
    { id: 3, title: 'Training Session', time: '2:00 PM - 4:00 PM', date: 'Jan 20', type: 'training' },
    { id: 4, title: 'Team Outing', time: 'All day', date: 'Jan 25', type: 'event' },
];

const quickActions = [
    { label: 'Check In', icon: 'login', color: 'primary' },
    { label: 'Request Leave', icon: 'event_note', color: 'blue' },
    { label: 'View Payslip', icon: 'receipt_long', color: 'green' },
    { label: 'Submit Expense', icon: 'payments', color: 'amber' },
];

const approvalSummary = {
    leave: 2, explanation: 1, overtime: 1, expense: 1, carBooking: 3, advance: 2, total: 10
};

const birthdaysThisMonth = [
    { id: 1, name: 'Anna Martinez', avatar: 'https://ui-avatars.com/api/?name=Anna+Martinez&background=e11d48&color=fff', department: 'Marketing', birthday: 'Jan 18', daysUntil: 3 },
    { id: 2, name: 'Robert Kim', avatar: 'https://ui-avatars.com/api/?name=Robert+Kim&background=2CB34A&color=fff', department: 'Engineering', birthday: 'Jan 22', daysUntil: 7 },
    { id: 3, name: 'Jessica Taylor', avatar: 'https://ui-avatars.com/api/?name=Jessica+Taylor&background=6366f1&color=fff', department: 'Design', birthday: 'Jan 25', daysUntil: 10 },
    { id: 4, name: 'Kevin Wang', avatar: 'https://ui-avatars.com/api/?name=Kevin+Wang&background=f59e0b&color=fff', department: 'Sales', birthday: 'Jan 30', daysUntil: 15 },
];

const announcements = [
    { id: 1, title: 'Year-End Performance Review Guidelines', category: 'HR Policy', date: 'Jan 15, 2024', icon: 'policy', isNew: true, isPinned: true },
    { id: 2, title: 'Office Closure: Lunar New Year 2024', category: 'Announcement', date: 'Jan 12, 2024', icon: 'celebration', isNew: true, isPinned: false },
    { id: 3, title: 'New Health Insurance Benefits', category: 'Benefits', date: 'Jan 10, 2024', icon: 'health_and_safety', isNew: false, isPinned: false },
    { id: 4, title: 'Q1 2024 Company Goals & Objectives', category: 'Company News', date: 'Jan 8, 2024', icon: 'flag', isNew: false, isPinned: false },
];

const newEmployees = [
    { id: 1, name: 'Daniel Park', avatar: 'https://ui-avatars.com/api/?name=Daniel+Park&background=0d9488&color=fff', department: 'Engineering', position: 'Full Stack Developer', daysAgo: 0 },
    { id: 2, name: 'Sophia Lee', avatar: 'https://ui-avatars.com/api/?name=Sophia+Lee&background=8b5cf6&color=fff', department: 'Product', position: 'Product Manager', daysAgo: 5 },
    { id: 3, name: 'Marcus Johnson', avatar: 'https://ui-avatars.com/api/?name=Marcus+Johnson&background=ef4444&color=fff', department: 'Sales', position: 'Account Executive', daysAgo: 10 },
    { id: 4, name: 'Emma Wilson', avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=2CB34A&color=fff', department: 'HR', position: 'HR Coordinator', daysAgo: 18 },
];

const upcomingLeaves = [
    { id: 1, name: 'Sarah Johnson', avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff', department: 'Marketing', leaveType: 'Annual Leave', startDate: 'Jan 16', endDate: 'Jan 18', days: 3, status: 'approved' },
    { id: 2, name: 'Michael Chen', avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=0d9488&color=fff', department: 'Engineering', leaveType: 'Work From Home', startDate: 'Jan 17', endDate: 'Jan 17', days: 1, status: 'approved' },
    { id: 3, name: 'Emily Davis', avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=f59e0b&color=fff', department: 'Design', leaveType: 'Sick Leave', startDate: 'Jan 18', endDate: 'Jan 19', days: 2, status: 'approved' },
    { id: 4, name: 'David Wilson', avatar: 'https://ui-avatars.com/api/?name=David+Wilson&background=ef4444&color=fff', department: 'Sales', leaveType: 'Annual Leave', startDate: 'Jan 20', endDate: 'Jan 24', days: 5, status: 'approved' },
    { id: 5, name: 'Lisa Thompson', avatar: 'https://ui-avatars.com/api/?name=Lisa+Thompson&background=8b5cf6&color=fff', department: 'HR', leaveType: 'Personal Leave', startDate: 'Jan 22', endDate: 'Jan 22', days: 1, status: 'approved' },
    { id: 6, name: 'James Brown', avatar: 'https://ui-avatars.com/api/?name=James+Brown&background=2CB34A&color=fff', department: 'Finance', leaveType: 'Annual Leave', startDate: 'Jan 25', endDate: 'Jan 28', days: 4, status: 'pending' },
];

const isManager = true;

const getIconClass = (color: string) => {
    const map: Record<string, string> = {
        primary: 'icon-box icon-primary',
        blue: 'icon-box icon-blue',
        green: 'icon-box icon-green',
        amber: 'icon-box icon-amber',
        purple: 'icon-box icon-purple',
        gray: 'bg-secondary-100',
    };
    return map[color] || 'icon-box icon-primary';
};

const getStatBarColor = (color: string) => {
    const map: Record<string, string> = {
        primary: 'bg-primary-500', blue: 'bg-blue-500', amber: 'bg-amber-500', purple: 'bg-purple-500',
    };
    return map[color] || 'bg-primary-500';
};

const getLeaveTypeBadge = (type: string) => {
    const map: Record<string, string> = {
        'Annual Leave': 'bg-blue-50 text-blue-700',
        'Sick Leave': 'bg-rose-50 text-rose-700',
        'Personal Leave': 'bg-purple-50 text-purple-700',
    };
    return map[type] || 'bg-teal-50 text-teal-700';
};

const getEventDotClass = (type: string) => {
    const map: Record<string, string> = {
        meeting: 'bg-primary-500 ring-primary-500',
        deadline: 'bg-accent-rose ring-accent-rose',
        training: 'bg-accent-indigo ring-accent-indigo',
    };
    return map[type] || 'bg-purple-500 ring-purple-500';
};

export const Dashboard: React.FC = () => {
    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-secondary-900">
                        Welcome back, <span className="gradient-text">John</span>! 👋
                    </h1>
                    <p className="text-secondary-500 text-sm mt-0.5">
                        Here's what's happening with your work today.
                    </p>
                </div>
            </div>

            {/* Quick Actions (Mobile) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:hidden">
                {quickActions.map((action, i) => (
                    <button
                        key={action.label}
                        className="flex flex-col items-center justify-center p-3 card group cursor-pointer"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${getIconClass(action.color)}`}>
                            <span className="material-symbols-outlined text-xl">{action.icon}</span>
                        </div>
                        <span className="text-xs font-semibold text-secondary-700 group-hover:text-primary-600 transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {stats.map((stat, i) => (
                    <div key={stat.label} className="card group cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-secondary-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-secondary-900 mt-1.5 group-hover:text-primary-600 transition-colors">{stat.value}</p>
                                <p className="text-xs text-secondary-400 mt-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs text-primary-500">trending_up</span>
                                    {stat.change}
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${getIconClass(stat.color)}`}>
                                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                            </div>
                        </div>
                        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ease-out ${getStatBarColor(stat.color)}`} style={{ width: '75%' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Manager Approval Section */}
            {isManager && (
                <div className="card border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="icon-box icon-amber">
                                <span className="material-symbols-outlined text-lg">approval</span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-secondary-900">Pending Approvals</h2>
                                <p className="text-xs text-secondary-500">{approvalSummary.total} requests waiting for your approval</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Leave', count: approvalSummary.leave, icon: 'event_note', colorScheme: 'blue' },
                            { label: 'Overtime', count: approvalSummary.overtime, icon: 'schedule', colorScheme: 'orange' },
                            { label: 'Explanation', count: approvalSummary.explanation, icon: 'help_outline', colorScheme: 'purple' },
                            { label: 'Car Booking', count: approvalSummary.carBooking, icon: 'directions_car', colorScheme: 'green' },
                            { label: 'Advance', count: approvalSummary.advance, icon: 'request_quote', colorScheme: 'cyan' },
                            { label: 'Expense Claim', count: approvalSummary.expense, icon: 'payments', colorScheme: 'teal' },
                        ].map((item) => (
                            <a key={item.label} href="#" className={`group p-3 rounded-lg border border-${item.colorScheme}-100 bg-${item.colorScheme}-50/50 hover:bg-${item.colorScheme}-100 hover:border-${item.colorScheme}-200 transition-all cursor-pointer hover:shadow-md`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-8 h-8 rounded-lg bg-${item.colorScheme}-100 flex items-center justify-center group-hover:bg-${item.colorScheme}-200 transition-colors`}>
                                        <span className={`material-symbols-outlined text-${item.colorScheme}-600 text-lg`}>{item.icon}</span>
                                    </div>
                                    <span className={`text-xl font-bold text-${item.colorScheme}-700`}>{item.count}</span>
                                </div>
                                <p className={`text-sm font-semibold text-${item.colorScheme}-800`}>{item.label}</p>
                                <p className={`text-xs text-${item.colorScheme}-600 mt-0.5 flex items-center gap-1`}>
                                    View all <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </p>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Grid: Recent Activity + Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Activity */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="icon-box icon-primary">
                                <span className="material-symbols-outlined text-lg">history</span>
                            </div>
                            <h2 className="text-base font-bold text-secondary-900">Recent Activity</h2>
                        </div>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors">
                            View all
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                    <div className="space-y-2">
                        {recentActivities.map((activity, i) => (
                            <div
                                key={activity.id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50/80 transition-all duration-200 group cursor-pointer border border-transparent hover:border-secondary-100"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${getIconClass(activity.color)}`}>
                                    <span className={`material-symbols-outlined text-base ${activity.color === 'gray' ? 'text-secondary-600' : ''}`}>
                                        {activity.icon}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">{activity.action}</p>
                                    <p className="text-xs text-secondary-500">{activity.date} at {activity.time}</p>
                                </div>
                                <span className="material-symbols-outlined text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="icon-box icon-blue">
                                <span className="material-symbols-outlined text-lg">calendar_today</span>
                            </div>
                            <h2 className="text-base font-bold text-secondary-900">Upcoming Events</h2>
                        </div>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">View all</button>
                    </div>
                    <div className="space-y-3">
                        {upcomingEvents.map((event, i) => (
                            <div
                                key={event.id}
                                className="p-3 rounded-lg border border-secondary-100 hover:border-primary-200 hover:shadow-md transition-all duration-200 group cursor-pointer bg-gradient-to-r from-white to-secondary-50/50"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex items-start gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ring-4 ring-opacity-20 ${getEventDotClass(event.type)}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">{event.title}</p>
                                        <p className="text-xs text-secondary-500 mt-0.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">schedule</span>
                                            {event.time}
                                        </p>
                                        <span className={`inline-flex items-center text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full ${event.date === 'Today' ? 'bg-primary-100 text-primary-700' :
                                                event.date === 'Tomorrow' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-secondary-100 text-secondary-600'
                                            }`}>
                                            {event.date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Leave Schedule */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="icon-box icon-amber">
                            <span className="material-symbols-outlined">groups</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-secondary-900">Team Leave Schedule</h2>
                            <p className="text-xs text-secondary-500">Employees on leave in the next 2 weeks</p>
                        </div>
                    </div>
                    <Link to="/hrm/team-leave-schedule" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors">
                        View calendar
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Leave Type</th>
                                <th>Duration</th>
                                <th>Days</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingLeaves.map((leave, i) => (
                                <tr key={leave.id} className="group" style={{ animationDelay: `${i * 50}ms` }}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={leave.avatar}
                                                alt={leave.name}
                                                className="w-9 h-9 rounded-lg ring-2 ring-white shadow-sm group-hover:ring-primary-200 transition-all"
                                            />
                                            <span className="text-sm font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">{leave.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="text-sm text-secondary-600">{leave.department}</span></td>
                                    <td>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getLeaveTypeBadge(leave.leaveType)}`}>
                                            {leave.leaveType}
                                        </span>
                                    </td>
                                    <td><span className="text-sm text-secondary-600">{leave.startDate} - {leave.endDate}</span></td>
                                    <td>
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-secondary-100 text-sm font-bold text-secondary-700">
                                            {leave.days}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${leave.status === 'approved' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${leave.status === 'approved' ? 'bg-primary-500' : 'bg-amber-500'
                                                }`} />
                                            {leave.status === 'approved' ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Three Column Section: Birthdays, Announcements, New Employees */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Birthdays */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="icon-box" style={{ background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(225, 29, 72, 0.05))', color: '#e11d48' }}>
                                <span className="material-symbols-outlined">cake</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-secondary-900">Birthdays</h2>
                                <p className="text-xs text-secondary-500">This month</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-sm font-bold text-rose-700">{birthdaysThisMonth.length}</span>
                    </div>
                    <div className="space-y-3">
                        {birthdaysThisMonth.map((emp, i) => (
                            <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50/50 transition-all group cursor-pointer border border-transparent hover:border-rose-100" style={{ animationDelay: `${i * 50}ms` }}>
                                <div className="relative">
                                    <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-lg ring-2 ring-white shadow-sm group-hover:ring-rose-200 transition-all" />
                                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs">🎂</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-secondary-900 group-hover:text-rose-600 transition-colors truncate">{emp.name}</p>
                                    <p className="text-xs text-secondary-500">{emp.department}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-rose-600">{emp.birthday}</p>
                                    <p className="text-xs text-secondary-400">
                                        {emp.daysUntil === 0 ? 'Today! 🎉' : emp.daysUntil === 1 ? 'Tomorrow' : `In ${emp.daysUntil} days`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/hrm/birthdays" className="w-full mt-4 py-2.5 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center gap-2">
                        View all birthdays
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>

                {/* Announcements */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="icon-box icon-blue">
                                <span className="material-symbols-outlined">campaign</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-secondary-900">Announcements</h2>
                                <p className="text-xs text-secondary-500">Company news & updates</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">2 New</span>
                    </div>
                    <div className="space-y-3">
                        {announcements.map((ann, i) => (
                            <div
                                key={ann.id}
                                className={`p-3 rounded-xl border border-secondary-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group cursor-pointer ${ann.isPinned ? 'border-l-4 border-l-blue-500' : ''
                                    }`}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                                        <span className="material-symbols-outlined text-secondary-600 group-hover:text-blue-600 transition-colors text-lg">{ann.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-secondary-900 group-hover:text-blue-600 transition-colors truncate">{ann.title}</p>
                                            {ann.isNew && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-rose-500 text-white flex-shrink-0">NEW</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-secondary-500 mt-0.5 flex items-center gap-2">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{ann.category}</span>
                                            {ann.date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/hrm/announcements" className="w-full mt-4 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center gap-2">
                        View all announcements
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>

                {/* New Employees */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="icon-box icon-green">
                                <span className="material-symbols-outlined">person_add</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-secondary-900">New Employees</h2>
                                <p className="text-xs text-secondary-500">Last 30 days</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-sm font-bold text-primary-700">{newEmployees.length}</span>
                    </div>
                    <div className="space-y-3">
                        {newEmployees.map((emp, i) => (
                            <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50/50 transition-all group cursor-pointer border border-transparent hover:border-primary-100" style={{ animationDelay: `${i * 50}ms` }}>
                                <div className="relative">
                                    <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-lg ring-2 ring-white shadow-sm group-hover:ring-primary-200 transition-all" />
                                    {emp.daysAgo <= 7 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">✨</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors truncate">{emp.name}</p>
                                    <p className="text-xs text-secondary-500">{emp.position}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-secondary-600">{emp.department}</p>
                                    <p className="text-xs text-secondary-400">
                                        {emp.daysAgo === 0 ? 'Today' : emp.daysAgo === 1 ? 'Yesterday' : `${emp.daysAgo} days ago`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2.5 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all flex items-center justify-center gap-2">
                        View all new hires
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>

            {/* Attendance Summary */}
            <div className="card overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-teal to-primary-500" />
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="icon-box icon-primary">
                                <span className="material-symbols-outlined">schedule</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-secondary-900">Today's Attendance</h2>
                                <p className="text-secondary-500 text-sm">January 15, 2024 • Monday</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-8">
                        <div className="text-center group">
                            <p className="text-xs text-secondary-500 uppercase tracking-wider font-bold">Check In</p>
                            <p className="text-2xl font-bold text-primary-600 mt-1 group-hover:scale-110 transition-transform">09:02 AM</p>
                        </div>
                        <div className="text-center group">
                            <p className="text-xs text-secondary-500 uppercase tracking-wider font-bold">Check Out</p>
                            <p className="text-2xl font-bold text-secondary-300 mt-1">-- : --</p>
                        </div>
                        <div className="text-center group">
                            <p className="text-xs text-secondary-500 uppercase tracking-wider font-bold">Working Hours</p>
                            <p className="text-2xl font-bold text-secondary-900 mt-1 group-hover:scale-110 transition-transform">4h 30m</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-secondary-500 uppercase tracking-wider font-bold">Status</p>
                            <span
                                className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold mt-1"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(44, 179, 74, 0.15), rgba(44, 179, 74, 0.05))',
                                    color: '#16a34a',
                                    border: '1px solid rgba(44, 179, 74, 0.2)',
                                }}
                            >
                                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse" />
                                Working
                            </span>
                        </div>
                    </div>
                    <button className="btn-primary whitespace-nowrap">
                        <span className="material-symbols-outlined text-lg mr-2">logout</span>
                        Check Out
                    </button>
                </div>
            </div>
        </div>
    );
};
