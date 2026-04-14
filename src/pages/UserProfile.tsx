import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  LogOut,
  BookOpen,
  Brain,
  Trophy,
  Flame,
  Clock,
  Target,
  TrendingUp,
  Award,
  Settings,
  Key,
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  Zap,
  BarChart2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getUserProgress, getUserStreak } from '@/api/education.api';
import { getQuizStats } from '@/api/quiz.api';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import { useSettingsStore } from '@/store/settings.store';
import './Education.css';

export default function UserProfile() {
  const { user, setUser, logout } = useAuthStore();
  const s = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'preferences'>('overview');
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Fetch learning stats
  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: getUserProgress,
    enabled: !!user,
  });

  const { data: streak } = useQuery({
    queryKey: ['userStreak'],
    queryFn: getUserStreak,
    enabled: !!user,
  });

  const { data: quizStats } = useQuery({
    queryKey: ['quizStats'],
    queryFn: getQuizStats,
    enabled: !!user,
  });

  const handleSaveProfile = async () => {
    try {
      const response = await apiClient.patch('/auth/profile', editForm);
      setUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch {
      toast.error('Failed to change password');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await apiClient.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(response.data);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart2 },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'preferences' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        {/* ============ HERO / Profile Header ============ */}
        <div className="relative mb-10">
          {/* Ambient background gradient */}
          <div className="absolute inset-0 -top-20 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-[120px]" />
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-fuchsia-600/8 rounded-full blur-[100px]" />
          </div>

          <div className="relative bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            {/* Cover gradient bar */}
            <div className="h-32 md:h-40 bg-gradient-to-r from-accent-900/60 via-fuchsia-900/40 to-indigo-900/60 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            </div>

            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-accent-600 to-fuchsia-600 p-1 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <div className="w-full h-full rounded-[22px] bg-slate-800 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl md:text-6xl font-black text-accent-400">
                          {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-10 h-10 rounded-xl bg-accent-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                {/* Name & Info */}
                <div className="flex-1 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-1">
                    {user?.displayName || 'User'}
                  </h1>
                  <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email || 'email@example.com'}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-accent-500/10 text-accent-400 border border-accent-500/20 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Pro Learner
                    </span>
                    <span className="text-xs text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      Member since {memberSince}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-accent-400" />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({ displayName: user?.displayName || '', phone: user?.phone || '' });
                        }}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ Tab Navigation ============ */}
        <div className="flex gap-2 mb-8 p-1.5 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/5 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============ Tab Content ============ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Edit Profile Form */}
            {isEditing && (
              <div className="bg-slate-800/80 backdrop-blur-md border border-accent-500/20 rounded-3xl p-8 shadow-[0_0_30px_rgba(139,92,246,0.05)]">
                <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-accent-400" />
                  Edit Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+84 123 456 789"
                      className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Learning Stats */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Learning Progress</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Flame}
                  value={streak?.currentStreak || 0}
                  label="Day Streak"
                  color="amber"
                  suffix=" 🔥"
                />
                <StatCard
                  icon={BookOpen}
                  value={progress?.completedLessons || 0}
                  label="Lessons Done"
                  color="violet"
                />
                <StatCard
                  icon={Brain}
                  value={progress?.learnedVocabularies || 0}
                  label="Vocab Learned"
                  color="fuchsia"
                />
                <StatCard
                  icon={Clock}
                  value={progress?.streak?.totalXp || 0}
                  label="Total XP"
                  color="emerald"
                />
              </div>
            </div>

            {/* Quiz Performance */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quiz Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Trophy}
                  value={quizStats?.totalQuizzes || 0}
                  label="Quizzes Taken"
                  color="amber"
                />
                <StatCard
                  icon={Target}
                  value={Math.round(quizStats?.averageScore || 0)}
                  label="Avg Score"
                  color="violet"
                  suffix="%"
                />
                <StatCard
                  icon={Award}
                  value={quizStats?.passedQuizzes || 0}
                  label="Passed"
                  color="emerald"
                />
                <StatCard
                  icon={TrendingUp}
                  value={quizStats?.highestScore || 0}
                  label="Best Score"
                  color="fuchsia"
                  suffix="%"
                />
              </div>
            </div>

            {/* Profile Details Card */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
                <User className="w-5 h-5 text-accent-400" />
                Account Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <DetailRow icon={User} label="Display Name" value={user?.displayName || '--'} />
                <DetailRow icon={Mail} label="Email Address" value={user?.email || '--'} />
                <DetailRow icon={Phone} label="Phone Number" value={user?.phone || 'Not set'} />
                <DetailRow icon={Calendar} label="Member Since" value={memberSince} />
                <DetailRow icon={Shield} label="Account Status" value="Active" valueColor="text-emerald-400" />
                <DetailRow icon={Zap} label="Plan" value="Pro Learner" valueColor="text-accent-400" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent-400" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  { icon: BookOpen, label: 'Completed Spanish Lesson 5', time: '2 hours ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { icon: Brain, label: 'Reviewed 25 flashcards', time: '5 hours ago', color: 'text-accent-400', bg: 'bg-accent-500/10' },
                  { icon: Trophy, label: 'Passed Grammar Quiz with 92%', time: '1 day ago', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { icon: Flame, label: '7-day streak achieved!', time: '2 days ago', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                  { icon: Award, label: 'Earned "Fast Learner" badge', time: '3 days ago', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
                ].map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/[0.02] transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{activity.label}</p>
                      <p className="text-xs text-slate-500 font-medium">{activity.time}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8 max-w-2xl">
            {/* Change Password */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
                <Key className="w-5 h-5 text-accent-400" />
                Change Password
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all pr-12"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Key className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                Active Sessions
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      Current Session
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium">macOS • Chrome • Ho Chi Minh City</p>
                  </div>
                  <span className="text-xs text-slate-500 font-bold">Now</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-8 max-w-2xl">
            {/* Notification Preferences */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
                <Bell className="w-5 h-5 text-accent-400" />
                Notifications
              </h3>
              <div className="space-y-4">
                <ToggleRow label="Daily Reminder" description="Get reminders to study every day" checked={s.pushNotif} onChange={() => s.updateSetting('pushNotif', !s.pushNotif)} />
                <ToggleRow label="Quiz Results" description="Notify when quiz results are available" checked={s.quizResults} onChange={() => s.updateSetting('quizResults', !s.quizResults)} />
                <ToggleRow label="Streak Alerts" description="Alert when your streak is about to end" checked={s.streakReminder} onChange={() => s.updateSetting('streakReminder', !s.streakReminder)} />
                <ToggleRow label="New Courses" description="Notify about new courses and content" checked={s.communityMentions} onChange={() => s.updateSetting('communityMentions', !s.communityMentions)} />
                <ToggleRow label="Email Digest" description="Weekly summary of your learning progress" checked={s.emailDigest} onChange={() => s.updateSetting('emailDigest', !s.emailDigest)} />
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
                <Settings className="w-5 h-5 text-emerald-400" />
                Learning Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Daily Goal (minutes)
                  </label>
                  <select 
                    value={s.dailyGoal}
                    onChange={(e) => s.updateSetting('dailyGoal', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all appearance-none cursor-pointer">
                    <option className="bg-slate-800" value="10">10 min / day</option>
                    <option className="bg-slate-800" value="15">15 min / day</option>
                    <option className="bg-slate-800" value="20">20 min / day</option>
                    <option className="bg-slate-800" value="30">30 min / day</option>
                    <option className="bg-slate-800" value="60">60 min / day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Flashcard Order
                  </label>
                  <select 
                    value={s.flashcardOrder}
                    onChange={(e) => s.updateSetting('flashcardOrder', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all appearance-none cursor-pointer">
                    <option className="bg-slate-800" value="spaced">Spaced Repetition (Optimal)</option>
                    <option className="bg-slate-800" value="random">Random Order</option>
                    <option className="bg-slate-800" value="oldest">Oldest First</option>
                    <option className="bg-slate-800" value="newest">Newest First</option>
                  </select>
                </div>
                <ToggleRow label="Sound Effects" description="Play sounds for correct/incorrect answers" checked={s.soundEffects} onChange={() => s.updateSetting('soundEffects', !s.soundEffects)} />
                <ToggleRow label="Auto-play Audio" description="Automatically play pronunciation audio" checked={s.autoPlay} onChange={() => s.updateSetting('autoPlay', !s.autoPlay)} />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-rose-500/20 rounded-3xl p-8">
              <h3 className="text-xl font-black font-headline text-rose-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-slate-400 mb-6">These actions are permanent and cannot be undone.</p>
              <div className="flex gap-4">
                <button className="px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all">
                  Delete All Data
                </button>
                <button className="px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Helper Components ============ */

function StatCard({
  icon: Icon,
  value,
  label,
  color,
  suffix = '',
}: {
  icon: any;
  value: number;
  label: string;
  color: 'violet' | 'emerald' | 'amber' | 'fuchsia';
  suffix?: string;
}) {
  const colorConfigs = {
    violet: { text: 'text-accent-400', glow: 'bg-accent-500/10 group-hover:bg-accent-500/20', icon: 'from-accent-500 to-indigo-500' },
    emerald: { text: 'text-emerald-400', glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20', icon: 'from-emerald-500 to-teal-500' },
    amber: { text: 'text-amber-400', glow: 'bg-amber-500/10 group-hover:bg-amber-500/20', icon: 'from-amber-500 to-orange-500' },
    fuchsia: { text: 'text-fuchsia-400', glow: 'bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20', icon: 'from-fuchsia-500 to-pink-500' },
  };
  const config = colorConfigs[color];

  return (
    <div className="group bg-slate-800/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden hover:-translate-y-0.5 hover:border-white/20 transition-all duration-300">
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[40px] transition-colors duration-500 ${config.glow}`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.icon} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`text-3xl font-black font-mono ${config.text}`}>
        {value}{suffix}
      </div>
      <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueColor = 'text-white',
}: {
  icon: any;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-bold ${valueColor} truncate`}>{value}</p>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/[0.02] transition-all">
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
          checked ? 'bg-accent-600' : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
