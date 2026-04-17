import { Key, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface SecurityTabProps {
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  passwordForm: { currentPassword: string; newPassword: string; confirmPassword: string };
  setPasswordForm: (form: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  handleChangePassword: () => void;
  isChangingPassword?: boolean;
}

export default function SecurityTab({
  showPassword, setShowPassword, passwordForm, setPasswordForm, handleChangePassword, isChangingPassword,
}: SecurityTabProps) {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
          <Key className="w-5 h-5 text-accent-400" /> Change Password
        </h3>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all pr-12" />
              <button onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
            <input type="password" value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
            <input type="password" value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all" />
          </div>
          <button onClick={handleChangePassword}
            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || isChangingPassword}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
            <Key className="w-4 h-4" /> {isChangingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400" /> Active Sessions
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
  );
}
