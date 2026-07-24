import {
  Mail, Calendar, Camera, Edit3, Save, X, LogOut,
  Sparkles, BarChart2, Shield, Settings,
} from 'lucide-react';
import { useProfileData } from './user-profile/hooks/useProfileData';
import OverviewTab from './user-profile/components/OverviewTab';
import SecurityTab from './user-profile/components/SecurityTab';
import PreferencesTab from './user-profile/components/PreferencesTab';
import './Education.css';

const tabs = [
  { id: 'overview' as const, label: 'Overview', icon: BarChart2 },
  { id: 'security' as const, label: 'Security', icon: Shield },
  { id: 'preferences' as const, label: 'Settings', icon: Settings },
];

export default function UserProfile() {
  const {
    user,
    isEditing,
    setIsEditing,
    activeTab,
    setActiveTab,
    editForm,
    setEditForm,
    showPassword,
    setShowPassword,
    passwordForm,
    setPasswordForm,
    avatarInputRef,
    progress,
    streak,
    quizStats,
    memberSince,
    isSavingProfile,
    isChangingPassword,
    handleSaveProfile,
    handleChangePassword,
    handleAvatarUpload,
    handleLogout,
  } = useProfileData();

  return (
    <div className="education-container education-path-page" style={{ color: 'var(--app-text)' }}>
      <div className="dashboard-wrapper">
        {/* Hero / Profile Header */}
        <div className="relative mb-10">
          <div className="absolute inset-0 -top-20 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-[120px]" />
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-fuchsia-600/8 rounded-full blur-[100px]" />
          </div>
          <div className="relative bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
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
                        <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl md:text-6xl font-black text-accent-400">
                          {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-10 h-10 rounded-xl bg-accent-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>

                {/* Name & Info */}
                <div className="flex-1 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-1">{user?.displayName || 'User'}</h1>
                  <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {user?.email || 'email@example.com'}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-accent-500/10 text-accent-400 border border-accent-500/20 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Pro Learner
                    </span>
                    <span className="text-xs text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Member since {memberSince}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-2">
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all">
                      <Edit3 className="w-4 h-4 text-accent-400" /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={handleSaveProfile} disabled={isSavingProfile}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                        <Save className="w-4 h-4" /> {isSavingProfile ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => { setIsEditing(false); setEditForm({ displayName: user?.displayName || '', phone: user?.phone || '' }); }}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 p-1.5 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/5 w-fit">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab isEditing={isEditing} editForm={editForm} setEditForm={setEditForm}
            progress={progress} streak={streak} quizStats={quizStats} user={user} memberSince={memberSince} />
        )}
        {activeTab === 'security' && (
          <SecurityTab showPassword={showPassword} setShowPassword={setShowPassword}
            passwordForm={passwordForm} setPasswordForm={setPasswordForm}
            handleChangePassword={handleChangePassword} isChangingPassword={isChangingPassword} />
        )}
        {activeTab === 'preferences' && <PreferencesTab />}
      </div>
    </div>
  );
}
