import { Bell, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '@/store/settings.store';
import { ToggleRow } from './SharedComponents';

export default function PreferencesTab() {
  const s = useSettingsStore();

  const handleUnavailableDangerAction = (label: string) => {
    toast(`Chưa hỗ trợ ${label}. Liên hệ support@edupro.local`, { icon: '⚠️' });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
          <Bell className="w-5 h-5 text-accent-400" /> Notifications
        </h3>
        <div className="space-y-4">
          <ToggleRow label="Daily Reminder" description="Get reminders to study every day" checked={s.pushNotif} onChange={() => s.updateSetting('pushNotif', !s.pushNotif)} />
          <ToggleRow label="Quiz Results" description="Notify when quiz results are available" checked={s.quizResults} onChange={() => s.updateSetting('quizResults', !s.quizResults)} />
          <ToggleRow label="Streak Alerts" description="Alert when your streak is about to end" checked={s.streakReminder} onChange={() => s.updateSetting('streakReminder', !s.streakReminder)} />
          <ToggleRow label="New Courses" description="Notify about new courses and content" checked={s.communityMentions} onChange={() => s.updateSetting('communityMentions', !s.communityMentions)} />
          <ToggleRow label="Email Digest" description="Weekly summary of your learning progress" checked={s.emailDigest} onChange={() => s.updateSetting('emailDigest', !s.emailDigest)} />
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
          <Settings className="w-5 h-5 text-emerald-400" /> Learning Settings
        </h3>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Daily Goal (minutes)</label>
            <select value={s.dailyGoal} onChange={(e) => s.updateSetting('dailyGoal', e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all appearance-none cursor-pointer">
              <option className="bg-slate-800" value="10">10 min / day</option>
              <option className="bg-slate-800" value="15">15 min / day</option>
              <option className="bg-slate-800" value="20">20 min / day</option>
              <option className="bg-slate-800" value="30">30 min / day</option>
              <option className="bg-slate-800" value="60">60 min / day</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Flashcard Order</label>
            <select value={s.flashcardOrder} onChange={(e) => s.updateSetting('flashcardOrder', e.target.value)}
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

      <div className="bg-slate-800/80 backdrop-blur-md border border-rose-500/20 rounded-3xl p-8">
        <h3 className="text-xl font-black font-headline text-rose-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-400 mb-6">These actions are permanent and cannot be undone.</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleUnavailableDangerAction('xóa toàn bộ dữ liệu')}
            className="px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all"
          >
            Delete All Data
          </button>
          <button
            type="button"
            onClick={() => handleUnavailableDangerAction('xóa tài khoản')}
            className="px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
