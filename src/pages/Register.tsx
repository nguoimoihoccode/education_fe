import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, UserPlus, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import './Stock.css';

export const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const checkStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    return score;
  };

  const strength = checkStrength(password);

  // Sync store error to local state
  useState(() => {
    if (error) {
      setLocalError(error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (password !== confirmPassword) {
      setLocalError('Mật khẩu không khớp');
      return;
    }
    if (password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await register(email, password);
      toast.success('Tạo tài khoản thành công!');
      navigate('/education');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Đăng ký thất bại';
      setLocalError(msg || 'Đăng ký thất bại');
      toast.error(msg || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="stock-page-container flex items-center justify-center min-h-screen relative overflow-hidden">
      {/* Ambient Background */}
      <div className="stock-ambient-bg">
        <div className="stock-orb stock-orb-1" style={{ width: '60vw', background: 'rgba(245, 158, 11, 0.2)' }}></div>
        <div className="stock-orb stock-orb-2" style={{ width: '50vw', background: 'rgba(139, 92, 246, 0.2)' }}></div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10 fade-in-entry">
        <div className="stock-glass-card p-8 shadow-2xl border-slate-700/30 bg-slate-900/60 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white font-display">Tạo tài khoản</h1>
            <p className="text-slate-400 mt-2">Tham gia cùng chúng tôi</p>
          </div>

          {/* Features Badges */}
          <div className="flex justify-center gap-3 mb-8">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider"><ShieldCheck className="w-3 h-3" /> Bảo mật</div>
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider"><Zap className="w-3 h-3" /> Nhanh</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(localError || error) && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {localError || error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-primary-500 transition-all placeholder:text-slate-600 focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-primary-500 transition-all placeholder:text-slate-600 focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
              {/* Strength Bar */}
              {password && (
                <div className="flex gap-1 h-1.5 mt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 rounded-full transition-all",
                        i <= strength
                          ? (strength > 2 ? 'bg-emerald-500' : 'bg-amber-500')
                          : 'bg-slate-800'
                      )}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-primary-500 transition-all placeholder:text-slate-600 focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-lg shadow-lg hover:shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-400">
            Đã có tài khoản? <Link to="/login" className="text-primary-400 font-bold hover:text-primary-300">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};